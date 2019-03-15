package main

import (
	"flag"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"

	"plugins/serial/serial"
	"plugins/serial/webserver"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/plugins/serial/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Plugin_serial", *broker)
	cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/serial/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "serial",
		Name: "Serial",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/serial", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	/* Serial port */
	ser := serial.New(cli, *config)
	go ser.Run()

	/* Webserver */
	s := webserver.New(*dev, *port, ser)
	s.Run()
}
