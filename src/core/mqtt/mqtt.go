package mqtt

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/surgemq/message"
	"github.com/think-free/mqttclient"
	stormwrapper "github.com/think-free/storm-wrapper"

	"core/types"
)

// Mqtt topics
const (
	// Special topics
	CAutoDiscoverTask        = "axihome/5/tasks/discover/#"
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

	registeredDevices map[string]struct{}
	sync.Mutex
}

// New create a Mqtt object
func New(db *stormwrapper.Db, server string) *Mqtt {

	return &Mqtt{
		server:            server,
		db:                db,
		registeredDevices: make(map[string]struct{}),
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
	mq.MqttSubscribeTasksAutoRegister()
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

		// Send all status to mqtt clients
		var dss []types.DeviceStatus
		mq.db.GetAll(&dss)

		for _, ds := range dss {

			mq.cli.PublishMessage(CClientStatus+ds.Route, ds.Value)
		}

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

			for _, va := range dev.Variables {
				v := types.ClientVariable{
					Type: va.Type,
				}
				cd.Variables = append(cd.Variables, v)
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

			for _, va := range dev.Variables {
				v := types.ClientVariable{
					Type: va.Type,
				}
				cd.Variables = append(cd.Variables, v)
			}

			mq.cli.PublishMessage(CClientDevices, cd)
		}

		return nil
	})
}

// MqttSubscribeTasksAutoRegister subscribe to tasks autoregister
func (mq *Mqtt) MqttSubscribeTasksAutoRegister() {

	mq.cli.SubscribeTopic(CAutoDiscoverTask, func(msg *message.PublishMessage) error {

		var tsk types.Task
		err := json.Unmarshal(msg.Payload(), &tsk)

		if err != nil {
			log.Println("Can't register task, json not valid :", err)
		}

		var tskdb types.Task
		errGet := mq.db.Get("URL", tsk.URL, &tskdb)
		if errGet != nil {

			// Save device to database
			log.Println("Saving new discovered task :", tsk.Name)
			mq.db.Save(&tsk)

		} else if tskdb.Host != tsk.Host || tskdb.Port != tsk.Port {

			log.Println("Saving task modification :", tsk.Name)
			mq.db.Remove(&tskdb)
			mq.db.Save(&tsk)
		}

		return nil
	})
}

// MqttSubscribeDeviceTopics subscribe to main topics
func (mq *Mqtt) MqttSubscribeDeviceTopics(dev types.FieldDevice) {

	for _, dv := range dev.Variables {

		// Check if the device is not registered already
		mq.Lock()
		if _, ok := mq.registeredDevices[dev.ID+dv.Name]; ok {

			log.Println("Device already registered : ", dev.HomeID+"."+dev.Group+"."+dev.ID+"."+dv.Name)
			log.Println("Restart the server if you have changed the device name")
			mq.Unlock()
			return
		}

		mq.registeredDevices[dev.ID+dv.Name] = struct{}{}
		mq.Unlock()

		// Subscribe to device status topic
		log.Println("Subscribing to device topics : ", dev.HomeID+"."+dev.Group+"."+dev.Name+"."+dv.Name)

		mq.cli.SubscribeTopic(dv.StatusTopic, func(msg *message.PublishMessage) error {

			var pl interface{}
			json.Unmarshal(msg.Payload(), &pl)

			log.Println("Device", dev.HomeID+"."+dev.Group+"."+dev.Name+"."+dv.Name, "sent new status :", pl)

			// Write the value to the database
			ds := types.DeviceStatus{
				Name:  dev.HomeID + "." + dev.Group + "." + dev.Name + "." + dv.Name,
				Route: dev.HomeID + "/" + dev.Group + "/" + dev.Name + "/" + dv.Name,
				Value: pl,
			}
			mq.db.Save(&ds)

			// Send the value to the client status topic
			mq.cli.PublishMessage(CClientStatus+ds.Route, ds.Value)

			return nil
		})

		// Subscribe to the client command topic
		if dv.CmdTopic != "" {

			mq.cli.SubscribeTopic(CClientStatus+dev.HomeID+"/"+dev.Group+"/"+dev.Name+"/"+dv.Name+"/cmd", func(msg *message.PublishMessage) error {

				// Send the value to the client status topic
				log.Println("Writting to device :", dev.HomeID+"."+dev.Group+"."+dev.Name+"."+dv.Name)
				mq.cli.PublishMessage(dv.CmdTopic, msg.Payload())

				return nil
			})
		}
	}
}
