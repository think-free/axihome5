package mqttwrapper

import (

	"log"
	"strings"
	"time"
	"encoding/json"

	"github.com/surgemq/message"
    "github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"
	"github.com/think-free/axihome5/src/core/types"
)

const (
	CWriteTopic  = "axihome/5/field/variable/"
	CDeviceTopic = "axihome/5/field/device/discover/"
)

type ZigbeeDevice struct {

	ZigbeeID string `storm:"id"`

	Name string
	Group string
	HomeID string

	DeviceType types.DeviceType
}

type ZigbeeDeviceValue struct {
	ZigbeeID string `storm:"id"`
	ValuesMap map[string]interface{}
}

// MqttWrapper
type MqttWrapper struct {

    cli *mqttclient.MqttClient
	db *stormwrapper.Db
}

// New create the mqttwrapper
func New(cli *mqttclient.MqttClient, db *stormwrapper.Db) *MqttWrapper {

	w := &MqttWrapper{
        cli: cli,
		db: db,
	}
	return w
}

// Run start the wrapper
func (w *MqttWrapper) Run() {

	// Subscribe to zigbee2mqtt topic

	w.cli.SubscribeTopic("zigbee2mqtt/#", func(msg *message.PublishMessage) error {

		topic := string(msg.Topic())

		if !strings.Contains(topic, "zigbee2mqtt/bridge"){

			device := strings.TrimPrefix(topic, "zigbee2mqtt/")

			var jsonMap map[string]interface{}
			json.Unmarshal(msg.Payload(), &jsonMap)

			log.Println("Processing device :")
			log.Println(device)
			log.Println(jsonMap)

			var devdb ZigbeeDevice
			err := w.db.Get("ZigbeeID", device, &devdb)
			if err != nil {

				// Save new device
				log.Println("Saving new zigbee device :", device)
				devdb.ZigbeeID = device
				devdb.HomeID = ""
				devdb.Group = ""
				devdb.Name = ""
				devdb.DeviceType = w.GetDeviceTypeFromMap(jsonMap)
				err := w.db.Save(&devdb)
				if err != nil{
					log.Println("Error saving zigbee device :", err)
				}
			} else {

				if devdb.HomeID != "" && devdb.Group != "" && devdb.Name != "" {

					log.Println("Writting values to axihome topic")

					// Write values to axihome if device has been configured
					for k, v := range jsonMap {

						// TODO : Transform value to match axihome standart
						w.cli.PublishMessage(CWriteTopic + "/" + devdb.HomeID + "/" + devdb.Group + "/" + devdb.Name + "/" + k, v)
					}
				}
			}

			// Save device - values to database
			var deviceValue ZigbeeDeviceValue
			deviceValue.ZigbeeID = device
			deviceValue.ValuesMap = jsonMap
			errVal := w.db.Save(&deviceValue)
			if errVal != nil{
				log.Println("Error saving zigbee device value :", errVal)
			}
		}

		return nil
	})

	// Device autoregister

	for {

		var devdb []ZigbeeDevice
		w.db.GetAll(&devdb)

		for _, dev := range devdb {

			var variables []types.FieldVariables

			var devV ZigbeeDeviceValue
			err := w.db.Get("ZigbeeID", dev.ZigbeeID ,&devV)
			if err != nil {
				log.Println("Can't find values for device :", dev.ZigbeeID)
				continue
			}

			for k, v := range devV.ValuesMap {

				variables = append(variables, types.FieldVariables{
					Name:        k,
					Type:        w.GetVariableType(k),
					StatusTopic: CWriteTopic + "/" + dev.HomeID + "/" + dev.Group + "/" + dev.Name + "/" + k,
				})
			}

			dev := types.FieldDevice{
				ID:   dev.ZigbeeID,
				Type: dev.DeviceType,

				Name:   dev.Name,
				Group:  dev.Group,
				HomeID: dev.HomeID,

				Variables: variables,
			}

			w.cli.PublishMessageNoRetain(CDeviceTopic + "/" + dev.HomeID + "/" + dev.Group + "/" + dev.Name, &dev)
		}

		time.Sleep(time.Second * 30)
	}
}

func (w *MqttWrapper) GetDeviceTypeFromMap(values map[string]interface{}) (ret types.DeviceType) {

	for key, _ := range values {
		switch key {

		case "temperature" :
		case "humidity" :
		case "pressure" :
			ret = types.Climate
		case "click":
		case "state":
			ret = types.Switch
		case "occupancy" :
			ret = types.Occupancy
		case "brightness":
		case "color_temp":
		case "color":
			ret = types.Light
		}
	}

	log.Println("Detected device type :", ret)

	return ret
}

func (w *MqttWrapper) GetVariableType(value string) (ret types.VariableType) {

	switch value {

	case "temperature" :
	case "humidity" :
	case "pressure" :
		ret = types.Number
	case "click":
		ret = types.Text
	case "occupancy" :
	case "state":
		ret = types.Digital
	case "brightness":
	case "color_temp":
		ret = types.Analog
	case "color":
		ret = types.RGB
	}

	return ret
}
