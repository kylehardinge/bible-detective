package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sort"
	"bytes"
	"strings"
	"bufio"
	"errors"
	"github.com/schollz/progressbar/v3"

	_ "github.com/go-sql-driver/mysql"
)

// Allows for passing a scanner in the return statment
// Not Implemented
// type FileScanner struct {
// 	io.Closer
// 	*bufio.Scanner
// }

// Allows for the representation of a bible verse
// Used for importing the kjv Bible from json
type Verse struct {
	Book_id string `json:"book_id"`
	Book_name string `json:"book_name"`
	Chapter int `json:"chapter"`
	Verse int `json:"verse"`
	Text string `json:"text"`
}

// Allows for the representation of a bible verse
type RandomVerse struct {
	Id int `json:"id"`
	Book_id string `json:"book_id"`
	Book_name string `json:"book_name"`
	Chapter int `json:"chapter"`
	Verse int `json:"verse"`
	Text string `json:"text"`
}

// Allows for the representation of a Chapter
// Used for importing the kjv Bible from json
type Chapter struct {
	Header string `json:"header"`
	Footer string `json:"footer"`
	Verses []Verse `json:"verses"`
}

// Used for the creation of a Bible manifest
type BibleManifest struct {
	Version string `json:"version"`
	Books []BookManifest `json:"books"`
}

type BookManifest struct {
	Name string `json:"name"`
	Id string `json:"id"`
	Index int `json:"index"`
	NumChapters int `json:"num_chapters"`
	Chapters []int `json:"chapters"`
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
	server string
	port string
	database string
}

var Db *sql.DB

// Initalize database and seed data
func InitDb() {
	db, err := sql.Open("mysql", dbConfig())

	if err != nil {
		fmt.Println("error validating sql.Open statement...")
		panic(err.Error())
	}

	// defer db.Close()

	err = db.Ping()
	if err != nil {
		fmt.Println("error verifying connection with db.Ping...")
		panic(err.Error())
	}

	err = seedData(db)
	if err != nil {
		fmt.Println("error seeding the data in the db")
		panic(err.Error())
	}

	fmt.Println("Connection successful to test database")
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

	bookDirectory := "assets/kjv/bible-json"
	books, err := os.ReadDir(bookDirectory)
	if err != nil {
		panic(err.Error())
	}

	var bookList []string
	for _, book := range books {
		bookList = append(bookList, book.Name())
	}
	
	correctBookOrder, correctBookSort, err := getBookOrder("assets/kjv/bookOrder.csv")
	if err != nil {
		panic(err.Error())
	}
	// fmt.Println(correctBookOrder)

	for i, book := range bookList {
		if book != correctBookSort[i] {
			fmt.Println(fmt.Sprintf("AHHH this book does not match %s <- err book | correct book -> %s", book, correctBookSort[i]))
			return errors.New("Error in naming of books")
		}
	}
	kjvManifest := BibleManifest{}
	kjvManifest.Version = "KJV"
	idNumber := 0
	bar := progressbar.Default(int64(len(correctBookOrder)), "Adding the KJV Bible to the database")
	for i, book := range correctBookOrder {
		// fmt.Println(makeFilePath(bookDirectory, book.Name()))
		// fmt.Println(i, book)
		chapters, err := os.ReadDir(makeFilePath(bookDirectory, book))
		if err != nil {
			panic(err.Error())
		}
		bookManifest := BookManifest{}
		bookManifest.Name = book
		bookManifest.Index = i + 1
		bar.Add(1)
		numChapters := len(chapters)	
		bookManifest.NumChapters = numChapters
		
		for chapter := 1; chapter <= numChapters; chapter++ {
			// fmt.Printf("--%s\n", chapter.Name())
			contents, err := os.ReadFile(makeFilePath(bookDirectory, book, fmt.Sprintf("%d.json", chapter)))
			if err != nil {
				panic(err.Error())
			}

			chapterJSON := Chapter{}
				
			json.Unmarshal(contents, &chapterJSON)
			numVerses := chapterJSON.Verses[len(chapterJSON.Verses)-1].Verse
			bookManifest.Chapters = append(bookManifest.Chapters, numVerses)
			if chapter == 1 {
				bookManifest.Id = chapterJSON.Verses[0].Book_id
			}
			for _, verse := range chapterJSON.Verses {
				_, err = db.Exec(`INSERT INTO kjv (book_id, book_name, chapter, verse, text) VALUES (?,?,?,?,?);`, verse.Book_id, verse.Book_name, verse.Chapter, verse.Verse, verse.Text)
				if err != nil {
					panic(err.Error())
				}
				idNumber++
			}
		}
		kjvManifest.Books = append(kjvManifest.Books, bookManifest)
	}
	// fmt.Println(kjvManifest)
	err = saveManifest(kjvManifest)	
	if err != nil {
		panic(err.Error())
	}

	// kjvManifestJSON, err := json.MarshalIndent(kjvManifest, "", "\t")
	if err != nil {
		panic(err.Error())
	}
	// fmt.Println(string(kjvManifestJSON))
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
	orderedBooks := strings.Split(strings.Split(string(content),"\n")[0], ",")
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

// Loads the server configuration info from db.config. This avoids having to store the password in this file.
func dbConfig() string {
	file, err := os.Open("db.config")
	if err != nil {
		panic(err.Error())
	}
	defer file.Close()
	dbInfo := dbConfigInfo{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		raw := strings.Split(scanner.Text(), "=")
		switch raw[0] {
		case "username":
			dbInfo.username = raw[1]
		case "password":
			dbInfo.password = raw[1]
		case "protocol":
			dbInfo.protocol = raw[1]
		case "server":
			dbInfo.server = raw[1]
		case "port":
			dbInfo.port = raw[1]
		case "database":
			dbInfo.database = raw[1]
		}
	}
	return fmt.Sprintf("%s:%s@%s(%s:%s)/%s", dbInfo.username, dbInfo.password, dbInfo.protocol, dbInfo.server, dbInfo.port, dbInfo.database)
}
