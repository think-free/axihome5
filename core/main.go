package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/namsral/flag"

	"github.com/think-free/axihome5/core/httpserver"
	"github.com/think-free/axihome5/core/mqtt"
	"github.com/think-free/storm-wrapper"
)

func main() {

	// Parameters

	mqttServer := flag.String("mqttServer", "mosquitto", "The broker host")
	configPath := flag.String("configPath", "./ax5/", "The path to the configuration")
	flag.Parse()

	// Databases

	db := stormwrapper.New(*configPath)

	// Mqtt client

	mq := mqtt.New(db, *mqttServer)
	go mq.Run()

	// Http server

	hs := httpserver.New(db)
	go hs.Run()

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
