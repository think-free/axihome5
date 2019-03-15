package webserver

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"plugins/serial/serial"

	rice "github.com/GeertJohan/go.rice"
)

const projectName = "serial"

// WebServer create the main web server that handle the gui requests
type WebServer struct {
	port string
	dev  bool
	ser  *serial.Serial
}

// New create the webserver
func New(dev bool, port string, ser *serial.Serial) *WebServer {

	s := &WebServer{
		dev:  dev,
		port: port,
		ser:  ser,
	}

	// Server the web app and the files in the docker compose tree
	if dev {
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(http.Dir("./src/plugins/"+projectName+"/gui/out/"))))

	} else {
		box := rice.MustFindBox("../gui/out/")
		http.Handle("/"+projectName+"/", http.StripPrefix("/"+projectName+"/", http.FileServer(box.HTTPBox())))
	}

	http.HandleFunc("/serial/getAll", s.handlerGetAll)       // GET : key, task
	http.HandleFunc("/serial/addConfig", s.handlerAddConfig) // POST : mqttwrapper.serialDevice

	return s
}

// Run start the web server
func (s *WebServer) Run() error {

	return http.ListenAndServe(":"+s.port, nil)
}

func (s *WebServer) handlerGetAll(w http.ResponseWriter, r *http.Request) {

	vals := s.ser.GetValues()

	js, _ := json.Marshal(&vals)
	w.Write(js)
}

func (s *WebServer) handlerAddConfig(w http.ResponseWriter, r *http.Request) {

	// Reading post body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting device config :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + err.Error() + "}"))
		return
	}

	// Parsing json
	var values []serial.Value
	errUnmarshall := json.Unmarshal(body, &values)
	if errUnmarshall != nil {
		log.Println("Error parsing json :", errUnmarshall)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errUnmarshall.Error() + "}"))
		return
	}

	s.ser.SetValues(values)

	// Saving device

	log.Println("Saving device config :", string(body))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Device config saved\"}"))

	s.ser.ReadConfig()
}
