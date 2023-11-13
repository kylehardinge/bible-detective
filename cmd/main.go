package main

import (
	"net/http"
	"html/template"
	
	"io"
	"log"
	"path"

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

	e.Logger.Fatal(e.Start("localhost:42069"))
}

