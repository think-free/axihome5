package mqttwrapper

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"time"
	"strconv"

	"github.com/surgemq/message"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"
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
	ZwaveID  string `storm:"id"`
	ValuesMap map[string]interface{}
}

// MqttWrapper
type MqttWrapper struct {
	cli *mqttclient.MqttClient
	db  *stormwrapper.Db
}

// New create the mqttwrapper
func New(cli *mqttclient.MqttClient, db *stormwrapper.Db) *MqttWrapper {

	w := &MqttWrapper{
		cli: cli,
		db:  db,
	}
	return w
}

// Run start the wrapper
func (w *MqttWrapper) Run() {

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
			devdb.DeviceType = w.GetDeviceTypeFromMap(jsonMap)
			err := w.db.Save(&devdb)
			if err != nil {
				log.Println("Error saving zwave device :", err)
			}
		} else {

			if devdb.HomeID != "" && devdb.Group != "" && devdb.Name != "" {

				log.Println("Writting values to axihome topic")

				// Write values to axihome if device has been configured
				for k, v := range jsonMap {

					log.Println("    |->", CWriteTopic+"/"+devdb.HomeID+"/"+devdb.Group+"/"+devdb.Name+"/"+k, "->", v)

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
					w.cli.PublishMessage(CWriteTopic+"/"+devdb.HomeID+"/"+devdb.Group+"/"+devdb.Name+"/"+k, sendValue)
				}
			}
		}

		// Save device - values to database
		var deviceValue ZwaveDeviceValue
		deviceValue.ZwaveID = device
		deviceValue.ValuesMap = jsonMap
		errVal := w.db.Save(&deviceValue)
		if errVal != nil {
			log.Println("Error saving zwave device value :", errVal)
		}

		return nil
	})

	// Refresh devices

	for i := 2; i< 100; i++{

		is := strconv.Itoa(i)
		w.cli.PublishMessage("zwave/refresh/" + is, "")
	}

	// Device autoregister

	for {

		var devdb []ZwaveDevice
		w.db.GetAll(&devdb)

		for _, dev := range devdb {

			if dev.HomeID != "" && dev.Group != "" && dev.Name != "" {

				var variables []types.FieldVariables

				var devV ZwaveDeviceValue
				err := w.db.Get("ZwaveID", dev.ZwaveID, &devV)
				if err != nil {
					log.Println("Can't find values for device :", dev.ZwaveID)
					continue
				}

				for k, _ := range devV.ValuesMap {

					variables = append(variables, types.FieldVariables{
						Name:        k,
						Type:        w.GetVariableType(k),
						StatusTopic: CWriteTopic + "/" + dev.HomeID + "/" + dev.Group + "/" + dev.Name + "/" + k,
					})
				}

				dev := types.FieldDevice{
					ID:   dev.ZwaveID,
					Type: dev.DeviceType,

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

func (w *MqttWrapper) GetDeviceTypeFromMap(values map[string]interface{}) types.DeviceType {

	var mapping map[string]string
	ok := ReadFile("./zwave/devices_mapping.json", &mapping)
	if !ok {
		log.Println("Can't get mapping file")
		return types.CustomDevice
	}

	ret := "custom"
	for key := range values {

		if val, ok := mapping[key]; ok {
			ret = val
			log.Println("Detected device type :", ret)
			return types.GetDeviceTypeFromString(ret)
		}
	}

	log.Println("Can't detect device type from map file, setting as :", ret)
	return types.GetDeviceTypeFromString(ret)
}

func (w *MqttWrapper) GetVariableType(value string) types.VariableType {

	var mapping map[string]string
	ok := ReadFile("./zwave/variables_mapping.json", &mapping)
	if !ok {
		log.Println("Can't get mapping file")
		return types.CustomVariable
	}

	ret := "custom"
	if val, ok := mapping[value]; ok {
		ret = val
	}

	return types.GetVariableTypeFromString(ret)
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
