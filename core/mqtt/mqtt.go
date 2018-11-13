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
	// Special topics
	CAutoDiscover            = "axihome/5/field/device/discover/#"
	CRequestBroadcastStatus  = "axihome/5/admin/status/broadcast"
	CRequestBroadcastDevices = "axihome/5/admin/devices/broadcast"

	// Client status and devices
	CClientStatus  = "axihome/5/status/" // Add to this topic : HomeID/Group/ID
	CClientDevices = "axihome/5/device/discover"
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

	mq.MqttSubscribeRequestBroadcastStatus()
	mq.MqttSubscribeRequestBroadcastDevices()
	mq.DBLoadAndRegisterFieldStatus()
	mq.MqttSubscribeDeviceAutoRegister()
}

// DBLoadAndRegisterFieldStatus subscribe to mqtt topic for field device
func (mq *Mqtt) DBLoadAndRegisterFieldStatus() {

	// Load from database all the registered FieldDevices
	var devices []types.FieldDevice
	mq.db.GetAll(&devices)
	for _, device := range devices {

		mq.MqttSubscribeDeviceTopics(device)
	}

	// Subscribe to database changes for field devices
	mq.db.SubscribeChangesCallback("FieldDevice", func(val interface{}) {

		dev := val.(*types.FieldDevice)
		mq.MqttSubscribeDeviceTopics(*dev)
	})
}

// MqttSubscribeRequestBroadcastStatus subscribe to special topics
func (mq *Mqtt) MqttSubscribeRequestBroadcastStatus() {

	mq.cli.SubscribeTopic(CRequestBroadcastStatus, func(msg *message.PublishMessage) error {

		// TODO : Send all status to mqtt clients

		return nil
	})
}

// MqttSubscribeRequestBroadcastDevices subscribe to special topics
func (mq *Mqtt) MqttSubscribeRequestBroadcastDevices() {

	mq.cli.SubscribeTopic(CRequestBroadcastDevices, func(msg *message.PublishMessage) error {

		var devices []types.FieldDevice
		mq.db.GetAll(&devices)

		// Send all devices registered to mqtt clients
		for _, dev := range devices {
			cd := types.ClientDevice{
				Name:   dev.Name,
				Group:  dev.Group,
				HomeID: dev.HomeID,
				Type:   dev.Type,
			}

			mq.cli.PublishMessage(CClientDevices, cd)
		}

		return nil
	})
}

// MqttSubscribeDeviceAutoRegister subscribe to device autoregister
func (mq *Mqtt) MqttSubscribeDeviceAutoRegister() {

	mq.cli.SubscribeTopic(CAutoDiscover, func(msg *message.PublishMessage) error {

		var dev types.FieldDevice
		json.Unmarshal(msg.Payload(), &dev)

		var devdb types.FieldDevice
		err := mq.db.Get("ID", dev.ID, &devdb)
		if err != nil {

			// Save device to database
			log.Println("Saving new discovered device :", dev.HomeID+"."+dev.Group+"."+dev.ID)
			mq.db.Save(&dev)

			// Send the new device to the client topic
			cd := types.ClientDevice{
				Name:   dev.Name,
				Group:  dev.Group,
				HomeID: dev.HomeID,
				Type:   dev.Type,
			}

			mq.cli.PublishMessage(CClientDevices, cd)
		}

		return nil
	})
}

// MqttSubscribeDeviceTopics subscribe to main topics
func (mq *Mqtt) MqttSubscribeDeviceTopics(dev types.FieldDevice) { // TODO : Check if the device is not registered already

	log.Println("Subscribing to device topics : ", dev.HomeID+"."+dev.Group+"."+dev.ID)

	// Subscribe to device status topic
	mq.cli.SubscribeTopic(dev.StatusTopic, func(msg *message.PublishMessage) error {

		var pl interface{}
		json.Unmarshal(msg.Payload(), &pl)

		log.Println("Device", dev.HomeID+"."+dev.Group+"."+dev.ID, "sent new status :", pl)

		// Write the value to the database
		ds := types.DeviceStatus{
			Name:  dev.HomeID + "/" + dev.Group + "/" + dev.ID,
			Value: pl,
		}
		mq.db.Save(&ds)

		// Send the value to the client status topic
		mq.cli.PublishMessage(CClientStatus+ds.Name, pl)

		return nil
	})

	// Subscribe to the client command topic
	if dev.CmdTopic != "" {

		mq.cli.SubscribeTopic(CClientStatus+dev.HomeID+"/"+dev.Group+"/"+dev.ID+"/cmd", func(msg *message.PublishMessage) error {

			// Send the value to the client status topic
			log.Println("Writting to device :", dev.HomeID+"."+dev.Group+"."+dev.ID)
			mq.cli.PublishMessage(dev.CmdTopic, msg.Payload())

			return nil
		})
	}
}
