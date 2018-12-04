package main

import (
	"time"

	"github.com/namsral/flag"

	"github.com/think-free/axihome5/core/types"
	"github.com/think-free/mqttclient"
)

// Mqtt topics
const (
	CWriteTopic  = "axihome/5/field/variable/"
	CDeviceTopic = "axihome/5/field/device/discover/"
)

func main() {

	broker := flag.String("broker", "localhost", "The broker host")
	_ = flag.String("config", "./ax5/", "The path to the configuration")

	homeID := flag.String("homeId", "home", "The home ID")
	group := flag.String("group", "server", "The group of the message")
	instanceName := flag.String("instance", "time", "The instance name")
	flag.Parse()

	topic := CWriteTopic + *homeID + "/" + *group
	deviceTopic := CDeviceTopic + *homeID + "/" + *group

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_"+*instanceName, *broker)
	cli.Connect()
	cli.SendHB(topic + "/hb")

	// Device register
	dev := types.FieldDevice{
		ID:          *instanceName,
		StatusTopic: topic + "/" + *instanceName,

		Name:   *instanceName,
		HomeID: *homeID,
		Group:  *group,
		Type:   types.Time,
	}

	go func() {
		for {
			cli.PublishMessage(deviceTopic+"/"+*instanceName, &dev)
			time.Sleep(time.Second * 30)
		}
	}()

	// Sending time periodically
	for {
		cli.PublishMessage(topic+"/"+*instanceName, int64(time.Now().Unix()))
		time.Sleep(time.Second)
	}
}
