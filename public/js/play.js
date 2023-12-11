// The stuff
let verseText = document.getElementById("verse-box");
let guessInputBook = document.getElementById("guess-input-book");
let guessInputChapter = document.getElementById("guess-input-chapter");
let guessInputVerse = document.getElementById("guess-input-verse");
let guessButton = document.getElementById("enter-guess");
let scoreText = document.getElementById("score-box");
let userGuess = document.getElementById("user-guess");
let actualReference = document.getElementById("actual-reference");
let resetButton = document.getElementById("reset-button");
let referenceChapter = document.getElementById("reference-chapter");
let guessedChapter = document.getElementById("guessed-chapter");
let finishWindow = document.getElementById("finish-window");
let gameWindow = document.getElementById("gaming");
let scoreWindow = document.getElementById("scoring-window");
let newGameButton = document.getElementById("new-game-button");
let finalScore = document.getElementById("final-score-box");

// gameWindow.style.display = "block";
// scoreWindow.style.display = "none";

// What verse are we guessing?
let verseToGuess;
let totalScore = 0;

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
            contextVerses = 0;
            break;
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

// Empty scoring text and get new verse for new round
function resetGame() {
    gameWindow.style.display = "block";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";
    scoreText.innerText = "";
    userGuess.innerText = "";
    actualReference.innerText = "";
    populateVerse();
}

function finishGame() {
    gameWindow.style.display = "none";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "block";
    finalScore.innerText = totalScore;
    let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    highscores.push({ "score": totalScore, "date": new Date().toLocaleDateString(), "difficulty": localStorage.getItem("difficulty") });
    highscores.sort((a, b) => b.score - a.score);
    highscores.splice(10);
    localStorage.setItem("highscores", JSON.stringify(highscores));
}

function newGame() {
    round = 0;
    totalScore = 0;
    resetButton.innerText = "Next Round";

    gameWindow.style.display = "block";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";

    populateVerse();
}
function removeVerseAC() {
    document.getElementById("verse-autocomplete-list").remove();
    guessInputChapter.removeEventListener("blur", removeVerseAC);
}

function removeChapterAC() {
    document.getElementById("chapter-autocomplete-list").remove();
    guessInputChapter.removeEventListener("blur", removeChapterAC);
}


// Game functions

// Get a random verse and put it on the screen
function populateVerse() {
    round += 1;
    document.getElementById("round-number").innerText = round;
    getRandomVerse().then(function(result) {
        verseToGuess = result;
        let verseHTML = ``;
        for (let verse of result.context) {
            if (verse.id === result.id) {
                verseHTML += `<p class="box-border border-white border-2 text-2xl w-auto h-auto px-6 py-3" id="verse-to-guess">${verse.text}</p>`;
            } else {
                verseHTML += `<p class="text-2xl w-auto h-auto px-6 py-3">${verse.text}</p>`;
            }
        }
        verseText.innerHTML = verseHTML;
    });
}

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
        let score = Math.abs(5200 * (Math.E ** ((-difference) / 7700)) - 200);
        if (difference >= 25100) {
            score = 0;
        }
        scoreText.innerText = Math.round(score);
        totalScore += Math.round(score);
        userGuess.innerText = `${result.text} REF: ${result.book_name} ${result.chapter}:${result.verse}`;
        actualReference.innerText = `${verseToGuess.book_name} ${verseToGuess.chapter}:${verseToGuess.verse}`;

        getSpecificVerse(`${nameToId(verseToGuess.book_name)} ${verseToGuess.chapter}`).then(function(result) {
            console.log(result);
            let stuffHTML = ""
            stuffHTML += `<h1 class="text-center">The chapter of the verse to guess</h1>`
            stuffHTML += `<h1 class="text-center">${result.verses[0].book_name}</h1>`
            stuffHTML += `<h2 class="text-center">Chapter ${result.verses[0].chapter}</h2>`
            for (let verse of result.verses) {
                stuffHTML += `<p>${verse.verse}: ${verse.text}</p>`
            }
            referenceChapter.innerHTML = stuffHTML;
        });
        getSpecificVerse(`${guessBook} ${guessChapter}`).then(function(result) {
            console.log(result);
            let stuffHTML = ""
            stuffHTML += `<h1 class="text-center">The chapter of the verse you guessed</h1>`
            stuffHTML += `<h1 class="text-center"> ${result.verses[0].book_name}</h1>`
            stuffHTML += `<h2 class="text-center"> Chapter ${result.verses[0].chapter}</h2>`
            for (let verse of result.verses) {
                stuffHTML += `<p>${verse.verse}: ${verse.text}</p>`
            }
            guessedChapter.innerHTML = stuffHTML;
        });

        // round += 1; 

        if (round == 5) {
            resetButton.innerText = "Finish Game";
        }
        gameWindow.style.display = "none";
        scoreWindow.style.display = "block";
        finishWindow.style.display = "none";
        guessInputBook.value = "";
        guessInputChapter.value = "";
        guessInputVerse.value = "";
    });
}


