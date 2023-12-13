package main

import (
	"bible-detective/site/pkg/db"
	"bible-detective/site/pkg/router"
	"html/template"
	"io"
	"log"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
    // Uncomment when running the autocert
    // "golang.org/x/crypto/acme/autocert"
)

// Template completion
// Makes html repeatable
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
    
    // TLS stuff so that the website doesnt say "not secure"
    // When running on localhost the line below and the https redirect middleware is not needed. In testing it does not work
    // e.AutoTLSManager.Cache = autocert.DirCache("var/www/.cache")
	// Put sitewide middleware here
    // Redirect to https
    // e.Pre(middleware.HTTPSRedirect())
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
	api.GET("/manifest", router.Manifest)
	api.GET("/:query", router.Api)

	// General routes
	e.GET("/", router.Index)
	e.GET("/play", router.Play)
	e.GET("/newgame", router.NewGame)

	// Start the server on port 8080 localhost
    // On the server this is replaced to ":80" to start the server on port 80 of the machine
	e.Logger.Fatal(e.Start("localhost:8080"))
}
