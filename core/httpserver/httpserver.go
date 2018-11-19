package httpserver

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

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

	// Tasks
	http.HandleFunc("/core/setDefaultUI", s.handlerSetDefaultUI)
	http.HandleFunc("/core/getDefaultUI", s.handlerGetDefaultUI)
	http.HandleFunc("/core/getTasks", s.handlerGetTasks)
	http.HandleFunc("/core/deleteTask", s.handlerDeleteTasks)

	// Devices Config
	http.HandleFunc("/core/getDevicesConfig", s.handlerGetDeviceConfig)
	http.HandleFunc("/core/modifyDeviceConfig", s.handlerModifyDeviceConfig)
	http.HandleFunc("/core/addDeviceConfig", s.handlerAddDeviceConfig)
	http.HandleFunc("/core/deleteDeviceConfig", s.handlerDeleteDeviceConfig)

	// Devices values
	http.HandleFunc("/core/getDevices", s.handlerGetDevices)
	http.HandleFunc("/core/getValues", s.handlerGetAllValues)
	http.HandleFunc("/core/writeValue", s.handlerWriteValue)
	http.HandleFunc("/core/forceValue", s.handlerForceValue)

	// UI
	http.HandleFunc("/", s.handlerDefaultUI)
	http.HandleFunc("/admin", s.handlerAdminUI)

	// TODO : Register admin handler (/admin) ui for remote tasks

	http.ListenAndServe("localhost:8080", nil)
}

/* Tasks routes */

func (s *HTTPServer) addTaskRouteHandler(task *types.Task) {

	// TODO : Add handler for task if not already registered
	http.HandleFunc("/"+task.URL+"/", s.handlerTasksForwardRequest)
}

func (s *HTTPServer) handlerTasksForwardRequest(w http.ResponseWriter, r *http.Request) {

	// TODO : Forward request to destionation task
	log.Println("handlerTasksForwardRequest :", r.RequestURI)
}

/* Http handlers for UI */

func (s *HTTPServer) handlerDefaultUI(w http.ResponseWriter, r *http.Request) {

}

func (s *HTTPServer) handlerAdminUI(w http.ResponseWriter, r *http.Request) {

}

/* Http handlers for core */

// DONE
func (s *HTTPServer) handlerSetDefaultUI(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting default UI :", err)
	}
	log.Println("Setting default UI to :", string(body))

	c := types.Config{
		KeyTask: "DefaultUI-core",
		Key:     "DefaultUI",
		Value:   string(body),
		Task:    "core",
	}
	s.db.Save(&c)

	w.Write([]byte("OK"))
}

// DONE
func (s *HTTPServer) handlerGetDefaultUI(w http.ResponseWriter, r *http.Request) {

	var c types.Config
	s.db.Get("KeyTask", "DefaultUI-core", &c)
	w.Write([]byte(c.Value))
}

// Tasks
// DONE
func (s *HTTPServer) handlerGetTasks(w http.ResponseWriter, r *http.Request) {

	var tsks []types.Task
	s.db.GetAll(&tsks)
	tsksJSON, _ := json.Marshal(tsks)

	w.Write(tsksJSON)
}
func (s *HTTPServer) handlerDeleteTasks(w http.ResponseWriter, r *http.Request) {

}

// Devices
// DONE
func (s *HTTPServer) handlerGetDeviceConfig(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)
	fdJSON, _ := json.Marshal(fd)

	w.Write(fdJSON)
}
func (s *HTTPServer) handlerModifyDeviceConfig(w http.ResponseWriter, r *http.Request) {

}

// DONE
func (s *HTTPServer) handlerAddDeviceConfig(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error Add device config :", err)
	}
	log.Println("Adding new device :", string(body))

	var dev types.FieldDevice
	errUnmarshal := json.Unmarshal(body, &dev)
	if errUnmarshal != nil {

		log.Println(errUnmarshal)
	}
	s.db.Save(&dev)
}
func (s *HTTPServer) handlerDeleteDeviceConfig(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error Delete device config :", err)
	}
	log.Println("Deleting device :", string(body))

	var dev types.FieldDevice
	s.db.Get("ID", string(body), &dev)

	s.db.Remove(&dev)
}

// Devices values
// DONE
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

// DONE
func (s *HTTPServer) handlerGetAllValues(w http.ResponseWriter, r *http.Request) {

	var ds []types.DeviceStatus
	s.db.GetAll(&ds)
	dsJSON, _ := json.Marshal(ds)

	w.Write(dsJSON)
}

func (s *HTTPServer) handlerWriteValue(w http.ResponseWriter, r *http.Request) {

}

func (s *HTTPServer) handlerForceValue(w http.ResponseWriter, r *http.Request) {

}
