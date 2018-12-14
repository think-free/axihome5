package types

/* Device types */
/* *************************************** */

// DeviceType define a device type
type DeviceType string

// Device type definition
const (
	Switch       VariableType = "switch"
	Dimmer       VariableType = "dimmer"
	RGBSwitch    VariableType = "rgb"
	Shutter      VariableType = "shutter"
	Position     VariableType = "position"
	Time         VariableType = "time"
	Climate 	 VariableType = "climate"
	AudioPlayer  VariableType = "audio"
	AnalogValue  VariableType = "analog"
	DigitalValue VariableType = "digital"
	TextValue    VariableType = "text"
)


/* Variable types */
/* *************************************** */

// VariableType define a device type
type VariableType string

// Device type definition
const (
	Digital      DeviceType = "digital"   // [0,1]
	Analog       DeviceType = "analog"   // [0-100]
	Text    	 DeviceType = "text"     // (text)
	Position     DeviceType = "position" // [x,y]
	RGB          DeviceType = "rgb"      // [r,g,b]
)

/* Devices */
/* *************************************** */

// ClientDevice is the device sent to the clients
type ClientDevice struct {

	Type DeviceType `json:"type" storm:"type"`

	Name      string `json:"name"`   // Device name
	Group     string `json:"group"`  // The group of the device
	HomeID    string `json:"homeId"` // The Id of the home

	Variables []ClientVariable `json:"variables"`
}

type ClientVariable struct {
	Type string `json:"type"` // See above
	Name string `json:"name"` // Name of the device variable
}

// FieldDevice is the internal device type
// Tasks should send this struct on the mqtt topic :
// axihome/5/field/device/discover/{homeid}/{name} - FieldDevice json
type FieldDevice struct {
	ID             string `json:"id" storm:"id"`        // Device ID, fixed (used for backend)
	Type DeviceType `json:"type" storm:"type"`

	Name   string       `json:"name" storm:"index"`   // Device name (can be modified), used for frontend
	Group  string       `json:"group" storm:"index"`  // The group of the device
	HomeID string       `json:"homeId" storm:"index"` // The Id of the home

	Variables []FieldVariables `json:"variables"`
}

type FieldVariables struct {
	Name string `json:"name"` // Name of the device variable
	Type   VariableType `json:"type" storm:"index"`   // See above
	
	StatusTopic    string `json:"status" storm:"index"` // Read
	StatusTemplate string `json:"statusTemplate"`       // If Device is sending a json object, the key to read
	CmdTopic       string `json:"cmd" storm:"index"`    // Write
	CmdTemplate    string `json:"cmdTemplate"`          // If we have to send a json object, the key to write
}

/* Variables */
/* *************************************** */

// DeviceStatus is the current value of a device
type DeviceStatus struct {
	Name  string      `json:"key" storm:"index"` // Device Name (mqtt path -> HomeID + Group + DeviceName + VariableName)
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
