// Get all the necessicary document elements
let verseText = document.getElementById("verse-box");
let guessInputBook = document.getElementById("guess-input-book");
let guessInputChapter = document.getElementById("guess-input-chapter");
let guessInputVerse = document.getElementById("guess-input-verse");
let guessButton = document.getElementById("guess-btn");
let roundScore = document.getElementById("round-score");
let totalScoreText = document.getElementById("total-score");
let finalScoreText = document.getElementById("final-score");
let userGuess = document.getElementById("guessed-verse");
let actualReference = document.getElementById("correct-verse");
let nextRoundButtons = document.getElementsByClassName("next-round-btn");
let referenceChapter = document.getElementById("reference-chapter");
let guessedChapter = document.getElementById("guessed-chapter");
let finishWindow = document.getElementById("finish-window");
let gameWindow = document.getElementById("game-window");
let scoreWindow = document.getElementById("scoring-window");

// What verse are we guessing?
let verseToGuess;

// API calls

// Get a random verse or verses based on difficulty
async function getRandomVerse() {
    let difficulty = localStorage.getItem("difficulty");
    let contextVerses;
    switch (difficulty) {
        case "easy":
            contextVerses = 3;
            break;
        case null:
            localStorage.setItem("difficulty", "medium");
        // FALL THROUGH!
        case "medium":
            contextVerses = 1;
            break;
        case "hard":
        // FALL THROUGH!
        // case "impossible":
        //     contextVerses = 0;
        //     break;
    }
    let response = await fetch(`/api/random?contextVerses=${contextVerses}`);
    let verse = await response.json();
    return verse;
}

// Get a specific verse (for when the user makes a guess)
async function getSpecificVerse(verse) {
    let response = await fetch(`/api/${verse}`);
    let specificVerse = await response.json();
    return specificVerse;
}

// Get the Bible manifest
async function getManifest() {
    let response = await fetch(`/api/manifest`);
    let manifest = await response.json();
    return manifest;
}


// Helper functions

// Covert a books name to its id
function nameToId(book) {
    for (let manifestBook of manifest.books) {
        if (book == manifestBook.name) {
            return manifestBook.id;
        }
    }
}

// Return a message based on a given score
function message(score) {
    if (score == 5000) {
        return "Excellent!";
    } else if (score >= 4900) {
        return "So Close!";
    } else if (score >= 3000) {
        return "Good Job!"
    } else if (score >= 1500) {
        return "Not Bad!"
    } else {
        return "Nice Try!"
        // return "OT Prophecy!?"
    }

}

// Empty scoring text and get new verse for new round
function resetGame() {
    gameWindow.style.display = "flex";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";
    roundScore.innerText = "";
    userGuess.innerText = "";
    actualReference.innerText = "";
    populateVerse();
}

// When the game is finished, do all the necessary things
function finishGame() {
    // Remove footer for styling
    document.getElementById("footer").classList.add("hidden");
    // Make the finish window visible
    gameWindow.style.display = "none";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "flex";
    // Show the final score, avg distance, and total distance
    finalScoreText.innerText = totalScore.toLocaleString();
    document.getElementById("tot-distance").innerText = totalDistance.toLocaleString();
    document.getElementById("avg-distance").innerText = Math.round(totalDistance / 5).toLocaleString();

    // Set the highscores up to a max of 10
    // In the future it would be good to seperate difficulties
    let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    highscores.push({ "score": totalScore, "date": new Date().toLocaleDateString(), "difficulty": localStorage.getItem("difficulty") });
    highscores.sort((a, b) => b.score - a.score);
    highscores.splice(10);
    localStorage.setItem("highscores", JSON.stringify(highscores));
}

// Start a new game and reset various vars
function newGame() {
    round = 0;
    totalScore = 0;
    totalDistance = 0;
    resetButton.innerText = "Next Round";

    gameWindow.style.display = "block";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";

    populateVerse();
}

