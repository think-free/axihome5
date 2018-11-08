package main

import (
	"flag"
	"time"

	"github.com/think-free/axihome5/core/types"
	"github.com/think-free/mqttclient"
)

// Mqtt topics
const (
	CWriteTopic  = "axihome/5/field/variable/"
	CDeviceTopic = "axihome/5/field/device/discover/"
)

func main() {

	mqttServer := flag.String("mqttServer", "localhost", "The broker host")
	homeID := flag.String("homeId", "home", "The home ID")
	group := flag.String("group", "server", "The group of the message")
	instanceName := flag.String("instance", "time", "The instance name")
	flag.Parse()

	topic := CWriteTopic + *homeID + "/" + *group
	deviceTopic := CDeviceTopic + *homeID + "/" + *group

	// Mqtt client
	cli := mqttclient.NewMqttClient("Task_"+*instanceName, *mqttServer)
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
