package mqttwrapper

import (

	"log"
	"strings"
	"encoding/json"

	"github.com/surgemq/message"
    "github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"
)

type InternalDevice struct {

	ZigbeeID string
	Home string
	Group string
	Instance string
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

	w.cli.SubscribeTopic("zigbee2mqtt/#", func(msg *message.PublishMessage) error {

		topic := string(msg.Topic())

		if !strings.Contains(topic, "zigbee2mqtt/bridge"){

			device := strings.TrimPrefix(topic, "zigbee2mqtt/")

			var jsonMap map[string]interface{}
			json.Unmarshal(msg.Payload(), &jsonMap)

			log.Println(device)
			log.Println(jsonMap)
		}

		return nil
	})
}
