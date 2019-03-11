package main // import "github.com/think-free/axihome5/src/plugins/serial"

import (
	"bufio"
	"flag"
	"log"
	"strings"

	"github.com/jacobsa/go-serial/serial"
	"github.com/jamiealquiza/envy"
)

func main() {

	/* Getting parameters */
	//broker := flag.String("broker", "localhost", "The broker host")
	//config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	//host := flag.String("host", "localhost", "The host name for autoregister")
	//port := flag.String("port", "8123", "Port for the webserver")
	//
	//dev := flag.Bool("dev", false, "Dev mode : use the folder './src/plugins/serial/gui/out/' as gui")

	envy.Parse("AX")
	flag.Parse()

	/* Tasks register */
	/*cli := mqttclient.NewMqttClient("Plugin_Zigbee", *broker)
	cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("axihome/5/tasks/zigbee/hb")

	tsk := types.Task{
		Host: *host,
		Port: *port,
		URL:  "serial",
		Name: "Serial",
	}

	go func() {
		for {
			cli.PublishMessageNoRetain("axihome/5/tasks/discover/zigbee", &tsk)
			time.Sleep(time.Second * 30)
		}
	}()

	db := stormwrapper.New(*config)*/

	// Serial port options

	serialOptions := serial.OpenOptions{
		PortName:        "/dev/ttyUSB0",
		BaudRate:        57600,
		DataBits:        8,
		StopBits:        1,
		MinimumReadSize: 4,
	}

	// Open the serial port

	port, err := serial.Open(serialOptions)
	if err != nil {
		log.Fatal("Serial open error : %v", err)
	}

	defer port.Close()
	r := bufio.NewReader(port)

	// Read from the port

	for {

		bt, _ := r.ReadBytes('\n')
		bts := string(bt)
		bts = strings.TrimSuffix(bts, "\n")

		log.Println(bts)
	}
}
