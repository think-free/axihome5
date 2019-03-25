package webserver

import (
	"net/http"

	rice "github.com/GeertJohan/go.rice"
)

const projectName = "gui"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port    string
	dev     bool
	guipath string
}

// New create the webserver
func New(dev bool, port, guipath string) *WebServer {

	s := &WebServer{
		dev:     dev,
		port:    port,
		guipath: guipath,
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/"+projectName+"/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/", http.FileServer(box.HTTPBox()))
	}

	fs := http.FileServer(http.Dir(guipath))
	http.Handle("/assets/", http.StripPrefix("/assets", fs))

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	return http.ListenAndServe(":"+s.port, nil)
}
