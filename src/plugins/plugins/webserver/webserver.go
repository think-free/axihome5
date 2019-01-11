package webserver

import (
	"net/http"
	"encoding/json"

	rice "github.com/GeertJohan/go.rice"
	manager "plugins/plugins/manager"
)

const projectName = "plugins"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
	man *manager.Manager
}

// New create the webserver
func New(dev bool, port, path string) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
		man: manager.New(path),
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/"+projectName+"/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(box.HTTPBox())))
	}

	// Plugins managment handlers
	http.HandleFunc("/plugins/getAll", s.handlerGetPlugins)
	http.HandleFunc("/plugins/enablePlugin", s.handlerEnablePlugins)
	http.HandleFunc("/plugins/disablePlugin", s.handlerDisablePlugins)
	http.HandleFunc("/plugins/startAllPlugins", s.handlerStartAllPlugins)
	http.HandleFunc("/plugins/stopAllPlugins", s.handlerStopAllPlugins)

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	s.man.Run()
	return http.ListenAndServe(":"+s.port, nil)
}

func (s *WebServer) handlerGetPlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}

func (s *WebServer) handlerEnablePlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}

func (s *WebServer) handlerDisablePlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}

func (s *WebServer) handlerStartAllPlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}

func (s *WebServer) handlerStopAllPlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}
