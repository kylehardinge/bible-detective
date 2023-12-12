package main

import (
	"bible-detective/site/pkg/db"
	"bible-detective/site/pkg/router"
    // "crypto/tls"
    // "golang.org/x/crypto/acme"
    // "net/http"
	"html/template"
	"io"
	"log"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
    // "golang.org/x/crypto/acme/autocert"
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
	e.GET("/daily", router.Daily)
	e.GET("/test", router.Test)

	// Start the server on port 42069
	e.Logger.Fatal(e.Start("localhost:8080"))
}
