package webserver

import (
    "io/ioutil"
    "log"
    "os"
    "os/exec"
    "os/signal"
    "syscall"
    "strings"
)

// Manager manage the plugins
type Manager struct {
	Path string
}

type Plugin struct {
	Name string `json:"name"`
	Disabled bool `json:"disabled"`
    Version string `json:"version"`
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

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGKILL)

	for {
		select {
		case _ = <-c:
			m.StopAllPlugins()
			os.Exit(0)
		}
	}
}

func (m *Manager) GetPlugins() []Plugin {

	var ar []Plugin

	files, err := ioutil.ReadDir(m.Path)
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range files {

		disabled := false
		if _, err := os.Stat(m.Path + "/" + f.Name() + "/disabled"); !os.IsNotExist(err) {
  			disabled = true
		}

        version := ""
        b, err := ioutil.ReadFile(m.Path + "/" + f.Name() + "/version")
        if err != nil {
            log.Println("Can't find version for plugin ", f.Name())
        } else {
            version = strings.TrimSuffix(string(b), "\n")
        }

		ar = append(ar, Plugin{
			Name : f.Name(),
			Disabled: disabled,
            Version: version,
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

	log.Println("Starting plugin :", plugin)
	go m.runNoOutput(m.Path + "/" + plugin, "docker-compose", "up")
}

func (m *Manager) StopPlugin(plugin string) {

	log.Println("Stopping plugin :", plugin)
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

func (m *Manager) runNoOutput(path, name string, args ...string) {

	cmd := exec.Command(name, args...)
	cmd.Dir = path
}

func (m *Manager) run(path, name string, args ...string) string {

	cmd := exec.Command(name, args...)
	cmd.Dir = path
	out, _ := cmd.CombinedOutput()

	return string(out)
}
