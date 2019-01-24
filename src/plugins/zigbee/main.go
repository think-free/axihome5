package main

import (
	"flag"
	"log"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"

	"plugins/zigbee/webserver"
	"plugins/zigbee/mqttwrapper"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/plugins/zigbee/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Plugin_Zigbee", *broker)
	cli.Connect()
	cli.SendHB("axihome/5/tasks/zigbee/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "zigbee",
		Name: "Zigbee",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/zigbee", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	db := stormwrapper.New(*config)

	/* Mqtt Wrapper */
	w := mqttwrapper.New(cli, db)
	go w.Run()

	/* Webserver */
	s := webserver.New(*dev, *port)
	err := s.Run()
	if err != nil {
		log.Println(err)
	}
}
