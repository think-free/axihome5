package webserver

import (
	"log"
	"net/http"
	"encoding/json"
	"io/ioutil"

	"github.com/think-free/storm-wrapper"
	rice "github.com/GeertJohan/go.rice"

	"plugins/zwave/mqttwrapper"
)

const projectName = "zwave"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
	db *stormwrapper.Db
}

// New create the webserver
func New(dev bool, port string, db *stormwrapper.Db) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
		db: db,
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/"+projectName+"/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(box.HTTPBox())))
	}

	http.HandleFunc("/zwave/getAll", s.handlerGetAll) // GET : key, task
	http.HandleFunc("/zwave/setDeviceConfig", s.handlerSetDeviceConfig) // POST : mqttwrapper.ZwaveDevice

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	return http.ListenAndServe(":"+s.port, nil)
}

func (s *WebServer) handlerGetAll(w http.ResponseWriter, r *http.Request) {

	var devs []mqttwrapper.ZwaveDevice
	s.db.GetAll(&devs)

	devsJSON, _ := json.Marshal(devs)

	w.Write(devsJSON)
}

func (s *WebServer) handlerSetDeviceConfig(w http.ResponseWriter, r *http.Request) {

	// Reading post body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting device config :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + err.Error() + "}"))
		return
	}

	// Parsing json
	var dev mqttwrapper.ZwaveDevice
	errUnmarshall := json.Unmarshal(body, &dev)
	if errUnmarshall != nil {
		log.Println("Error parsing json :", errUnmarshall)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errUnmarshall.Error() + "}"))
		return
	}

	// Saving device
	s.db.Save(&dev)

	log.Println("Saving device config :", string(body))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Device config saved\"}"))
}
