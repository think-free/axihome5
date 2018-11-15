package httpserver

import (
	"encoding/json"
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

	// TODO : Register all tasks routes

	// Tasks
	http.HandleFunc("/core/getTasks", s.handlerGetTasks)
	http.HandleFunc("/core/deleteTask", s.handlerDeleteTasks)

	// Devices Config
	http.HandleFunc("/core/getDevicesConfig", s.handlerGetDeviceConfig)
	http.HandleFunc("/core/modifyDeviceConfig", s.handlerModifyDeviceConfig)
	http.HandleFunc("/core/addDeviceConfig", s.handlerAddDeviceConfig)
	http.HandleFunc("/core/deleteDeviceConfig", s.handlerDeleteDeviceConfig)

	// Devices values
	http.HandleFunc("/core/getDevices", s.handlerGetDevices)
	http.HandleFunc("/core/getAllValues", s.handlerGetAllValues)
	http.HandleFunc("/core/writeValue", s.handlerWriteValue)
	http.HandleFunc("/core/forceValue", s.handlerForceValue)

	http.ListenAndServe("localhost:8080", nil)
}

/* Http handlers for core */

// Tasks
func (s *HTTPServer) handlerGetTasks(w http.ResponseWriter, r *http.Request) {

	var tsks []types.Task
	s.db.GetAll(&tsks)
	tsksJSON, _ := json.Marshal(tsks)

	w.Write(tsksJSON)
}
func (s *HTTPServer) handlerDeleteTasks(w http.ResponseWriter, r *http.Request) {

}

// Devices
func (s *HTTPServer) handlerGetDeviceConfig(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)
	fdJSON, _ := json.Marshal(fd)

	w.Write(fdJSON)
}
func (s *HTTPServer) handlerModifyDeviceConfig(w http.ResponseWriter, r *http.Request) {

}
func (s *HTTPServer) handlerAddDeviceConfig(w http.ResponseWriter, r *http.Request) {

}
func (s *HTTPServer) handlerDeleteDeviceConfig(w http.ResponseWriter, r *http.Request) {

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
func (s *HTTPServer) handlerWriteValue(w http.ResponseWriter, r *http.Request) {

}
func (s *HTTPServer) handlerForceValue(w http.ResponseWriter, r *http.Request) {

}
