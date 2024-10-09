package db

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"regexp"
	"sort"
	"strings"

	"github.com/schollz/progressbar/v3"

	_ "github.com/go-sql-driver/mysql"
)

// Allows for the representation of a bible verse
// Used for importing the kjv Bible from json
type ImportVerse struct {
	Book_id   string `json:"book_id"`
	Book_name string `json:"book_name"`
	Chapter   int    `json:"chapter"`
	Verse     int    `json:"verse"`
	Text      string `json:"text"`
}

// Allows for the representation of a bible verse
type Verse struct {
	Id        int     `json:"id"`
	Book_id   string  `json:"book_id"`
	Book_name string  `json:"book_name"`
	Chapter   int     `json:"chapter"`
	Verse     int     `json:"verse"`
	Text      string  `json:"text"`
	Context   []Verse `json:"context"`
}

// Allows for the representation of a bible verse
type Chapter struct {
	Header string  `json:"header"`
	Footer string  `json:"footer"`
	Verses []Verse `json:"verses"`
}

// Allows for the representation of a bible verse
type VerseGroup struct {
	Verses []Verse `json:"verses"`
}

// Allows for the representation of a ImportChapter
// Used for importing the kjv Bible from json
type ImportChapter struct {
	Header string        `json:"header"`
	Footer string        `json:"footer"`
	Verses []ImportVerse `json:"verses"`
}

// Structs below are used for the creation of a Bible manifest
type BibleManifest struct {
	Version string         `json:"version"`
	Books   []BookManifest `json:"books"`
}

type BookManifest struct {
	Name        string `json:"name"`
	Id          string `json:"id"`
	Index       int    `json:"index"`
	NumChapters int    `json:"num_chapters"`
	Chapters    []int  `json:"chapters"`
}

type ChapterManifest struct {
	Number int
	Verses int
}

// Stores the configuration information for the mysql database
type dbConfigInfo struct {
	username string
	password string
	protocol string
	server   string
	port     string
	database string
}

// A pointer to the database so other files can access it
var Db *sql.DB

// Initalize database and seed data
func InitDb() {
    // Open the database
	db, err := sql.Open("mysql", dbConfig())

	if err != nil {
		fmt.Println("error validating sql.Open statement...")
		panic(err.Error())
	}

    // Ping the database to verify a connection
	err = db.Ping()
	if err != nil {
		fmt.Println("error verifying connection with db.Ping...")
		panic(err.Error())
	}

    // Attempt to seed the database with data
	err = seedData(db)
	if err != nil {
		fmt.Println("error seeding the data in the db")
		panic(err.Error())
	}

    // If everything is successful the database is useful
	fmt.Println("Connection successful to database")
	Db = db
}

// Checks if the database needs seeding
func seedData(db *sql.DB) error {
	result := db.QueryRow("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'kjv'")

	var name string
	err := result.Scan(&name)
	if err != nil && name == "" {
		err = setupKjv(db)
		if err != nil {
			fmt.Println("error setting up the KJV database...")
		}
	}

	return nil
}

