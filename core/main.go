package main

import (
	"encoding/json"
	"flag"
	"log"
	"time"

	"github.com/surgemq/message"

	"github.com/think-free/axihome5/core/types"
	"github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"
)

// Mqtt topics
const (
	CAutoDiscover = "axihome/5/field/device/discover/#"
)

func main() {

	// Parameters
	mqttServer := flag.String("mqttServer", "localhost", "The broker host")
	flag.Parse()

	// Databases

	db := stormwrapper.New("./ax5/")

	// Mqtt client
	cli := mqttclient.NewMqttClient("AxihomeCore", *mqttServer)
	cli.Connect()

	/* Subscribing */

	// Device discover
	cli.SubscribeTopic(CAutoDiscover, func(msg *message.PublishMessage) error {

		var dev types.FieldDevice
		json.Unmarshal(msg.Payload(), &dev)

		var devdb types.FieldDevice
		err := db.Get("ID", dev.ID, &devdb)
		if err != nil {
			log.Println("Saving new discovered device :", dev.HomeID+"."+dev.Group+"."+dev.ID)
			db.Save(&dev)
		}

		return nil
	})

	// Main loop
	for {
		time.Sleep(time.Second)
	}
}
