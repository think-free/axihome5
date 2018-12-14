package types

/* Devices types */
/* *************************************** */

// VariableType define a device type
type VariableType string

// Device type definition
const (
	Switch       VariableType = "switch"   // [0,1]
	Dimmer       VariableType = "dimmer"   // [0-100]
	Shutter      VariableType = "shutter"  // [0-100]
	AnalogValue  VariableType = "analog"   // (Read only)
	DigitalValue VariableType = "digital"  // (Read only)
	TextValue    VariableType = "text"     // (Read only)
	Position     VariableType = "position" // [x,y]
	Time         VariableType = "time"     // int64
	RGB          VariableType = "rgb"      // [r,g,b]
)

/* Devices */
/* *************************************** */

// ClientDevice is the device sent to the clients
type ClientDevice struct {
	Name      string `json:"name"`   // Device name
	HomeID    string `json:"homeId"` // The Id of the home
	Group     string `json:"group"`  // The group of the device
	Variables []struct {
		Type string `json:"type"` // See above
		Name string `json:"name"` // Name of the device variable
	} `json:"variables"`
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

	Name   string       `json:"name" storm:"index"`   // Device name (can be modified), used for frontend
	HomeID string       `json:"homeId" storm:"index"` // The Id of the home
	Group  string       `json:"group" storm:"index"`  // The group of the device
	Type   VariableType `json:"type" storm:"index"`   // See above
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
	Name string `json:"name" storm:"index" storm:"unique"`
	URL  string `json:"url" storm:"id"`
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
