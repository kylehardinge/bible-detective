package parser

import (
	"fmt"
	"strings"
)


func SplitQuery(query string) (string, string, []string) {
	firstSplit := strings.Split(query, " ")
	fmt.Println(firstSplit)
	book := firstSplit[0]
	secondSplit := strings.Split(firstSplit[1], ":")
	fmt.Println(secondSplit)
	chapter := secondSplit[0]
	var verse []string
	fmt.Println(len(secondSplit))
	if len(secondSplit) > 1 {
		verse = strings.Split(secondSplit[1], "-")
	} else {
		// verse = append(verse, "")
	}
	return book, chapter, verse
}