// Functions to remove the various autocompletes when the input is blurred
function removeVerseAC() {
    document.getElementById("verse-autocomplete-list").remove();
    guessInputVerse.removeEventListener("blur", removeVerseAC);
}

function removeChapterAC() {
    document.getElementById("chapter-autocomplete-list").remove();
    guessInputChapter.removeEventListener("blur", removeChapterAC);
}


// Game functions

// Get a random verse and put it on the screen
function populateVerse() {
    round += 1;

    // let difficulty = localStorage.getItem("difficulty");

    document.getElementById("round").innerText = round;
    getRandomVerse().then(function(result) {
        verseToGuess = result;
        let verseHTML = ``;
        // if (difficulty == "impossible") {
        //     let words = verseToGuess.text.split(" ");
        //     verseToGuess.text = words[Math.round(Math.random() * (words.length - 1))];
        // }
        for (let verse of result.context) {
            if (verse.id === result.id) {
                verseHTML += `<p class="border-solid border-Green border-2 p-1" id="verse-to-guess">${verseToGuess.text}</p>`;
            } else {
                verseHTML += `<p class="">${verse.text}</p>`;
            }
        }
        verseText.innerHTML = verseHTML;
    });
}

// Process the guess the user makes
function processGuess() {
    if (guessInputBook.value == "" || guessInputChapter.value == "" || guessInputVerse.value == "") {
        alert("Please make a guess");
        return;
    }
    let guessBook = nameToId(guessInputBook.value);
    let guessChapter = guessInputChapter.value;
    let guessVerse = guessInputVerse.value;

    let guess = `${guessBook} ${guessChapter}:${guessVerse}`;
    getSpecificVerse(guess).then(function(result) {
        if (result.text == undefined) {
            alert("Please make a guess");
            return;
        }

        let difference = Math.abs(result.id - verseToGuess.id);
        document.getElementById("distance").innerText = difference.toLocaleString();
        totalDistance += difference;
        let score = Math.abs(5200 * (Math.E ** ((-difference) / 7700)) - 200);
        if (difference >= 25100) {
            score = 0;
        }
        roundScore.innerText = Math.round(score).toLocaleString();
        totalScore += Math.round(score);
        totalScoreText.innerText = totalScore.toLocaleString();
        console.log(message(score))
        document.getElementById("round-message").innerText = message(score);
        document.getElementById("correct-reference").innerText = `${verseToGuess.book_name} ${verseToGuess.chapter}:${verseToGuess.verse}`;
        document.getElementById("correct-verse").innerText = verseToGuess.text;
        document.getElementById("guessed-reference").innerText = `${result.book_name} ${result.chapter}:${result.verse}`;
        document.getElementById("guessed-verse").innerText = result.text;

        if (round == 5) {
            for (let nextRoundButton of nextRoundButtons) {
                nextRoundButton.innerText = "Finish Game";
            }
        }
        gameWindow.style.display = "none";
        scoreWindow.style.display = "flex";
        finishWindow.style.display = "none";
        guessInputBook.value = "";
        guessInputChapter.value = "";
        guessInputVerse.value = "";
    });
}


// Copy functions

