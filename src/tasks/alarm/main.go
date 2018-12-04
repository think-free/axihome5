package main

import (
	"log"
	"time"

	"github.com/namsral/flag"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"

	"tasks/alarm/webserver"
)

func main() {

	broker := flag.String("broker", "localhost", "The broker host")
	host := flag.String("host", "localhost", "The host name for autoregister")
	_ = flag.String("config", "./ax5/", "The path to the configuration")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/project/gui/out/' as gui")
	port := flag.String("port", "8123", "Port for the webserver")
	flag.Parse()

	/* Tasks register */

	// Mqtt client
	cli := mqttclient.NewMqttClient("Task_Alarm", *broker)
	cli.Connect()
	cli.SendHB("axihome/5/tasks/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "alarm",
		Name: "alarm",
	}

	go func() {
		for {
			cli.PublishMessage("axihome/5/tasks/discover/alarm", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	/* Webserver */
	s := webserver.New(*dev, *port)
	err := s.Run()
	if err != nil {
		log.Println(err)
	}
}
