package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/think-free/axihome5/core/mqtt"
	"github.com/think-free/storm-wrapper"
)

func main() {

	// Parameters

	mqttServer := flag.String("mqttServer", "localhost", "The broker host")
	flag.Parse()

	// Databases

	db := stormwrapper.New("./ax5/")

	// Mqtt client

	mq := mqtt.New(db, *mqttServer)
	mq.Run()

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
