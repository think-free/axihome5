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

	// Devices
	http.HandleFunc("/core/getDevices", s.handlerGetDevice)
	http.HandleFunc("/core/modifyDevice", s.handlerModifyDevice)
	http.HandleFunc("/core/addDevice", s.handlerAddDevice)
	http.HandleFunc("/core/deleteDevice", s.handlerDeleteDevice)

	// Devices values
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
func (s *HTTPServer) handlerGetDevice(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)
	fdJSON, _ := json.Marshal(fd)

	w.Write(fdJSON)
}
func (s *HTTPServer) handlerModifyDevice(w http.ResponseWriter, r *http.Request) {

}
func (s *HTTPServer) handlerAddDevice(w http.ResponseWriter, r *http.Request) {

}
func (s *HTTPServer) handlerDeleteDevice(w http.ResponseWriter, r *http.Request) {

}

// Devices values
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
