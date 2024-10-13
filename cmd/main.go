package main

import (
	"theoguessr/site/pkg/db"
	"theoguessr/site/pkg/router"
	"html/template"
	"io"
	"log"
	"os"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/crypto/acme/autocert"
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
    if (os.Getenv("IS_PROD") == "true") {
        e.AutoTLSManager.Cache = autocert.DirCache("var/www/.cache")
        // Middleware to redirect to https
        e.Pre(middleware.HTTPSRedirect())
        log.Printf("TLS/HTTPS enabled: true")
    }
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
	e.Static("/pwa", "public/pwa")

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
	e.Logger.Fatal(e.Start("0.0.0.0:8080"))
}
