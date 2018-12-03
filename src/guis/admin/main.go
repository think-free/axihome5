package main

import (
	"flag"
	"log"

	"tasks/alarm/webserver"
)

func main() {

	/* Getting parameters */
	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/project/gui/out/' as gui")
	port := flag.String("p", "8123", "Port for the webserver")
	flag.Parse()

	/* Webserver */
	s := webserver.New(*dev, *port)
	err := s.Run()
	if err != nil {
		log.Println(err)
	}
}
