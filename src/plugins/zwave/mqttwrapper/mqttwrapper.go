package mqttwrapper

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"time"

	"github.com/surgemq/message"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
	stormwrapper "github.com/think-free/storm-wrapper"
)

const (
	CWriteTopic  = "axihome/5/field/variable"
	CDeviceTopic = "axihome/5/field/device/discover"
)

type ZwaveDevice struct {
	ZwaveID string `storm:"id"`

	Name   string
	Group  string
	HomeID string

	DeviceType types.DeviceType
}

type ZwaveDeviceValue struct {
	ZwaveIDVariable string `storm:"id"`
	ZwaveID         string `storm:"index"`
	ZwaveVariable   string
	LocalVariable   string
	Value           interface{}
}

// MqttWrapper
type MqttWrapper struct {
	cli             *mqttclient.MqttClient
	db              *stormwrapper.Db
	subscribedWrite map[string]struct{}

	deviceMapping      map[string]string
	variableMapping    map[string]string
	variablesWrittable map[string]bool
}

// New create the mqttwrapper
func New(cli *mqttclient.MqttClient, db *stormwrapper.Db) *MqttWrapper {

	w := &MqttWrapper{
		cli:             cli,
		db:              db,
		subscribedWrite: make(map[string]struct{}),
	}
	return w
}

// Run start the wrapper
func (w *MqttWrapper) Run() {

	// Loading config files

	ok1 := ReadFile("./config/zwave/devices_mapping.json", &w.deviceMapping)
	if !ok1 {
		log.Println("Can't get mapping file devices_mapping")
	}

	ok2 := ReadFile("./config/zwave/variables_mapping.json", &w.variableMapping)
	if !ok2 {
		log.Println("Can't get mapping file variables_mapping")
	}

	ok3 := ReadFile("./config/zwave/variables_writtable.json", &w.variablesWrittable)
	if !ok3 {
		log.Println("Can't get mapping file variables_writtable")
	}

	// Subscribe to zwave topic

	w.cli.SubscribeTopic("zwave/updates/#", func(msg *message.PublishMessage) error {

		topic := string(msg.Topic())

		device := strings.TrimPrefix(topic, "zwave/updates/")

		var jsonMap map[string]interface{}
		json.Unmarshal(msg.Payload(), &jsonMap)

		log.Println("Processing device :", device)

		var devdb ZwaveDevice
		err := w.db.Get("ZwaveID", device, &devdb)
		if err != nil {

			// Save new device
			log.Println("Saving new zwave device :", device)
			devdb.ZwaveID = device
			devdb.HomeID = ""
			devdb.Group = ""
			devdb.Name = ""
			devdb.DeviceType = "custom"
			err := w.db.Save(&devdb)
			if err != nil {
				log.Println("Error saving zwave device :", err)
			}
		} else {

			if devdb.HomeID != "" && devdb.Group != "" && devdb.Name != "" {

				log.Println("Device is configured, writting values to axihome topic")

				// Write values to axihome if device has been configured
				for k, v := range jsonMap {

					id := strings.ToLower(k)

					log.Println("    |->", CWriteTopic+"/"+devdb.HomeID+"/"+devdb.Group+"/"+devdb.Name+"/"+id, "->", v)

					var sendValue interface{}

					// Transform value to match axihome standard
					switch v.(type) {
					case int:
						log.Println("Setting integer :", v)
						sendValue = v
					case float64:
						log.Println("Setting float64 :", v)
						sendValue = v
					case string:
						log.Println("Setting string :", v)
						sendValue = v.(string)
						if sendValue == "ON" || sendValue == "on" || sendValue == "On" {
							sendValue = 1
						} else if sendValue == "OFF" || sendValue == "off" || sendValue == "Off" {
							sendValue = 0
						} else {
							sendValue = v
						}
					case bool:
						log.Println("Setting boolean :", v)
						if v.(bool) == true {
							sendValue = 1
						} else {
							sendValue = 0
						}
					default:
						log.Println("Setting default :", v)
						sendValue = v
					}

					// Publish message
					w.cli.PublishMessage(CWriteTopic+"/"+devdb.HomeID+"/"+devdb.Group+"/"+devdb.Name+"/"+id, sendValue)
				}
			}
		}

		// Save device - values to database
		for k, v := range jsonMap {

			id := strings.ToLower(k)

			var deviceValue ZwaveDeviceValue
			deviceValue.ZwaveIDVariable = device + "." + id
			deviceValue.ZwaveID = device
			deviceValue.ZwaveVariable = k
			deviceValue.LocalVariable = id
			deviceValue.Value = v
			errVal := w.db.Save(&deviceValue)
			if errVal != nil {
				log.Println("Error saving zwave device value :", errVal)
			}
		}

		return nil
	})

	// Device autoregister

	for {

		var devdb []ZwaveDevice
		w.db.GetAll(&devdb)

		for _, dev := range devdb {

			if dev.HomeID != "" && dev.Group != "" && dev.Name != "" {

				log.Println("Generating autoregister message for", dev.HomeID+"."+dev.Group+"."+dev.Name)

				var variables []types.FieldVariables

				var devV []ZwaveDeviceValue
				err := w.db.GetFilter("ZwaveID", dev.ZwaveID, &devV)
				if err != nil {
					log.Println("Can't find values for device :", dev.ZwaveID)
					continue
				}

				devType := types.CustomDevice

				for _, v := range devV {

					log.Println("    > Adding variable :", v.LocalVariable, "to device")

					if devType == types.CustomDevice {
						devType = w.GetDeviceTypeFromVariable(v.LocalVariable)
					}

					variable := types.FieldVariables{
						Name:        v.LocalVariable,
						Type:        w.GetVariableType(v.LocalVariable),
						StatusTopic: CWriteTopic + "/" + dev.HomeID + "/" + dev.Group + "/" + dev.Name + "/" + v.LocalVariable,
					}

					if w.GetVariableWrittable(variable.Name) {

						log.Println("Variable writtable :", variable.Name)
						variable.CmdTopic = CWriteTopic + "/" + dev.HomeID + "/" + dev.Group + "/" + dev.Name + "/" + v.LocalVariable + "/cmd"
						w.SubscribeWriteTopic(dev, v)

					} else {

						log.Println("Variable not writtable :", variable.Name)
					}

					variables = append(variables, variable)
				}

				dev := types.FieldDevice{
					ID:   dev.ZwaveID,
					Type: devType,

					Name:   dev.Name,
					Group:  dev.Group,
					HomeID: dev.HomeID,

					Variables: variables,
				}

				w.cli.PublishMessageNoRetain(CDeviceTopic+"/"+dev.HomeID+"/"+dev.Group+"/"+dev.Name, &dev)
			}
		}

		time.Sleep(time.Second * 30)
	}
}

