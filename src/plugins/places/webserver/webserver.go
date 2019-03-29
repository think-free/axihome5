package webserver

import (
	"net/http"

	rice "github.com/GeertJohan/go.rice"
	stormwrapper "github.com/think-free/storm-wrapper"
)

const projectName = "places"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
	db   *stormwrapper.Db
}

// New create the webserver
func New(dev bool, port string, db *stormwrapper.Db) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
		db:   db,
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/"+projectName+"/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(box.HTTPBox())))
	}

	http.HandleFunc("/places/getPlaces", s.handlerGetPlaces) // GET : key, task

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	return http.ListenAndServe(":"+s.port, nil)
}

func (s *WebServer) handlerGetPlaces(w http.ResponseWriter, r *http.Request) {

	http.ServeFile(w, r, "/etc/ax5/places.json")
}
