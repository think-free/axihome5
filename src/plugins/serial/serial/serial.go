package serial

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"
	"sync"
	"time"

	"core/types"

	"github.com/think-free/mqttclient"

	"github.com/jacobsa/go-serial/serial"
)

const (
	CWriteTopic  = "axihome/5/field/variable/"
	CDeviceTopic = "axihome/5/field/device/discover/"
)

type Value struct {
	Index    int    `json:"index"`
	Home     string `json:"home"`
	Group    string `json:"group"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Variable string `json:"variable"`
	Value    int    `json:"value"`
}

type Serial struct {
	config string
	cli    *mqttclient.MqttClient
	values map[int]Value
	sync.Mutex
}

func New(cli *mqttclient.MqttClient, config string) *Serial {

	return &Serial{
		config: config,
		cli:    cli,
	}
}

func (s *Serial) Run() {

	s.ReadConfig()

	// Serial port options
	serialOptions := serial.OpenOptions{
		PortName:        "/dev/ttyUSB0",
		BaudRate:        9600,
		DataBits:        8,
		StopBits:        1,
		MinimumReadSize: 4,
	}

	// Open the serial port
	port, err := serial.Open(serialOptions)
	if err != nil {
		log.Fatal("Serial open error : ", err)
	}

	defer port.Close()
	r := bufio.NewReader(port)

	go func() {

		for {

			s.Lock()
			for _, v := range s.values {

				dev := types.FieldDevice{
					ID:   v.Home + v.Group + v.Name,
					Type: types.GetDeviceTypeFromString(v.Type),

					Name:   v.Name,
					Group:  v.Group,
					HomeID: v.Home,

					Variables: []types.FieldVariables{
						types.FieldVariables{
							Name:        v.Variable,
							Type:        types.Digital,
							StatusTopic: CWriteTopic + "/" + v.Home + "/" + v.Group + "/" + v.Name,
						},
					},
				}

				s.cli.PublishMessageNoRetain(CDeviceTopic+"/"+v.Home+"/"+v.Group+"/"+v.Name, &dev)
			}
			s.Unlock()
			time.Sleep(time.Second * 30)
		}
	}()

	// Read from the port
	for {

		bt, _ := r.ReadBytes('\n')
		bts := string(bt)
		bts = strings.TrimSuffix(bts, "\n")

		s.ProcessFrame(bts)
	}
}

func (s *Serial) ProcessFrame(bts string) {

	s.Lock()
	for i, r := range bts {

		if val, ok := s.values[i]; ok {

			readedVal := 0
			if string(r) == "1" {
				readedVal = 1
			}

			if val.Value != readedVal {
				val.Value = readedVal

				s.cli.PublishMessage(CWriteTopic+"/"+val.Home+"/"+val.Group+"/"+val.Name, readedVal)
			}
		}
	}
	s.Unlock()
}

func (s *Serial) ReadConfig() {

	b, err := ioutil.ReadFile(s.config + "serial.json") // just pass the file name
	if err != nil {
		fmt.Print(err)
	}

	var js []Value
	json.Unmarshal(b, &js)

	s.Lock()
	s.values = make(map[int]Value)

	for _, v := range js {

		s.values[v.Index] = v
	}
	s.Unlock()
}

func (s *Serial) GetValues() []Value {

	b, err := ioutil.ReadFile(s.config + "serial.json") // just pass the file name
	if err != nil {
		fmt.Print(err)
	}

	var js []Value
	json.Unmarshal(b, &js)

	return js
}

func (s *Serial) SetValues(vals []Value) error {

	js, _ := json.Marshal(&vals)
	return ioutil.WriteFile(s.config+"serial.json", js, 0666)
}
