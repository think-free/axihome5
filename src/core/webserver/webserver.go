package webserver

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	uuid "github.com/satori/go.uuid"
	stormwrapper "github.com/think-free/storm-wrapper"

	"core/types"
)

// WebServer is the core http server
type WebServer struct {
	db               *stormwrapper.Db
	registeredRoutes map[string]struct{}
}

// New create a new http server instance
func New(db *stormwrapper.Db) *WebServer {

	// Create webserver

	return &WebServer{
		db:               db,
		registeredRoutes: make(map[string]struct{}),
	}
}

// Run start the http server
func (s *WebServer) Run() {

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

	// Login
	http.HandleFunc("/core/login", s.handlerLogin)
	http.HandleFunc("/core/getLoginInfo", s.handlerGetLoginInfo)
	
	http.HandleFunc("/core/logout", s.checkLoggedHandlerFunc(s.handlerLogout))
	http.HandleFunc("/core/renewLoginToken", s.checkLoggedHandlerFunc(s.handlerRenewLoginToken))
	http.HandleFunc("/core/getUsers", s.checkLoggedHandlerFunc(s.handlerGetUsers))
	http.HandleFunc("/core/addUser", s.checkLoggedHandlerFunc(s.handlerAddUser))
	http.HandleFunc("/core/delUser", s.checkLoggedHandlerFunc(s.handlerDelUser))

	// Config
	http.HandleFunc("/core/setConfig", s.checkLoggedHandlerFunc(s.handlerSetConfig)) // POST : types.Config
	http.HandleFunc("/core/getConfig", s.checkLoggedHandlerFunc(s.handlerGetConfig)) // GET : key, task

	// Tasks
	http.HandleFunc("/core/getTasks", s.checkLoggedHandlerFunc(s.handlerGetTasks))      // GET
	http.HandleFunc("/core/deleteTask", s.checkLoggedHandlerFunc(s.handlerDeleteTasks)) // GET : name

	// Devices Config
	http.HandleFunc("/core/getDevicesConfig", s.checkLoggedHandlerFunc(s.handlerGetDeviceConfig))      // GET
	http.HandleFunc("/core/modifyDeviceConfig", s.checkLoggedHandlerFunc(s.handlerModifyDeviceConfig)) // POST : types.FieldDevice
	http.HandleFunc("/core/addDeviceConfig", s.checkLoggedHandlerFunc(s.handlerAddDeviceConfig))       // POST : types.FieldDevice
	http.HandleFunc("/core/deleteDeviceConfig", s.checkLoggedHandlerFunc(s.handlerDeleteDeviceConfig)) // GET : id

	// Devices values
	http.HandleFunc("/core/getDevices", s.checkLoggedHandlerFunc(s.handlerGetDevices))    // GET
	http.HandleFunc("/core/getValues", s.checkLoggedHandlerFunc(s.handlerGetAllValues))   // GET
	http.HandleFunc("/core/getValue", s.checkLoggedHandlerFunc(s.handlerGetSingleValues)) // GET : key
	http.HandleFunc("/core/writeValue", s.checkLoggedHandlerFunc(s.handlerWriteValue))    // TODO
	http.HandleFunc("/core/forceValue", s.checkLoggedHandlerFunc(s.handlerForceValue))    // TODO
	http.HandleFunc("/core/deleteValue", s.checkLoggedHandlerFunc(s.handlerDeleteValue))  // GET : key

	// UI
	http.HandleFunc("/", s.handlerDefaultUI)

	log.Println("Core will start listening on port :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

/* Tasks routes */

func (s *WebServer) addTaskRouteHandler(task *types.Task) {

	// TODO : Allow modify route already registered

	log.Println("Registering task http handler :", task.Name)
	u, _ := url.Parse("http://" + task.Host + ":" + task.Port)

	if _, ok := s.registeredRoutes[task.URL]; !ok {

		s.registeredRoutes[task.URL] = struct{}{}
		if task.URL == "login" || task.URL == "admin" {
			http.Handle("/"+task.URL+"/", httputil.NewSingleHostReverseProxy(u))
		} else {
			http.Handle("/"+task.URL+"/", s.checkLoggedHandler(httputil.NewSingleHostReverseProxy(u)))
		}
	} else {
		log.Println("Already registered route, skipping")
	}
}

/* Login managment */

func (s *WebServer) handlerLogin(w http.ResponseWriter, r *http.Request) {

	// Reading post body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting post body :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"" + err.Error() + "\"}"))
		return
	}

	// Parsing json
	var c types.User
	errUnmarshall := json.Unmarshal(body, &c)
	if errUnmarshall != nil {
		log.Println("Error parsing json :", errUnmarshall)
		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"" + errUnmarshall.Error() + "\"}"))
		return
	}

	// Checking login
	noUser := false
	var dbUser types.User
	err2 := s.db.Get("Name", c.Name, &dbUser)
	if err2 != nil {

		var dbUsers []types.User
		s.db.GetAll(&dbUsers)
		if len(dbUsers) == 0 {
			log.Println("Please register a user ! We are allowing access to everybody !")
			noUser = true
		} else {
            log.Println("Invalid login name :", c.Name)
            w.Write([]byte("{\"type\" : \"error\", \"msg\": \"Bad credential\"}"))
            return
		}
	}
	if noUser == true || c.Password == dbUser.Password {

		// Creating session
		id1, _ := uuid.NewV4()
		id2, _ := uuid.NewV4()
		session := &types.Session{
			UserName: c.Name,
			SSID:     id1.String(),
			ClientID: id2.String(),
			Time:     time.Now(),
		}

		// Creating client id
		clientCookie, err := r.Cookie("client")
		if err != nil {
			log.Println("Setting client id for", r.Host)

			ck1 := http.Cookie{
				Name:    "client",
				Value:   session.ClientID,
				Expires: time.Now().Add(600 * time.Second),
				Path:    "/",
			}

			http.SetCookie(w, &ck1)

		} else {
			session.ClientID = clientCookie.Value
		}

		// Setting SSID
		ck2 := http.Cookie{
			Name:    "ssid",
			Value:   session.SSID,
			Expires: time.Now().Add(600 * time.Second),
			Path:    "/",
		}

		http.SetCookie(w, &ck2)
		s.db.Save(session)

		// Writting info to client
		w.Write([]byte("{\"type\" : \"login\", \"user\": \"" + session.UserName + "\" , \"ssid\": \"" + session.SSID + "\" , \"client\": \"" + session.ClientID + "\"}"))

	} else {

		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"Bad credential\"}"))
	}
}

