package main

import (
	"net/http"
	"html/template"
		
	"io"
	"log"
	"path"
	"fmt"

	"github.com/labstack/echo/v4"
)

const template_files string = "views"

type TemplateRenderer struct {
	template *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.template.ExecuteTemplate(w, name, data)
}
func Index(c echo.Context) error {
	return c.Render(http.StatusOK, "index.html", nil)
}

func Play(c echo.Context) error {
	return c.Render(http.StatusOK, "play.html", nil)
}

func Random(c echo.Context) error {
	return c.String(http.StatusOK, "play.html")
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

func main() {
	// Parse templates
	templates, err := template.ParseGlob(path.Join(template_files, "*.html"))
	if err != nil {
		log.Fatalf("Error loading templates: %v\n", err)
	}

	e := echo.New()
	
	e.Renderer = &TemplateRenderer{
		template: templates,
	}
	// Static files
	e.Static("/js", "public/js")
	e.Static("/css", "public/css")
	e.Static("/img", "public/img")

	e.GET("/", Index)
	e.GET("/play", Play)
	e.GET("/random", Random)
	e.GET("/api/:verse", Api)

	e.Logger.Fatal(e.Start("localhost:42069"))
}

