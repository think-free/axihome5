package types

/* Devices types */
/* *************************************** */

// DeviceType define a device type
type DeviceType string

// Device type definition
const (
	Switch       DeviceType = "switch"   // [0,1]
	Dimmer       DeviceType = "dimmer"   // [0-100]
	Shutter      DeviceType = "shutter"  // [0-100]
	AnalogValue  DeviceType = "analog"   // (Read only)
	DigitalValue DeviceType = "digital"  // (Read only)
	TextValue    DeviceType = "text"     // (Read only)
	Position     DeviceType = "position" // [x,y]
	Time         DeviceType = "time"     // int64
)

/* Devices */
/* *************************************** */

// ClientDevice is the device sent to the clients
type ClientDevice struct {
	Name   string     `json:"name"`   // Device name (can be modified), used for frontend
	HomeID string     `json:"homeId"` // The Id of the home
	Group  string     `json:"group"`  // The group of the device
	Type   DeviceType `json:"type"`   // See above
}

// FieldDevice is the internal device type
// Tasks should send this struct on the mqtt topic :
// axihome/5/field/device/discover/{homeid}/{name} - FieldDevice json
type FieldDevice struct {
	ID             string `json:"id" storm:"id"`        // Device ID, fixed (used for backend)
	StatusTopic    string `json:"status" storm:"index"` // Read
	StatusTemplate string `json:"statusTemplate"`       // If Device is sending a json object, the key to read
	CmdTopic       string `json:"cmd" storm:"index"`    // Write
	CmdTemplate    string `json:"cmdTemplate"`          // If we have to send a json object, the key to write

	Name   string     `json:"name" storm:"index"`   // Device name (can be modified), used for frontend
	HomeID string     `json:"homeId" storm:"index"` // The Id of the home
	Group  string     `json:"group" storm:"index"`  // The group of the device
	Type   DeviceType `json:"type" storm:"index"`   // See above
}

/* Variables */
/* *************************************** */

// DeviceStatus is the current value of a device
type DeviceStatus struct {
	Name  string      `json:"key" storm:"index"` // Device Name (mqtt path -> HomeID + Group + DeviceName)
	Route string      `json:"-" storm:"id"`
	Value interface{} `json:"value"`
}

/* Tasks */
/* *************************************** */

// Task define a task that autoregister his interface on the core
type Task struct {
	Name string `json:"name" storm:"id"`
	URL  string `json:"url" storm:"index" storm:"unique"`
	Host string `json:"host"`
	Port string `json:"port"`
}

/* Config */
/* *************************************** */

// Config is a configuration Key Value object that tasks can use
type Config struct {
	KeyTask string `storm:"id"`
	Key     string `json:"key"`
	Value   string `json:"value" storm:"index"`
	Task    string `json:"task"`
}
