package types

import "time"

/* Device types */
/* *************************************** */

// DeviceType define a device type
type DeviceType string

// Device type definition
const (
	Switch       DeviceType = "switch" // Input device
	Light        DeviceType = "light"
	Dimmer       DeviceType = "dimmer"
	Shutter      DeviceType = "shutter"
	Position     DeviceType = "position"
	Occupancy    DeviceType = "occupancy"
	Time         DeviceType = "time"
	Climate      DeviceType = "climate"
	Power        DeviceType = "power"
	AudioPlayer  DeviceType = "audio"
	AnalogValue  DeviceType = "analog"
	DigitalValue DeviceType = "digital"
	TextValue    DeviceType = "text"
	CustomDevice DeviceType = "custom"
)

func GetDeviceTypeFromString(str string) DeviceType {

	switch str {
	case "switch":
		return Switch
	case "light":
		return Light
	case "dimmer":
		return Dimmer
	case "shutter":
		return Shutter
	case "position":
		return Position
	case "occupancy":
		return Occupancy
	case "time":
		return Time
	case "climate":
		return Climate
	case "power":
		return Power
	case "audio":
		return AudioPlayer
	case "analog":
		return AnalogValue
	case "digital":
		return DigitalValue
	case "text":
		return TextValue
	case "custom":
		return CustomDevice
	}

	return CustomDevice
}

/* Variable types */
/* *************************************** */

// VariableType define a device type
type VariableType string

// Device type definition
const (
	Digital        VariableType = "digital"  // [0-1]
	Analog         VariableType = "analog"   // [0-255]
	Number         VariableType = "number"   // Any number
	Text           VariableType = "text"     // (text)
	Coordinates    VariableType = "position" // [x,y]
	RGB            VariableType = "rgb"      // [r,g,b]
	CustomVariable VariableType = "custom"
)

func GetVariableTypeFromString(str string) VariableType {

	switch str {
	case "digital":
		return Digital
	case "analog":
		return Analog
	case "number":
		return Number
	case "text":
		return Text
	case "position":
		return Coordinates
	case "rgb":
		return RGB
	case "custom":
		return CustomVariable
	}

	return CustomVariable
}

/* Devices */
/* *************************************** */

// ClientDevice is the device sent to the clients
type ClientDevice struct {
	Type DeviceType `json:"type" storm:"type"`

	Name   string `json:"name"`   // Device name
	Group  string `json:"group"`  // The group of the device
	HomeID string `json:"homeId"` // The Id of the home

	Variables []ClientVariable `json:"variables"`
}

// ClientVariable are used in client devices to define variables in the device
type ClientVariable struct {
	Type VariableType `json:"type"` // See above
	Name string       `json:"name"` // Name of the device variable
}

// FieldDevice is the internal device type
// Tasks should send this struct on the mqtt topic :
// axihome/5/field/device/discover/{homeid}/{name} - FieldDevice json
type FieldDevice struct {
	ID   string     `json:"id" storm:"id"` // Device ID, fixed (used for backend)
	Type DeviceType `json:"type"`          // The type of device

	Name   string `json:"name" storm:"index"`   // Device name (can be modified), used for frontend
	Group  string `json:"group" storm:"index"`  // The group of the device
	HomeID string `json:"homeId" storm:"index"` // The Id of the home

	Variables []FieldVariables `json:"variables"`
}

// FieldVariables are used in field devices to define variables in the device
type FieldVariables struct {
	Name string       `json:"name"`               // Name of the device variable
	Type VariableType `json:"type" storm:"index"` // See above

	StatusTopic    string `json:"status" storm:"index"` // Read
	StatusTemplate string `json:"statusTemplate"`       // If Device is sending a json object, the key to read
	CmdTopic       string `json:"cmd" storm:"index"`    // Write
	CmdTemplate    string `json:"cmdTemplate"`          // If we have to send a json object, the key to write
}

/* Variables */
/* *************************************** */

// DeviceStatus is the current value of a device
type DeviceStatus struct {
	Route string      `storm:"id" storm:"index"` // json:"-" doesn't work
	Name  string      `json:"key" storm:"index"` // Device Name (mqtt path -> HomeID + Group + DeviceName + VariableName)
	Value interface{} `json:"value"`
}

/* Tasks */
/* *************************************** */

// Task define a task that autoregister his interface on the core
type Task struct {
	Name       string `json:"name" storm:"index" storm:"unique"`
	URL        string `json:"url" storm:"id"`
	Host       string `json:"host"`
	Port       string `json:"port"`
	LastSeen   int64  `json:"lastseen"`
	Bookmarked bool   `json:"bookmarked"`
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

/* User */
/* *************************************** */

// User represent a user in the core
type User struct {
	Name     string `json:"user" storm:"id"`
	Password string `json:"password"`
}

// Session represent a user login
type Session struct {
	SSID     string    `json:"ssid" storm:"id"`
	UserName string    `json:"user" storm:"index"`
	ClientID string    `json:"cid" storm:"index"`
	Time     time.Time `json:"time" storm:"index"`
}

/* Cmd payload */
/* *************************************** */

// CmdPayload is a write request payload
type CmdPayload struct {
	User      string      `json:"user"`
	Device    string      `json:"device"`
	Payload   interface{} `json:"payload"`
	Signature string      `json:"signature"`
}
