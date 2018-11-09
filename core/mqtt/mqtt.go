package mqtt

import (
	"encoding/json"
	"log"

	"github.com/surgemq/message"
	"github.com/think-free/axihome5/core/types"
	"github.com/think-free/mqttclient"
	stormwrapper "github.com/think-free/storm-wrapper"
)

// Mqtt topics
const (
	CAutoDiscover = "axihome/5/field/device/discover/#"
)

// Mqtt is the mqtt core client
type Mqtt struct {
	server string
	cli    *mqttclient.MqttClient
	db     *stormwrapper.Db
}

// New create a Mqtt object
func New(db *stormwrapper.Db, server string) *Mqtt {

	return &Mqtt{
		server: server,
		db:     db,
	}
}

// Run Start the client
func (mq *Mqtt) Run() {

	mq.cli = mqttclient.NewMqttClient("AxihomeCore", mq.server)
	mq.cli.Connect()

	mq.SubscribeMainTopics()
}

// SubscribeMainTopics subscribe to main topics
func (mq *Mqtt) SubscribeMainTopics() {

	// Devices status
	var devices []types.FieldDevice
	mq.db.GetAll(&devices)
	for _, device := range devices {

		log.Println(device) // Subscribe to device field status topic and device client topic
	}

	mq.db.SubscribeChangesCallback("FieldDevice", func(val interface{}) {

		dev := val.(*types.FieldDevice)
		log.Println("New device :", dev) // Subscribe to device field status topic and device client topic
	})

	// Devices auto-register
	mq.cli.SubscribeTopic(CAutoDiscover, func(msg *message.PublishMessage) error {

		var dev types.FieldDevice
		json.Unmarshal(msg.Payload(), &dev)

		var devdb types.FieldDevice
		err := mq.db.Get("ID", dev.ID, &devdb)
		if err != nil {
			log.Println("Saving new discovered device :", dev.HomeID+"."+dev.Group+"."+dev.ID)
			mq.db.Save(&dev)
		}

		return nil
	})
}
