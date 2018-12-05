package main

import (
	"log"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"flag"

	"github.com/jamiealquiza/envy"
	"github.com/think-free/storm-wrapper"

	"core/mqtt"
	"core/webserver"
)

func main() {

	log.Println("Starting core application")

	// Parameters

	broker := flag.String("broker", "localhost", "The broker host")
	config := flag.String("config", "/etc/ax5/", "The path to the configuration")
	envy.Parse("AX")
	flag.Parse()

	// Databases
	db := stormwrapper.New(*config)

	// Mqtt client
	mq := mqtt.New(db, *broker)
	go mq.Run()

	// Http server
	hs := webserver.New(db)
	go hs.Run()

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
