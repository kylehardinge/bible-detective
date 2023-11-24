// All of the route functions go here
package router

import (
	"bible-detective/site/pkg/db"
	"bible-detective/site/pkg/storage"
	"fmt"
	"net/http"
	"math/rand"
	

	"github.com/labstack/echo/v4"
)

// The function corresponding with the "/" route
func Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", nil)
}

// The function corresponding with the "/play" route
func Play(c echo.Context) error {
	return c.Render(http.StatusOK, "play.html", nil)
}

// The function corresponding with the "/api/random" route
// Returns a random Bible verse
func Random(c echo.Context) error {
	// Get number of Bible verses
	count := db.Db.QueryRow(`SELECT COUNT(*) FROM kjv`)
	var length int
	if err := count.Scan(&length); err != nil {
		panic(err.Error())
	}
	
	// Generate a random verse id [1, max id number]
	verse_id := rand.Intn(length) + 1

	// Get a verse based on the random id number
	var verse db.RandomVerse
	content := db.Db.QueryRow(`SELECT * FROM kjv WHERE id=?`, verse_id)
	if err := content.Scan(&verse.Id, &verse.Book_id, &verse.Book_name, &verse.Chapter, &verse.Verse, &verse.Text); err != nil {
		panic(err.Error())
	}
	
	// Return the random bible verse in json format
	return c.JSON(http.StatusOK, verse)
}

// The function corresponding with the "/api/manifest" route
// Returns the Bible manifest for a given version (curently only kjv)
func Manifest(c echo.Context) error {
	kjvManifest, err := storage.OpenManifest("kjv")
	if err != nil {
		return err
	}
	// fmt.Println(string(kjvManifest))
	return c.JSON(http.StatusOK, kjvManifest)
}

// The function corresponding with the "/api/:query" route
// TODO: allow requests for specific verses or chapters
func Api(c echo.Context) error {
	
	verseBook := c.QueryParam("book")
	verseChapter := c.QueryParam("chapter")
	verseVerse := c.QueryParam("verse")
	
	dataType := c.Param("verse")

	if dataType == "string" {
		return c.String(http.StatusOK, fmt.Sprintf("you are requesting the verse %s %s:%s\n", verseBook, verseChapter, verseVerse))
	}

	if dataType == "json" {
		return c.JSON(http.StatusOK, map[string]string{
			"book": verseBook,
			"chapter": verseChapter,
			"verse": verseVerse,
			"content": "For God so loved the world...",
		})
	}

	return c.JSON(http.StatusBadRequest, map[string]string { "error": dataType })
}
