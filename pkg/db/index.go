package db

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"regexp"
	// "slices"
	"sort"
	"bytes"
	"strings"
	"errors"
	"github.com/schollz/progressbar/v3"

	_ "github.com/go-sql-driver/mysql"
)

type FileScanner struct {
	io.Closer
	*bufio.Scanner
}

type Verse struct {
	Book_id string `json:"book_id"`
	Book_name string `json:"book_name"`
	Chapter int `json:"chapter"`
	Verse int `json:"verse"`
	Text string `json:"text"`
}

type RandomVerse struct {
	Id int
	Book_id string `json:"book_id"`
	Book_name string `json:"book_name"`
	Chapter int `json:"chapter"`
	Verse int `json:"verse"`
	Text string `json:"text"`
}

type Chapter struct {
	Header string `json:"header"`
	Footer string `json:"footer"`
	Verses []Verse `json:"verses"`
}

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

// type Db struct {
// 	
// 	*sql.DB
// }

var Db *sql.DB

func InitDb() {
	db, err := sql.Open("mysql", "root:london-tasmania-broil-scorch-nov-chinese@tcp(localhost:3306)/bible_detective")

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

func setupKjv(db *sql.DB) error {
	// _, err := db.Exec(`DROP TABLE kjv`) 
	// if err != nil {
	// 	fmt.Println("error creating table...")
	// 	panic(err.Error())
	// }
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

// func setupKjvData(db *sql.DB) error {
// 	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS `)
// 	if err != nil {
// 		fmt.Println("error creating table...")
// 		panic(err.Error())
// 	}
// 	
// 	return nil
// }

func setupFbv(db *sql.DB) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS fbv (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	book TEXT NOT NULL,
	chapter INTEGER NOT NULL,
	verse INTEGER NOT NULL,
	content TEXT NOT NULL
	)`) 
	if err != nil {
		fmt.Println("error creating table...")
		panic(err.Error())
	}
	// reReference := regexp.MustCompile(`[A-Z]{3}\.[1-9]+\.[1-9]+`)
	// reSplitter := regexp.MustCompile(`\.`)
	reContent := regexp.MustCompile(`Content: (.+)`)
	scanner := readByLine("pkg/parser/fbv.txt")

	fmt.Println(scanner.Text())
	for scanner.Scan() {
		// fmt.Println(scanner.Text())
		// reference := reSplitter.Split(string(reReference.Find([]byte(scanner.Text()))), -1)
		content := reContent.FindSubmatch([]byte(scanner.Text()))
		fmt.Println(string(content[1]))
		// fmt.Println(string(re.Find([]byte(scanner.Text()))))
	}
	return nil	
}

func readByLine(filename string) *bufio.Scanner {
	// fmt.Println(os.Getwd())
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("error opening Bible file...")
	}
	// defer file.Close()
	
	scanner := bufio.NewScanner(file)
	// for scanner.Scan() {
	// 	fmt.Print(scanner.Text());
	// }
	return scanner
}

func getKjvData(directory string) error {
	return nil
}

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