func (s *WebServer) handlerLogout(w http.ResponseWriter, r *http.Request) {

	ssid, err := r.Cookie("ssid")
	if err == nil {

		var session types.Session
		s.db.Get("SSID", ssid.Value, &session)
		s.db.Remove(&session)
	}

	w.Write([]byte("{\"type\" : \"logout\"}"))
}

func (s *WebServer) handlerGetLoginInfo(w http.ResponseWriter, r *http.Request) {

	client, err1 := r.Cookie("client")
	if err1 == nil {

		ssid, err2 := r.Cookie("ssid")
		if err2 == nil {

			var session types.Session
			s.db.Get("SSID", ssid.Value, &session)
			if session.ClientID == client.Value && session.Time.Unix()+600 > time.Now().Unix() {

				w.Write([]byte("{\"type\" : \"login\", \"user\": \"" + session.UserName + "\" , \"ssid\": \"" + session.SSID + "\" , \"client\": \"" + session.ClientID + "\"}"))
				return

			} else if session.Time.Unix()+600 < time.Now().Unix() {
				s.db.Remove(&session)
			}
		}
	}

	w.Write([]byte("{\"type\" : \"logout\"}"))
}

func (s *WebServer) handlerRenewLoginToken(w http.ResponseWriter, r *http.Request) {

	client, err1 := r.Cookie("client")
	if err1 == nil {

		ssid, err2 := r.Cookie("ssid")
		if err2 == nil {

			var session types.Session
			s.db.Get("SSID", ssid.Value, &session)
			if session.ClientID == client.Value && session.Time.Unix()+600 > time.Now().Unix() {

				id, _ := uuid.NewV4()
				newsession := &types.Session{
					UserName: session.UserName,
					SSID:     id.String(),
					ClientID: session.ClientID,
					Time:     time.Now(),
				}

				ck := http.Cookie{
					Name:    "ssid",
					Value:   newsession.SSID,
					Expires: time.Now().Add(600 * time.Second),
					Path:    "/",
				}

				http.SetCookie(w, &ck)
				s.db.Save(session)

				w.Write([]byte("{\"type\" : \"login\", \"user\": \"" + newsession.UserName + "\" , \"ssid\": \"" + newsession.SSID + "\" , \"client\": \"" + newsession.ClientID + "\"}"))
				return
			}
		}
	}

	w.Write([]byte("{\"type\" : \"logout\"}"))
}

