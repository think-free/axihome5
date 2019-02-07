package main

import (
	"flag"
	"log"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"

	"tasks/plugins/webserver"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")
	path := flag.String("path", "/etc/plugins", "Path to plugins folder")
	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/project/gui/out/' as gui")
	envy.Parse("AX")
	flag.Parse()

	log.Println("Connecting to Mqtt broker :", *broker)

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Task_plugins_manager", *broker)
	cli.SetUserPass("backend","axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/plugins/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "plugins",
		Name: "Plugins",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/plugins", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	/* Webserver */
	s := webserver.New(*dev, *port, *path, *config)
	err := s.Run()
	if err != nil {
		log.Println(err)
	}
}
