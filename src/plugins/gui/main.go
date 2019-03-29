package main

import (
	"flag"
	"time"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"

	"plugins/gui/webserver"
)

func main() {

	/* Getting parameters */
	broker := flag.String("broker", "localhost", "The broker host")
	host := flag.String("host", "localhost", "The host name for autoregister")
	port := flag.String("port", "8123", "Port for the webserver")
	guipath := flag.String("guipath", "/etc/gui", "Path to gui assets")

	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/plugins/serial/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	cli := mqttclient.NewMqttClient("Plugin_gui", *broker)
	cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/gui/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "/",
		Name: "Gui",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/gui", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	/* Webserver */
	s := webserver.New(*dev, *port, *guipath)
	s.Run()
}