// Copy functions

// Copy a message to the clipboard
async function copyContent() {
    let textToCopy = `🎉 I just played a game of TheoGuessr and got ${finalScore.innerText} points! 🚀\nHow well can you do? 😎\nhttp://theoguessr.com/`;

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
    const modal = document.getElementById('modal');
    modal.showModal();
    document.getElementById('closeBtn').addEventListener('click', closeModal);
};

// Hide the modal saying that the message was copied to clipboard
function closeModal() {
    const modal = document.getElementById('modal');
    modal.close();
};


// Autocomplete functions

function chapterAutoComplete() {
    if (guessInputBook.value == "") {
        return
    }
    let guessBook = guessInputBook.value;
    let book = manifest.books.find(({ name }) => name.toLowerCase() === guessBook.toLowerCase())
    if (book == undefined) {
        return;
    }
    let numChapters = book.num_chapters;
    let a, b;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", "chapter-autocomplete-list");
    a.setAttribute("class", "autocomplete-numbers");
    // a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*create a DIV element for each matching element:*/
    b = document.createElement("DIV");
    /*make the matching letters bold:*/
    b.innerHTML = "1-" + numChapters;
    /*insert a input field that will hold the current array item's value:*/
    b.innerHTML += "<input type='hidden' value='1-" + numChapters + "'>";
    a.appendChild(b);
    guessInputChapter.addEventListener("blur", removeChapterAC);
}

function verseAutoComplete() {
    if (guessInputBook.value == "") {
        return;
    }
    if (guessInputChapter.value == "") {
        return;
    }
    let guessBook = guessInputBook.value;
    let guessChapter = guessInputChapter.value;
    let book = manifest.books.find(({ name }) => name.toLowerCase() === guessBook.toLowerCase())
    if (book == undefined) {
        return;
    }
    let numVerses = book.chapters[guessChapter - 1];
    let a, b;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", "verse-autocomplete-list");
    a.setAttribute("class", "autocomplete-numbers");
    // a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*create a DIV element for each matching element:*/
    b = document.createElement("DIV");
    /*make the matching letters bold:*/
    b.innerHTML = "1-" + numVerses;
    /*insert a input field that will hold the current array item's value:*/
    b.innerHTML += "<input type='hidden' value='" + numVerses + "'>";
    a.appendChild(b);
    guessInputVerse.addEventListener("blur", removeVerseAC);
}
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
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
        var x = document.getElementById(this.id + "autocomplete-list");
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
        var x = document.getElementsByClassName("autocomplete-items");
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
    round = 0;
    totalScore = 0;


    gameWindow.style.display = "block";
    scoreWindow.style.display = "none";
    finishWindow.style.display = "none";

    populateVerse();
    document.getElementById('shareBtn').onclick = copyContent;

    // guessInputBook.addEventListener("input", bookAutoComplete);
    guessInputChapter.addEventListener("focus", chapterAutoComplete);
    guessInputVerse.addEventListener("focus", verseAutoComplete);
    guessButton.addEventListener("click", processGuess);
    newGameButton.addEventListener("click", newGame);
    resetButton.addEventListener("click", () => {
        if (round == 5) {
            finishGame()
        } else {
            resetGame()
        }
    });
    let bookList = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

    autocomplete(guessInputBook, bookList);
}


let round = 0;
let manifest;
getManifest().then(function(result) {
    manifest = result;
})
main(manifest);
