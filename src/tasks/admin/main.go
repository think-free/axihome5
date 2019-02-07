package main

import (
	"flag"
	"log"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"

	"tasks/admin/webserver"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	_ = flag.String("config", "./ax5/", "The path to the configuration")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/guis/admin/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Task_admin", *broker)
	cli.SetUserPass("backend","axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/admin/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "admin",
		Name: "Admin",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/admin", &tsk)
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
