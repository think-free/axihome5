package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/amimof/huego"
	"github.com/jamiealquiza/envy"
	"github.com/surgemq/message"

	"github.com/think-free/axihome5/src/core/types"
	"github.com/think-free/mqttclient"
)

// Mqtt topics
const (
	CWriteTopic  = "axihome/5/field/variable/"
	CDeviceTopic = "axihome/5/field/device/discover/"
)

type lightState struct {
	Light huego.Light
	IsOn  float64
	Xy    []float32
}

func main() {

	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")

	homeID := flag.String("homeId", "home", "The home ID")
	group := flag.String("group", "hue", "The group of the message")
	instanceName := flag.String("instance", "hue", "The instance name")
	envy.Parse("AX")
	flag.Parse()

	topic := CWriteTopic + *homeID + "/" + *group
	deviceTopic := CDeviceTopic + *homeID + "/" + *group

	var user string
	b, err := ioutil.ReadFile(*config + "/hue.token")
	if err != nil {
		fmt.Print(err)
	} else {
		user = string(b)
		user = strings.TrimSuffix(user, "\n")
	}

	var ip string
	b2, err := ioutil.ReadFile(*config + "/hue.ip")
	if err != nil {
		fmt.Print(err)
	} else {
		ip = string(b2)
		ip = strings.TrimSuffix(ip, "\n")
	}

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_"+*instanceName, *broker)
	cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB(topic + "/hb")

	var bridge *huego.Bridge

	if ip == "" {

		// Hue
		bridge, err = huego.Discover()
		if err != nil {

			log.Println(err)
			log.Fatal("Bridge not found")
		}
	} else {

		bridge = &huego.Bridge{
			Host: ip,
		}
	}

	log.Println(*bridge)

	log.Println("Connecting to bridge :", bridge.Host)

	for {
		time.Sleep(time.Second * 5)
		if user == "" {

			ruser, err := bridge.CreateUser("axihome5")
			if err != nil {
				log.Println(err)

			} else {

				log.Println("Registered user :", ruser)
				ioutil.WriteFile(*config+"/hue.token", []byte(ruser), 0644)
				user = ruser
				break
			}

		} else {
			log.Println("User : ", user)
			break
		}
	}

	log.Println("Login with :", user)
	bridge = bridge.Login(user)

	devices := make(map[string]lightState)
	var mut sync.Mutex

	// Register device every 30s
	go func() {
		for {

			mut.Lock()

			for dname := range devices {

				dev := types.FieldDevice{
					ID:   dname,
					Type: types.Light,

					Name:   dname,
					Group:  *group,
					HomeID: *homeID,

					Variables: []types.FieldVariables{
						types.FieldVariables{
							Name:        "status",
							Type:        types.Digital,
							StatusTopic: topic + "/" + dname + "/status",
							CmdTopic:    topic + "/" + dname + "/status/cmd",
						},
						types.FieldVariables{
							Name:        "color",
							Type:        types.Digital,
							StatusTopic: topic + "/" + dname + "/color",
							CmdTopic:    topic + "/" + dname + "/color/cmd",
						},
					},
				}

				cli.PublishMessageNoRetain(deviceTopic+"/"+dname, &dev)
			}

			mut.Unlock()

			time.Sleep(time.Second * 30)
		}
	}()

	cli.SubscribeTopic(topic+"/#", func(msg *message.PublishMessage) error {

		receivedTopic := string(msg.Topic())

		var device string
		deviceAndMessage := strings.TrimPrefix(receivedTopic, topic+"/")
		if strings.Contains(deviceAndMessage, "status") {
			device = strings.TrimSuffix(deviceAndMessage, "/status/cmd")
			if dev, ok := devices[device]; ok {
				light := dev.Light

				var val float64
				json.Unmarshal(msg.Payload(), &val)

				if val == 1 {
					light.On()
				} else {
					light.Off()
				}
			}

		} else if strings.Contains(deviceAndMessage, "color") {
			device = strings.TrimSuffix(deviceAndMessage, "/color/cmd")
		}

		log.Println("Received message on :", receivedTopic)
		log.Println("Processing device :", device, "with payload", msg.Payload())

		return nil
	})

	// Pooling hue bridge and sending value
	for {

		// Getting lights
		lights, err := bridge.GetLights()
		if err != nil {
			log.Println(err)
		}
		for _, light := range lights {

			changed := false
			status := 0.0
			if light.IsOn() {
				status = 1.0
			}
			xy := light.State.Xy

			mut.Lock()

			if val, ok := devices[light.Name]; ok { // Light exists

				// Checking if the states have changed
				if val.IsOn != status {

					val.IsOn = status
					changed = true
				}

				if len(xy) > 0 {

					if val.Xy[0] != xy[0] {

						val.Xy = xy
						changed = true
					}

					if val.Xy[1] != xy[1] {

						val.Xy = xy
						changed = true
					}
				}

				// Saving changes
				if changed {
					devices[light.Name] = val
				}

			} else { // Light doesn't exists

				devices[light.Name] = lightState{
					Light: light,
					IsOn:  status,
					Xy:    xy,
				}
				changed = true
			}
			mut.Unlock()

			//light.Effect("none")
			//light.Xy([]float32{0.8, 0.7})
			//light.Off()

			// Publishing status if changed
			if changed {
				log.Println(light.Name, " status changed to : ", status)
				cli.PublishMessage(topic+"/"+light.Name+"/status", status)
				cli.PublishMessage(topic+"/"+light.Name+"/color", xy)
			}
		}

		time.Sleep(time.Second)
	}
}