func (w *MqttWrapper) SubscribeWriteTopic(dev ZwaveDevice, variable ZwaveDeviceValue) {

	if _, ok := w.subscribedWrite[CWriteTopic+"/"+dev.HomeID+"/"+dev.Group+"/"+dev.Name+"/"+variable.LocalVariable+"/set"]; ok {

		log.Println("Already registered")
		return
	}

	// Registering subscription
	w.subscribedWrite[CWriteTopic+"/"+dev.HomeID+"/"+dev.Group+"/"+dev.Name+"/"+variable.LocalVariable+"/cmd"] = struct{}{}

	// Subscribing
	log.Println("Registering :", CWriteTopic+"/"+dev.HomeID+"/"+dev.Group+"/"+dev.Name+"/"+variable.LocalVariable+"/cmd")

	err := w.cli.SubscribeTopic(CWriteTopic+"/"+dev.HomeID+"/"+dev.Group+"/"+dev.Name+"/"+variable.LocalVariable+"/cmd", func(msg *message.PublishMessage) error {

		v := make(map[string]interface{})
		v[variable.ZwaveVariable] = msg.Payload

		log.Println("Writting to zwave device :", dev.HomeID+"."+dev.Group+"."+dev.Name+"."+variable.LocalVariable, "->", v)

		w.cli.PublishMessageNoRetain("zwave/set/"+dev.ZwaveID, &v)

		return nil
	})

	if err != nil {
		log.Println(err)
	}
}

func (w *MqttWrapper) GetDeviceTypeFromVariable(val string) types.DeviceType {

	ret := "custom"
	if val, ok := w.deviceMapping[val]; ok {
		ret = val
		log.Println("Detected device type :", ret)
		return types.GetDeviceTypeFromString(ret)
	}

	log.Println("Can't detect device type from map file, setting as :", ret)
	return types.GetDeviceTypeFromString(ret)
}

func (w *MqttWrapper) GetVariableType(value string) types.VariableType {

	ret := "custom"
	if val, ok := w.variableMapping[value]; ok {
		ret = val
	}

	return types.GetVariableTypeFromString(ret)
}

func (w *MqttWrapper) GetVariableWrittable(value string) bool {

	ret := false
	if val, ok := w.variablesWrittable[value]; ok {
		ret = val
	}

	return ret
}

func ReadFile(file string, dest interface{}) bool {

	raw, err := ioutil.ReadFile(file)
	if err != nil {
		fmt.Println(err.Error())
		return false
	}

	json.Unmarshal(raw, dest)
	return true
}
