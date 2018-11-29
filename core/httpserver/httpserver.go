package httpserver

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/think-free/axihome5/core/types"
	stormwrapper "github.com/think-free/storm-wrapper"
)

// HTTPServer is the core http server
type HTTPServer struct {
	db *stormwrapper.Db
}

// New create a new http server instance
func New(db *stormwrapper.Db) *HTTPServer {

	return &HTTPServer{
		db: db,
	}
}

// Run start the http server
func (s *HTTPServer) Run() {

	// TODO : Remove the following dummy task
	s.addTaskRouteHandler(&types.Task{
		Host: "localhost",
		Port: "8123",
		URL:  "alarm",
		Name: "alarm",
	})

	// Subscribe for db change for tasks to auto register new routes
	s.db.SubscribeChangesCallback("Task", func(val interface{}) {

		task := val.(*types.Task)
		s.addTaskRouteHandler(task)
	})

	// Initial register all tasks routes
	var tasks []types.Task
	s.db.GetAll(&tasks)
	for _, task := range tasks {
		s.addTaskRouteHandler(&task)
	}

	// Config
	http.HandleFunc("/core/setConfig", s.handlerSetConfig) // POST : types.Config
	http.HandleFunc("/core/getConfig", s.handlerGetConfig) // GET : key, task

	// Tasks
	http.HandleFunc("/core/getTasks", s.handlerGetTasks)      // GET
	http.HandleFunc("/core/deleteTask", s.handlerDeleteTasks) // GET : name

	// Devices Config
	http.HandleFunc("/core/getDevicesConfig", s.handlerGetDeviceConfig)      // GET
	http.HandleFunc("/core/modifyDeviceConfig", s.handlerModifyDeviceConfig) // POST : types.FieldDevice
	http.HandleFunc("/core/addDeviceConfig", s.handlerAddDeviceConfig)       // POST : types.FieldDevice
	http.HandleFunc("/core/deleteDeviceConfig", s.handlerDeleteDeviceConfig) // GET : id

	// Devices values
	http.HandleFunc("/core/getDevices", s.handlerGetDevices)    // GET
	http.HandleFunc("/core/getValues", s.handlerGetAllValues)   // GET
	http.HandleFunc("/core/getValue", s.handlerGetSingleValues) // GET : key
	http.HandleFunc("/core/writeValue", s.handlerWriteValue)    // TODO
	http.HandleFunc("/core/forceValue", s.handlerForceValue)    // TODO
	http.HandleFunc("/core/deleteValue", s.handlerDeleteValue)  // GET : key

	// UI
	http.HandleFunc("/", s.handlerDefaultUI)
	http.HandleFunc("/admin", s.handlerAdminUI)

	http.ListenAndServe("localhost:8080", nil)
}

/* Tasks routes */

func (s *HTTPServer) addTaskRouteHandler(task *types.Task) {

	// TODO : Solve problem serving react app

	log.Println("Registering task http handler :", task.Name)
	u, _ := url.Parse("http://" + task.Host + ":" + task.Port)

	http.Handle("/"+task.URL+"/", httputil.NewSingleHostReverseProxy(u))
}

/* Http handlers for UI */

func (s *HTTPServer) handlerDefaultUI(w http.ResponseWriter, r *http.Request) {

	// TODO : Route to default UI (task)
}

func (s *HTTPServer) handlerAdminUI(w http.ResponseWriter, r *http.Request) {

	// TODO : Server admin ui
}

/* Http handlers for core */

// Config
func (s *HTTPServer) handlerSetConfig(w http.ResponseWriter, r *http.Request) {

	// Reading post body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting default UI :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + err.Error() + "}"))
		return
	}

	// Parsing json
	var c types.Config
	errUnmarshall := json.Unmarshal(body, &c)
	if errUnmarshall != nil {
		log.Println("Error parsing json :", errUnmarshall)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errUnmarshall.Error() + "}"))
		return
	}

	// Saving config
	c.KeyTask = c.Key + "-" + c.Task
	s.db.Save(&c)

	log.Println("Setting default UI to :", string(body))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Default UI changed\"}"))
}

