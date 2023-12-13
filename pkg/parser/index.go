package parser

import (
	"strings"
)


// Split the inputted query into a book chapter and verse(s)
func SplitQuery(query string) (string, string, []string) {
    // Split out the book
    // It must be a book code
	firstSplit := strings.Split(query, " ")
	book := firstSplit[0]
    // Split out the chapter from the query
	secondSplit := strings.Split(firstSplit[1], ":")
	chapter := secondSplit[0]
    // If there are verses, split those out, otherwise return an empty list
	var verse []string
	if len(secondSplit) > 1 {
		verse = strings.Split(secondSplit[1], "-")
	}
	return book, chapter, verse
}
