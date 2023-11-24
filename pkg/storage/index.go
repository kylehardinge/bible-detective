package storage

import (
	"os"
	"fmt"
	"encoding/json"
	"bible-detective/site/pkg/db"
)

func OpenManifest(version string) (db.BibleManifest, error) {
	contents, err := os.ReadFile(fmt.Sprintf("assets/%s/manifest.json", version)) 
	if err != nil {
		panic(err.Error())
	}
	manifest := db.BibleManifest{}	
	json.Unmarshal(contents, &manifest)
	return manifest, nil
}
