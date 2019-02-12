package main

import (
	"flag"
	"log"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
	"github.com/think-free/storm-wrapper"

	"plugins/zwave/webserver"
	"plugins/zwave/mqttwrapper"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/plugins/zwave/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Plugin_ZWave", *broker)
	cli.SetUserPass("backend","axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/zwave/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "zwave",
		Name: "Zwave",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/zwave", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	db := stormwrapper.New(*config)

	/* Mqtt Wrapper */
	w := mqttwrapper.New(cli, db)
	go w.Run()

	/* Webserver */
	s := webserver.New(*dev, *port, db)
	err := s.Run()
	if err != nil {
		log.Println(err)
	}
}
