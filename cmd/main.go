package main

import (
	"bible-detective/site/pkg/router"
	"bible-detective/site/pkg/db"
	"html/template"
	"io"
	"log"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// Template completion
const template_files string = "views"

type TemplateRenderer struct {
	template *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.template.ExecuteTemplate(w, name, data)
}

// Main server function
func main() {
	// Parse templates
	templates, err := template.ParseGlob(path.Join(template_files, "*.html"))
	if err != nil {
		log.Fatalf("Error loading templates: %v\n", err)
	}
	
	// Call to initalize the database and seed data if needed
	db.InitDb()
	
	// Initalize a new echo server
	e := echo.New()

	// Put sitewide middleware here
	// Recover the runtime in cases of panics
	e.Use(middleware.Recover())
	// Log requests to the console
	e.Use(middleware.Logger())
	
	// Template renderer
	e.Renderer = &TemplateRenderer{
		template: templates,
	}

	// Static files
	e.Static("/js", "public/js")
	e.Static("/css", "public/css")
	e.Static("/img", "public/img")

	// Routes for the api
	api := e.Group("/api")
	api.GET("/random", router.Random)
	api.GET("/manifest", router.Random)
	api.GET("/:query", router.Api)

	// General routes
	e.GET("/", router.Index)
	e.GET("/play", router.Play)

	// Start the server on port 42069
	e.Logger.Fatal(e.Start("localhost:8080"))
}

