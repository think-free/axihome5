package main

import (
	"flag"
	"time"

	"github.com/jamiealquiza/envy"

	"github.com/think-free/axihome5/src/core/types"
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
	instanceName := flag.String("instance", "main", "The instance name")
	envy.Parse("AX")
	flag.Parse()

	topic := CWriteTopic + *homeID + "/" + *group
	deviceTopic := CDeviceTopic + *homeID + "/" + *group

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_"+*instanceName, *broker)
	cli.Connect()
	cli.SendHB(topic + "/hb")

	// Device register
	dev := types.FieldDevice{
		ID:   *instanceName,
		Type: types.Time,

		Name:   *instanceName,
		Group:  *group,
		HomeID: *homeID,

		Variables: []types.FieldVariables{
			types.FieldVariables{
				Name:        "time",
				Type:        types.Number,
				StatusTopic: topic + "/" + *instanceName,
			},
		},
	}

	go func() {
		for {
			cli.PublishMessageNoRetain(deviceTopic+"/"+*instanceName, &dev)
			time.Sleep(time.Second * 30)
		}
	}()

	// Sending time periodically
	for {
		cli.PublishMessage(topic+"/"+*instanceName, int64(time.Now().Unix()))
		time.Sleep(time.Second)
	}
}
