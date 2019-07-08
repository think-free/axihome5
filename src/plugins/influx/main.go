package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/jamiealquiza/envy"
	"github.com/surgemq/message"

	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
)

func main() {

	broker := flag.String("broker", "mosquittofront", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")

	_ = flag.String("homeId", "home", "The home ID")
	_ = flag.String("group", "influxdb", "The group of the message")
	_ = flag.String("instance", "hue", "The instance name")
	envy.Parse("AX")
	flag.Parse()

	var ip string
	b2, err := ioutil.ReadFile(*config + "/influx")
	if err != nil {
		fmt.Print(err)
	} else {
		ip = string(b2)
		ip = strings.TrimSuffix(ip, "\n")
	}

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_Influxdb", *broker)
	//cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("influxdb/hb")

	cli.SubscribeTopic("#", func(msg *message.PublishMessage) error {

		receivedTopic := string(msg.Topic())

		receivedTopic = strings.TrimPrefix(receivedTopic, "axihome/5/status/")
		receivedTopic = strings.Replace(receivedTopic, "/", ".", -1)

		log.Println("Received :", receivedTopic)

		if !strings.Contains(receivedTopic, "external") {

			// Command message received
			if strings.HasSuffix(receivedTopic, ".cmd") {

				var cmd types.CmdPayload
				json.Unmarshal(msg.Payload(), &cmd)

				go writeCommand(ip, receivedTopic, cmd.Payload, cmd.User, cmd.Device)

			} else {

				go writeData(ip, receivedTopic, msg.Payload())
			}
		}

		return nil
	})

	log.Println("Application started")

	// Handle ctrl+c and exit signals

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGKILL)

	for {
		select {
		case _ = <-c:
			fmt.Println("\nClosing application")
			os.Exit(0)
		}
	}
}

func writeData(ip, key string, value interface{}) {

	body := strings.NewReader(key + " value=" + string(value.([]byte)))
	req, err := http.NewRequest("POST", "http://"+ip+":8086/write?db=axihome5", body)
	if err != nil {
		log.Println(err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Written data to influx :", key, "->", string(value.([]byte)))
		body, _ := ioutil.ReadAll(resp.Body)
		log.Println(string(body))
	}
	defer resp.Body.Close()
}

func writeCommand(ip, key string, value interface{}, user, device string) {

	return

	body := strings.NewReader(key + ",user=" + user + ",device=" + device + " value=" + string(value.([]byte)))
	req, err := http.NewRequest("POST", "http://"+ip+":8086/write?db=axihome5", body)
	if err != nil {
		log.Println(err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Written cmd to influx :", key, "->", string(value.([]byte)))
		body, _ := ioutil.ReadAll(resp.Body)
		log.Println(string(body))
	}
	defer resp.Body.Close()
}

// curl -i -XPOST 'http://localhost:8086/write?db=axihome5' --data-binary 'cpu_load_short, value=0.64'
// curl -i -XPOST 'http://localhost:8086/write?db=axihome5' --data-binary 'cpu_load_short,host=server01,region=us-west value=0.64'