// Copy a message to the clipboard
async function copyContent() {
    let textToCopy = `🎉 I just played a game of TheoGuessr and got ${finalScoreText.innerText} points! 🚀\nHow well can you do? 😎\nhttp://theoguessr.com/`;

    try {
        await navigator.clipboard.writeText(textToCopy);
        showModal();
        setTimeout(closeModal, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
};

// Show the modal saying that the message was copied to clipboard
function showModal() {
    let modal = document.getElementById('copy-modal');
    modal.classList.remove("hidden");
    modal.classList.add("flex");
};

// Hide the modal saying that the message was copied to clipboard
function closeModal() {
    let modal = document.getElementById('copy-modal');
    modal.classList.add("hidden");
    modal.classList.remove("flex");
};


// Autocomplete functions

// Autocomplete for the chapters
function chapterAutoComplete() {
    // Verify it is possible to get a chapter count
    if (guessInputBook.value == "") {
        return
    }

    // Get the guessed book
    let guessBook = guessInputBook.value;
    let book = manifest.books.find(({ name }) => name.toLowerCase() === guessBook.toLowerCase())
    if (book == undefined) {
        return;
    }
    // Get the number of chapters of the book
    let numChapters = book.num_chapters;
    // Create vars for the divs for the autocomplete
    let outerDiv, chapterListDiv;
    // Create a div that will contain the chapters that are possible to guess
    outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "chapter-autocomplete-list");
    outerDiv.setAttribute("class", "autocomplete-numbers");
    // Add this div to the input element
    this.parentNode.appendChild(outerDiv);
    // Add the number of chapters that are possible to guess
    chapterListDiv = document.createElement("div");
    chapterListDiv.innerHTML = "1-" + numChapters;
    chapterListDiv.innerHTML += "<input type='hidden' value='1-" + numChapters + "'>";
    outerDiv.appendChild(chapterListDiv);
    // Add an event listener for when the input is left
    guessInputChapter.addEventListener("blur", removeChapterAC);
}

// Autocomplete for the verses
function verseAutoComplete() {
    // Verify it is possible to get a verse count
    if (guessInputBook.value == "") {
        return;
    }
    if (guessInputChapter.value == "") {
        return;
    }

    // Get the guessed book
    let guessBook = guessInputBook.value;
    let guessChapter = guessInputChapter.value;
    let book = manifest.books.find(({ name }) => name.toLowerCase() === guessBook.toLowerCase())
    if (book == undefined) {
        return;
    }
    // Get the number of hcpaters of the book
    let numVerses = book.chapters[guessChapter - 1];
    // Create vars for the divs for the autocomplete
    let outerDiv, verseListDiv;
    // Creae a div that will contain the chapters that are possible to guess
    outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "verse-autocomplete-list");
    outerDiv.setAttribute("class", "autocomplete-numbers");
    // Add this div to the input element
    this.parentNode.appendChild(outerDiv);
    // Add the number of chapters that are possible to guess
    verseListDiv = document.createElement("div");
    verseListDiv.innerHTML = "1-" + numVerses;
    verseListDiv.innerHTML += "<input type='hidden' value='" + numVerses + "'>";
    outerDiv.appendChild(verseListDiv);
    // Add an event listener for when the input is left
    guessInputVerse.addEventListener("blur", removeVerseAC);
}

function autoComplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        let a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("div");
        a.setAttribute("id", "book-autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("div");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }

    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        let x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });

}


// Main function
function main() {
    // Zero out necessary variables
    round = 0;
    totalScore = 0;
    totalDistance = 0;

    // Make the game window visible
    gameWindow.style.display = "flex";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";

    // Put a verse to guess on the screen
    populateVerse();

    // Add an event listener for the share button and autocompletes
    document.getElementById('share-btn').onclick = copyContent;
    guessInputChapter.addEventListener("focus", chapterAutoComplete);
    guessInputVerse.addEventListener("focus", verseAutoComplete);
    // Event listener for the guess button
    guessButton.addEventListener("click", processGuess);

    // Loop through the next round buttons and add event listeners to go to the correct menu based on the round number
    // There are multiple buttons because of the mobile dev
    for (let nextRoundButton of nextRoundButtons) {
        nextRoundButton.addEventListener("click", () => {
            if (round == 5) {
                finishGame()
            } else {
                resetGame()
            }
        });
    }

    // The correct book list
    let bookList = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

    // Run the autocomplete function on the book
    autoComplete(guessInputBook, bookList);
}


// Vars for the round, total score and distance
let totalScore = 0;
let totalDistance = 0;
let round = 0;

// The manifest for the kjv Bible
let manifest;
getManifest().then(function(result) {
    manifest = result;
})

// Run the game
main(manifest);
