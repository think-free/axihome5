package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"

	"github.com/jamiealquiza/envy"
	"github.com/robertkrimen/otto"
	"github.com/surgemq/message"

	"github.com/think-free/mqttclient"
)

var data map[string]interface{}
var mutData sync.Mutex
var state map[string]interface{}
var mutState sync.Mutex

func main() {

	broker := flag.String("broker", "mosquittofront", "The broker host")
	_ = flag.String("config", "/etc/ax5/", "The path to the configuration")

	_ = flag.String("homeId", "home", "The home ID")
	_ = flag.String("group", "script", "The group of the message")
	_ = flag.String("instance", "script", "The instance name")
	envy.Parse("AX")
	flag.Parse()

	// Creating map of data
	data = make(map[string]interface{})
	state = make(map[string]interface{})

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_Scripts", *broker)
	//cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("script/hb")

	cli.SubscribeTopic("#", func(msg *message.PublishMessage) error {

		receivedTopic := string(msg.Topic())

		receivedTopic = strings.TrimPrefix(receivedTopic, "axihome/5/status/")
		receivedTopic = strings.Replace(receivedTopic, "/", ".", -1)

		log.Println("Received :", receivedTopic)

		if !strings.Contains(receivedTopic, "external") {

			// Command message received
			if strings.HasSuffix(receivedTopic, ".cmd") {

			} else {

				//str := string(msg.Payload())
				var str interface{}
				json.Unmarshal(msg.Payload(), &str)

				mutData.Lock()
				data[receivedTopic] = str
				mutData.Unlock()

				file := "/scripts/" + receivedTopic + ".js"
				if _, err := os.Stat(file); err == nil {

					log.Println("Running script : " + file)

					code, err := ioutil.ReadFile(file)
					if err != nil {
						log.Println(err)
					}

					/* Create the js vm, set the current value and run the script */

					vm := getJsVM(cli)
					vm.Set("value", str)

					if _, err := vm.Run(code); err != nil {
						log.Println(err)
					}
				}
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

func getJsVM(cli *mqttclient.MqttClient) *otto.Otto {

	vm := otto.New()

	// getVariable return the value of a variable in the js env
	vm.Set("get", func(k string) interface{} {

		mutData.Lock()
		dt := data[k]
		mutData.Unlock()

		return dt
	})

	// setVariable set the value of a variable from the js env
	vm.Set("set", func(k string, v interface{}) {

		topic := strings.Replace(k, ".", "/", -1)

		cli.PublishMessageNoRetain("axihome/5/status/"+topic, v)
	})

	vm.Set("getState", func(k string) interface{} {

		mutState.Lock()
		st := state[k]
		mutState.Unlock()

		return st
	})

	vm.Set("setState", func(k string, v interface{}) {

		mutState.Lock()
		state[k] = v
		mutState.Unlock()
	})

	return vm
}
