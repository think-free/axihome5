package store

import (
    "io/ioutil"
    "net/http"
    "os"
    "os/exec"
    "io"
    "encoding/json"
    "strings"
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

    response, err := http.Get(s.url)
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

func (s *Store) DownloadPluginFromUrl(pluginUrl string) {

    out, _ := os.Create("/tmp/downloaded.plugin")
    defer out.Close()
    resp, _ := http.Get(pluginUrl)
    defer resp.Body.Close()
    io.Copy(out, resp.Body)
}

func (s *Store) run(path, name string, args ...string) {

	cmd := exec.Command(name, args...)
	cmd.Dir = path
}
