package store

import (
    "io/ioutil"
    "net/http"
    "os"
    "os/exec"
    "io"
    "encoding/json"
    "strings"
    "log"
)

// Manager manage the plugins
type Store struct {
	url string
    path string
}

type StoreItem struct {

    Name string
    Description string
    Icon string
    Url string
    Version string
    Installed bool
    UpToDate bool
}

// New create the manager
func New(url, path string) *Store {

	s := &Store{
		url:  url,
        path: path,
	}

	return s
}

// Run start the manager
func (s *Store) Run() {

}

func (s *Store) GetStoreContent() []byte {

    response, err := http.Get(s.url) // TODO : Cache content
    if err != nil {

        return []byte("[]")
    }

    contents, _ := ioutil.ReadAll(response.Body)

    var items []StoreItem
    var itemsChecked []StoreItem

    json.Unmarshal(contents, &items)

    for _, item := range items{

        if _, err := os.Stat(s.path + "/" + item.Name); os.IsNotExist(err) {
  			item.Installed = false
		} else {
            item.Installed = true

            b, err := ioutil.ReadFile(s.path + "/" + item.Name + "/version")
            if err != nil {
                item.UpToDate = false
            } else {

                if strings.TrimSuffix(string(b), "\n") == item.Version {
                    item.UpToDate = true
                } else {
                    item.UpToDate = false
                }
            }
        }

        itemsChecked = append(itemsChecked, item)
    }

    res, _ := json.Marshal(itemsChecked)
    return res
}

func (s *Store) DownloadPluginFromUrl(pluginUrl string) error { // FIXME : Handle errors

    log.Println("Starting download of plugin from :", pluginUrl)

    os.RemoveAll("/tmp/plugin_download")
    err := os.Mkdir("/tmp/plugin_download",0777);
    if err != nil {
        return err
    }
    out, err := os.Create("/tmp/plugin_download/downloaded.tar.gz")
    if err != nil {
        return err
    }
    defer out.Close()
    resp, err := http.Get(pluginUrl)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    io.Copy(out, resp.Body)

    s.run("/tmp/plugin_download", "tar", "xvf", "downloaded.tar.gz")
    os.Remove("/tmp/plugin_download/downloaded.tar.gz")

    files, err := ioutil.ReadDir("/tmp/plugin_download/")
	if err != nil {
		return(err)
	}

	for _, f := range files {

        if _, err := os.Stat(s.path + "/" + f.Name()); !os.IsNotExist(err) {
  			s.run(s.path + "/" + f.Name(), "docker-compose", "down")
            s.run(s.path + "/" + f.Name(), "docker-compose", "rm")
		}

        os.RemoveAll(s.path + "/" + f.Name())
        s.run("/tmp/plugin_download/", "mv", f.Name(), s.path + "/")
    }

    os.RemoveAll("/tmp/plugin_download")

    return nil
}

func (s *Store) run(path, name string, args ...string) {

    cmd := exec.Command(name, args...)
	cmd.Dir = path
	out, _ := cmd.CombinedOutput()
    log.Println(string(out))
}