func (s *WebServer) handlerGetUsers(w http.ResponseWriter, r *http.Request) {

	var users []types.User
	s.db.GetAll(&users)
	json, _ := json.Marshal(&users)
	w.Write(json)
}

func (s *WebServer) handlerAddUser(w http.ResponseWriter, r *http.Request) {

	// Reading post body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("Error getting default UI :", err)
		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"" + err.Error() + "\"}"))
		return
	}

	// Parsing json
	var c types.User
	errUnmarshall := json.Unmarshal(body, &c)
	if errUnmarshall != nil {
		log.Println("Error parsing json :", errUnmarshall)
		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"" + errUnmarshall.Error() + "\"}"))
		return
	}

	// Checking if user is already registered
	var dbUser types.User
	err2 := s.db.Get("Name", c.Name, &dbUser)

	if err2 == nil {

		w.Write([]byte("{\"type\" : \"error\", \"msg\": \"User already registered\"}"))

	} else {

		s.db.Save(&c)
	}
}

func (s *WebServer) handlerDelUser(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["name"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var user types.User
	s.db.Get("Name", string(key), &user)
	s.db.Remove(&user)

	log.Println("Deleting user :", string(key))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"User deleted\"}"))
}

func (s *WebServer) checkLoggedHandlerFunc(authFct func(http.ResponseWriter, *http.Request)) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		client, err1 := r.Cookie("client")
		if err1 == nil {

			ssid, err2 := r.Cookie("ssid")
			if err2 == nil {

				var session types.Session
				s.db.Get("SSID", ssid.Value, &session)
				if session.ClientID == client.Value && session.Time.Unix()+600 > time.Now().Unix() {

					authFct(w, r)
					return
				}
			}
		}

		w.Write([]byte("{\"type\" : \"logout\"}"))
	}
}

func (s *WebServer) checkLoggedHandler(next http.Handler) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		client, err1 := r.Cookie("client")
		if err1 == nil {

			ssid, err2 := r.Cookie("ssid")
			if err2 == nil {

				var session types.Session
				s.db.Get("SSID", ssid.Value, &session)
				if session.ClientID == client.Value && session.Time.Unix()+600 > time.Now().Unix() {

					next.ServeHTTP(w, r)
					return
				}
			}
		}

		w.Write([]byte("{\"type\" : \"logout\"}"))
	}
}

/* Http handlers for UI */

func (s *WebServer) handlerDefaultUI(w http.ResponseWriter, r *http.Request) {

	// TODO : Route to default UI (task)
}

/* Http handlers for core */