func (s *HTTPServer) handlerGetConfig(w http.ResponseWriter, r *http.Request) {

	// Get key parameter
	keys, ok := r.URL.Query()["key"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing key")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing key\"}"))
		return
	}
	key := keys[0]

	// Get task parameter
	tasks, ok := r.URL.Query()["task"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing tasks")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing tasks\"}"))
		return
	}
	task := tasks[0]

	// Get config
	var c types.Config
	s.db.Get("KeyTask", key+"-"+task, &c)
	w.Write([]byte(c.Value))
}

// Tasks
func (s *HTTPServer) handlerGetTasks(w http.ResponseWriter, r *http.Request) {

	var tsks []types.Task
	s.db.GetAll(&tsks)
	tsksJSON, _ := json.Marshal(tsks)

	w.Write(tsksJSON)
}

func (s *HTTPServer) handlerDeleteTasks(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["name"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var tsk types.Task
	s.db.Get("Name", string(key), &tsk)
	s.db.Remove(&tsk)

	log.Println("Deleting device :", string(key))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Task deleted\"}"))
}

// Devices
func (s *HTTPServer) handlerGetDeviceConfig(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)
	fdJSON, _ := json.Marshal(fd)

	w.Write(fdJSON)
}

func (s *HTTPServer) handlerModifyDeviceConfig(w http.ResponseWriter, r *http.Request) {

	// Getting body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error Modify device config :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + err.Error() + "}"))
		return
	}

	// Getting fieldDevice from body json
	var dev types.FieldDevice
	errUnmarshal := json.Unmarshal(body, &dev)
	if errUnmarshal != nil {

		log.Println(errUnmarshal)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errUnmarshal.Error() + "}"))
		return
	}

	// Looking for current device in database
	var currentDev types.FieldDevice
	errGet := s.db.Get("ID", dev.ID, &currentDev)
	if errGet != nil {
		log.Println(errGet)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errGet.Error() + "}"))
		return
	}

	// Replacing device in database
	s.db.Remove(&currentDev)
	s.db.Save(&dev)

	log.Println("Adding new device :", string(body))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"New device added\"}"))
}

func (s *HTTPServer) handlerAddDeviceConfig(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error Add device config :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + err.Error() + "}"))
		return
	}

	var dev types.FieldDevice
	errUnmarshal := json.Unmarshal(body, &dev)
	if errUnmarshal != nil {

		log.Println(errUnmarshal)
		w.Write([]byte("{\"type\" : \"error\", \"msg\":" + errUnmarshal.Error() + "}"))
		return
	}
	s.db.Save(&dev)

	log.Println("Adding new device :", string(body))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"New device added\"}"))
}

func (s *HTTPServer) handlerDeleteDeviceConfig(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["id"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var dev types.FieldDevice
	s.db.Get("ID", string(key), &dev)
	s.db.Remove(&dev)

	log.Println("Deleting device :", string(key))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Device deleted\"}"))
}

// Devices values
func (s *HTTPServer) handlerGetDevices(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)

	var cd []types.ClientDevice
	for _, d := range fd {
		cd = append(cd, types.ClientDevice{
			Name:   d.Name,
			Group:  d.Group,
			HomeID: d.HomeID,
			Type:   d.Type,
		})
	}

	dsJSON, _ := json.Marshal(cd)

	w.Write(dsJSON)
}

func (s *HTTPServer) handlerGetAllValues(w http.ResponseWriter, r *http.Request) {

	var ds []types.DeviceStatus
	s.db.GetAll(&ds)
	dsJSON, _ := json.Marshal(ds)

	w.Write(dsJSON)
}

func (s *HTTPServer) handlerGetSingleValues(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["key"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var ds types.DeviceStatus
	s.db.Get("Name", key, &ds)
	dsJSON, _ := json.Marshal(ds)

	w.Write(dsJSON)
}

func (s *HTTPServer) handlerWriteValue(w http.ResponseWriter, r *http.Request) { // TODO

	// Send to mqtt field topic for this device
}

func (s *HTTPServer) handlerForceValue(w http.ResponseWriter, r *http.Request) { // TODO

	// Save to database and send to mqtt client topic
}

func (s *HTTPServer) handlerDeleteValue(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["key"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var ds types.DeviceStatus
	s.db.Get("Name", key, &ds)
	s.db.Remove(&ds)

	log.Println("Deleting value")
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Value deleted\"}"))
}