// Setups the KJV bible by adding the data to the database and generating the manifest
func setupKjv(db *sql.DB) error {
    // Create the table with specified rows
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS kjv (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	book_id TEXT NOT NULL,
	book_name TEXT NOT NULL,
	chapter INTEGER NOT NULL,
	verse INTEGER NOT NULL,
	text TEXT NOT NULL
	)`)
	if err != nil {
		fmt.Println("error creating table...")
		panic(err.Error())
	}

    // Read the directory containing all the books of the KJV Bible
	bookDirectory := "assets/kjv/bible-json"
	books, err := os.ReadDir(bookDirectory)
	if err != nil {
		panic(err.Error())
	}

	var bookList []string
	for _, book := range books {
		bookList = append(bookList, book.Name())
	}

    // Correct the book order so the books are correctly added to the database
	correctBookOrder, correctBookSort, err := getBookOrder("assets/kjv/bookOrder.csv")
	if err != nil {
		panic(err.Error())
	}

    // Remove red letters of Jesus, paragraph markers, and emphasized text tags so the game is harder/more consistent
	removeHints, err := regexp.Compile(`¶|<span style="color:red;">|<\/span>|<em>|<\/em>`)
	if err != nil {
		panic(err.Error())
	}

    // Verify the books are in the correct order
	for i, book := range bookList {
		if book != correctBookSort[i] {
			fmt.Println(fmt.Sprintf("AHHH this book does not match %s <- err book | correct book -> %s", book, correctBookSort[i]))
			return errors.New("Error in naming of books")
		}
	}
    
    // This is for generating the manifest of the KJV
	kjvManifest := BibleManifest{}
	kjvManifest.Version = "kjv"
    
    // Id number of the Bible verses
	idNumber := 0
    // A progress bar because who doesn't need a progress bar
	bar := progressbar.Default(int64(len(correctBookOrder)), "Adding the KJV Bible to the database")
	for i, book := range correctBookOrder {
        // Get a list of all the chapters
		chapters, err := os.ReadDir(makeFilePath(bookDirectory, book))
		if err != nil {
			panic(err.Error())
		}
        
        // This is to generate a manifest for the book to be added to the Bible manifest
		bookManifest := BookManifest{}
		bookManifest.Name = book
		bookManifest.Index = i + 1

        // Increment the progress bar each time a new book is getting added
		bar.Add(1)

        // Get the number of chapters based on the number of files read
        // This is to allow the chapters to be read in order instead of 1, 10, 11,... 2, 20, 21, etc.
        // That would get the ID numbers all messed up.
		numChapters := len(chapters)
		bookManifest.NumChapters = numChapters

        // Loop through each chapter and read the contents to be inserted into the database
		for chapter := 1; chapter <= numChapters; chapter++ {
            // Read the chapter and get the text contents
			contents, err := os.ReadFile(makeFilePath(bookDirectory, book, fmt.Sprintf("%d.json", chapter)))
			if err != nil {
				panic(err.Error())
			}

            // Create an instance of a struct to make the json with
            // Go requires this to parse json
            // Its a minor pain but very easy to use once setup
			chapterJSON := ImportChapter{}

            // Unmarshall the data into the chapterJSON struct
			json.Unmarshal(contents, &chapterJSON)
            
            // Get the number of verses and add it to the manifest
			numVerses := chapterJSON.Verses[len(chapterJSON.Verses)-1].Verse
			bookManifest.Chapters = append(bookManifest.Chapters, numVerses)

            // This was the easisest way to set the book_id of the book
			if chapter == 1 {
				bookManifest.Id = chapterJSON.Verses[0].Book_id
			}

            // Loop through the verses and add them to the database
            // Later this could be converted into a single query with a transaction
			for _, verse := range chapterJSON.Verses {
                // Remove all of the possible hints mentioned above
				noHintText := removeHints.ReplaceAll([]byte(verse.Text), []byte(""))
                // Insert the data into the database
				_, err = db.Exec(`INSERT INTO kjv (book_id, book_name, chapter, verse, text) VALUES (?,?,?,?,?);`, verse.Book_id, verse.Book_name, verse.Chapter, verse.Verse, string(noHintText[:]))
				if err != nil {
					panic(err.Error())
				}
                // Increase the id number
				idNumber++
			}
		}
        // Add the book just generated to the manifest
		kjvManifest.Books = append(kjvManifest.Books, bookManifest)
	}
    // Save the manifest to a file
	err = saveManifest(kjvManifest)
	if err != nil {
		panic(err.Error())
	}

    // Let the administrator know the data has been entered
	fmt.Println("Data has been entered")

	return nil
}

// Helper function to create a file path from multiple parts
// Returns a completed file path
func makeFilePath(part ...string) string {
	filePath := ""
	for i, fp := range part {
		if i != 0 {
			filePath += "/"
		}
		filePath += fp
	}
	return filePath
}

// Reads the correct order of books from a file
// Returns the correct book order and the books in alphabetical order
func getBookOrder(filepath string) ([]string, []string, error) {
	content, err := os.ReadFile(filepath)
	if err != nil {
		panic(err.Error())
	}
	orderedBooks := strings.Split(strings.Split(string(content), "|")[0], ",")
	books := make([]string, len(orderedBooks))
	copy(books, orderedBooks)
	sort.Strings(orderedBooks)
	return books, orderedBooks, nil
}

// Saves a given manifest to disk under assets/{insert version here}/manifest.json
func saveManifest(manifest BibleManifest) error {
	file, err := os.Create(fmt.Sprintf("assets/%s/manifest.json", manifest.Version))
	if err != nil {
		panic(err.Error())
	}
	defer file.Close()

	manifestJSON, err := json.MarshalIndent(manifest, "", "\t")
	if err != nil {
		panic(err.Error())
	}
	manifestReader := bytes.NewReader(manifestJSON)
	_, err = io.Copy(file, manifestReader)
	if err != nil {
		panic(err.Error())
	}
	return err
}

// Loads the server configuration info from db.config. This avoids having to store the database password in this file.
// Returns the config in a formatted string that the go sql driver can understand
func dbConfig() string {
	dbInfo := dbConfigInfo{}
    dbInfo.username = os.Getenv("DATABASE_USERNAME")
    dbInfo.password = os.Getenv("DATABASE_PASSWORD")
    dbInfo.protocol = os.Getenv("DATABASE_PROTOCOL")
    dbInfo.server = os.Getenv("DATABASE_CONTAINER_NAME")
    dbInfo.database = os.Getenv("DATABASE_NAME")
	return fmt.Sprintf("%s:%s@%s(%s)/%s", dbInfo.username, dbInfo.password, dbInfo.protocol, dbInfo.server, dbInfo.database)
}
