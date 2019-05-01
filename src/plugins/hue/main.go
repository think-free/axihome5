package main

import (
	"flag"
	"log"

	"github.com/amimof/huego"
)

func main() {

	userParams := flag.String("user", "ZrPzoydpOEPASnur1iH2H7i6tbUmtWtbk4qDfP-F", "User")
	flag.Parse()

	bridge, _ := huego.Discover()
	user := *userParams

	if *userParams == "" {

		user, err := bridge.CreateUser("axihome5")
		if err != nil {
			log.Println(err)
		}
		log.Println(user)
	}
	log.Println("Login with :", user)
	bridge = bridge.Login(user)

	lights, err := bridge.GetLights()
	if err != nil {
		log.Println(err)
	}
	for _, light := range lights {
		log.Println(light.Name, " ", light.IsOn())
		//light.Effect("none")
		//light.Xy([]float32{0.8, 0.7})
		light.Off()
	}
}
