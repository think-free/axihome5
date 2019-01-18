package webserver

import (
	"net/http"
	"encoding/json"
	"log"
	"io"
	"os"

	rice "github.com/GeertJohan/go.rice"
	manager "tasks/plugins/manager"
	store "tasks/plugins/store"
)

const storeUrl = "https://axihome.think-free.me/plugins/plugins.json"

const projectName = "plugins"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
	pluginPath string
	man *manager.Manager
	store *store.Store
}

// New create the webserver
func New(dev bool, port, path string) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
		pluginPath: path,
		man: manager.New(path),
		store: store.New(storeUrl, path),
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/tasks/"+projectName+"/gui/out/"))))

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
	http.HandleFunc("/plugins/restartPlugin", s.handlerRestartPlugin)
	http.HandleFunc("/plugins/getIcon", s.handlerGetIcon)

	http.HandleFunc("/plugins/getStoreContent", s.handlerGetStoreContent)
	http.HandleFunc("/plugins/downloadPluginFromStore", s.handlerDownloadPluginFromStore)
	http.HandleFunc("/plugins/deletePlugin", s.handlerDeletePlugin)

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	go s.store.Run()
	go s.man.Run()
	return http.ListenAndServe(":"+s.port, nil)
}

func (s *WebServer) handlerGetPlugins(w http.ResponseWriter, r *http.Request) {

	plugins := s.man.GetPlugins()
	pluginsJSON, _ := json.Marshal(plugins)

	w.Write(pluginsJSON)
}

func (s *WebServer) handlerEnablePlugins(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := plugins[0]

	s.man.EnablePlugin(string(plugin))
	w.Write([]byte("Enabling plugin"))
}

func (s *WebServer) handlerDisablePlugins(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := plugins[0]

	s.man.DisablePlugin(string(plugin))
	w.Write([]byte("Disabling plugin"))
}

func (s *WebServer) handlerStartAllPlugins(w http.ResponseWriter, r *http.Request) {

	s.man.StartAllPlugins()
	w.Write([]byte("Starting all plugins"))
}

func (s *WebServer) handlerStopAllPlugins(w http.ResponseWriter, r *http.Request) {

	s.man.StopAllPlugins()
	w.Write([]byte("Stopping all plugins"))
}

func (s *WebServer) handlerRestartPlugin(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := string(plugins[0])

	s.man.StopPlugin(plugin)
	s.man.StartPlugin(plugin)
	w.Write([]byte("Restarting plugin"))
}

func (s *WebServer) handlerGetIcon(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := plugins[0]

	source, err := os.Open(s.pluginPath + "/" + string(plugin) + "/icon.png")
    if err != nil {
            return
    }
    defer source.Close()

	w.Header().Set("Content-Type", "image/png")
	io.Copy(w, source)
}

func (s *WebServer) handlerGetStoreContent(w http.ResponseWriter, r *http.Request) {

	contents := s.store.GetStoreContent()

	w.Write(contents)
}

func (s *WebServer) handlerDownloadPluginFromStore(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := plugins[0]

	err := s.store.DownloadPluginFromUrl(plugin)
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Plugin downloaded :", plugin)
	}
}

func (s *WebServer) handlerDeletePlugin(w http.ResponseWriter, r *http.Request) {

	plugins, ok := r.URL.Query()["plugin"]
	if !ok || len(plugins[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	plugin := plugins[0]

	s.man.DeletePlugin(plugin)

	w.Write([]byte("OK"))
}
