package router

import (
	"bible-detective/site/pkg/db"
	"fmt"
	"net/http"
	"math/rand"
	

	"github.com/labstack/echo/v4"
)

func Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", nil)
}

func Play(c echo.Context) error {
	return c.Render(http.StatusOK, "play.html", nil)
}

func Random(c echo.Context) error {
	count := db.Db.QueryRow(`SELECT COUNT(*) FROM kjv`)

	var length int
	if err := count.Scan(&length); err != nil {
		panic(err.Error())
	}
	verse_id := rand.Intn(length) + 1
	var verse db.RandomVerse
	content := db.Db.QueryRow(`SELECT * FROM kjv WHERE id=?`, verse_id)
	if err := content.Scan(&verse.Id, &verse.Book_id, &verse.Book_name, &verse.Chapter, &verse.Verse, &verse.Text); err != nil {
		panic(err.Error())
	}
	return c.JSON(http.StatusOK, map[string]string{
		"book_id": verse.Book_id,
		"book_name": verse.Book_name,
		"chapter": fmt.Sprintf("%d", verse.Chapter),
		"verse": fmt.Sprintf("%d", verse.Verse),
		"text": verse.Text,
	})
}

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
