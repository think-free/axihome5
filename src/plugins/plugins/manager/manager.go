package webserver

import (
	"fmt"
    "io/ioutil"
     "log"
	 "os"
	 "os/exec"
)

// Manager manage the plugins
type Manager struct {
	Path string
}

type Plugin struct {
	Name string `json:"name"`
	Disabled bool `json:"disabled"`
}

// New create the manager
func New(path string) *Manager {

	m := &Manager{
		Path:  path,
	}

	return m
}

// Run start the manager
func (m *Manager) Run() {

	m.StartAllPlugins()
}

func (m *Manager) GetPlugins() []Plugin {

	var ar []Plugin

	files, err := ioutil.ReadDir(m.Path)
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range files {
		fmt.Println(f.Name())

		disabled := false
		if _, err := os.Stat(m.Path + "/" + f.Name() + "/disabled"); !os.IsNotExist(err) {
  			disabled = true
		}

		ar = append(ar, Plugin{
			Name : f.Name(),
			Disabled: disabled,
		})
	}

	return ar
}

func (m *Manager) StartAllPlugins() {

	plugins := m.GetPlugins()

	for _, p := range plugins{

		if !p.Disabled {
			m.StartPlugin(p.Name)
		}
	}
}

func (m *Manager) StopAllPlugins() {

	plugins := m.GetPlugins()

	for _, p := range plugins{

		m.StopPlugin(p.Name)
	}
}

func (m *Manager) StartPlugin(plugin string) {

	m.run(m.Path + "/" + plugin, "docker-compose", "up", "-d")
}

func (m *Manager) StopPlugin(plugin string) {

	m.run(m.Path + "/" + plugin, "docker-compose", "down")
}

func (m *Manager) EnablePlugin(plugin string) {

	err := os.Remove(m.Path + "/" + plugin + "/disabled")
	if err != nil {
		log.Println(err)
	}

	m.StartPlugin(plugin)
}

func (m *Manager) DisablePlugin(plugin string) {

	m.StopPlugin(plugin)

	emptyFile, err := os.Create(m.Path + "/" + plugin + "/disabled")
	if err != nil {
		log.Println(err)
	}
	emptyFile.Close()
}

func (m *Manager) run(path, name string, args ...string) string {

	cmd := exec.Command(name, args...)
	cmd.Dir = path
	out, _ := cmd.CombinedOutput()

	return string(out)
}
