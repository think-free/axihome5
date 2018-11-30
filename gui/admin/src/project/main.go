package main

import (
	"flag"
	"log"

	"project/webserver"
)

func main() {

	/* Getting parameters */
	dev := flag.Bool("dev", false, "Dev mode : use the folder './src/project/gui/out/' as gui")
	flag.Parse()

	/* Webserver */
	s := webserver.New(*dev)
	err = s.Run()
	if err != nil {
		log.Println(err)
	}
}
