package main

import (
	"bible-detective/site/pkg/router"
	"bible-detective/site/pkg/db"
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

func main() {
	// Parse templates
	templates, err := template.ParseGlob(path.Join(template_files, "*.html"))
	if err != nil {
		log.Fatalf("Error loading templates: %v\n", err)
	}
	
	db.InitDb()

	e := echo.New()
	
	e.Renderer = &TemplateRenderer{
		template: templates,
	}
	// Static files
	e.Static("/js", "public/js")
	e.Static("/css", "public/css")
	e.Static("/img", "public/img")

	e.GET("/", router.Index)
	e.GET("/play", router.Play)
	e.GET("/random", router.Random)
	e.GET("/api/:verse", router.Api)

	e.Logger.Fatal(e.Start("localhost:8080"))
}