// Config
func (s *WebServer) handlerSetConfig(w http.ResponseWriter, r *http.Request) {

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

func (s *WebServer) handlerGetConfig(w http.ResponseWriter, r *http.Request) {

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
func (s *WebServer) handlerGetTasks(w http.ResponseWriter, r *http.Request) {

	var tsks []types.Task
	s.db.GetAll(&tsks)
	tsksJSON, _ := json.Marshal(tsks)

	w.Write(tsksJSON)
}

func (s *WebServer) handlerDeleteTasks(w http.ResponseWriter, r *http.Request) {

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

	log.Println("Deleting task :", string(key))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Task deleted\"}"))
}

// Devices
func (s *WebServer) handlerGetDeviceConfig(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)
	fdJSON, _ := json.Marshal(fd)

	w.Write(fdJSON)
}

func (s *WebServer) handlerModifyDeviceConfig(w http.ResponseWriter, r *http.Request) {

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

func (s *WebServer) handlerAddDeviceConfig(w http.ResponseWriter, r *http.Request) {

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

func (s *WebServer) handlerDeleteDeviceConfig(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["id"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	// Getting device
	var dev types.FieldDevice
	s.db.Get("ID", string(key), &dev)

	// Removing values for this device
	for _, v := range dev.Variables {

		key := dev.HomeID + "." + dev.Group + "." + dev.Name + "." + v.Name

		var ds types.DeviceStatus
		log.Println("Removing device value :", key)
		err := s.db.Get("Name", key, &ds)
		if err != nil {
			log.Println("Can't find value for device :", err)
		} else {
			err := s.db.Remove(&ds)
			if err != nil {
				log.Println("Can't delete value for device :", err)
			}
		}
	}

	// Removing device
	s.db.Remove(&dev)

	log.Println("Deleting device :", string(key))
	w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Device deleted\"}"))
}

// Devices values
func (s *WebServer) handlerGetDevices(w http.ResponseWriter, r *http.Request) {

	var fd []types.FieldDevice
	s.db.GetAll(&fd)

	var cdar []types.ClientDevice
	for _, d := range fd {

		cd := types.ClientDevice{
			Name:   d.Name,
			Group:  d.Group,
			HomeID: d.HomeID,
			Type:   d.Type,
		}

		for _, va := range d.Variables {
			v := types.ClientVariable{
				Type: va.Type,
				Name: va.Name,
			}
			cd.Variables = append(cd.Variables, v)
		}

		cdar = append(cdar, cd)
	}

	dsJSON, _ := json.Marshal(cdar)

	w.Write(dsJSON)
}

func (s *WebServer) handlerGetAllValues(w http.ResponseWriter, r *http.Request) {

	var ds []types.DeviceStatus
	s.db.GetAll(&ds)
	dsJSON, _ := json.Marshal(ds)

	w.Write(dsJSON)
}

func (s *WebServer) handlerGetSingleValues(w http.ResponseWriter, r *http.Request) {

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

func (s *WebServer) handlerWriteValue(w http.ResponseWriter, r *http.Request) { // TODO

	// Send to mqtt field topic for this device
}

func (s *WebServer) handlerForceValue(w http.ResponseWriter, r *http.Request) { // TODO

	// Save to database and send to mqtt client topic
}

func (s *WebServer) handlerDeleteValue(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["key"]
	if !ok || len(keys[0]) < 1 {
		log.Println("Url parameter missing")
		w.Write([]byte("{\"type\" : \"error\", \"msg\":\"Url parameter missing\"}"))
		return
	}
	key := keys[0]

	var ds types.DeviceStatus
	s.db.Get("Name", key, &ds)

	err := s.db.Remove(&ds)
	if err != nil {
		log.Println("Error removing value", err)
		w.Write([]byte("{\"type\" : \"log\", \"msg\": \"" + err.Error() + "\"}"))
	} else {
		log.Println("Deleting value")
		w.Write([]byte("{\"type\" : \"log\", \"msg\": \"Value deleted\"}"))
	}
}
