package webserver

import (
	"net/http"

	rice "github.com/GeertJohan/go.rice"
)

const projectName = "admin"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
}

// New create the webserver
func New(dev bool, port string) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/admin/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(box.HTTPBox())))
	}

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	return http.ListenAndServe(":"+s.port, nil)
}
