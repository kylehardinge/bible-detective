let verseText = document.getElementById("verse-to-guess");
let guessInputBook = document.getElementById("guess-input-book");
let guessInputChapter = document.getElementById("guess-input-chapter");
let guessInputVerse = document.getElementById("guess-input-verse");
let guessButton = document.getElementById("enter-guess");
let scoreText = document.getElementById("score-box");
let userGuess = document.getElementById("user-guess");
let actualReference = document.getElementById("actual-reference");
let resetButton = document.getElementById("reset-button");
let verseToGuess;

guessButton.addEventListener("click", processGuess);
resetButton.addEventListener("click", resetGame);

async function getRandomVerse() {
  let response = await fetch("/api/random");
  let verse = await response.json();
  return verse;
}

async function getSpecificVerse(verse) {
  let response = await fetch(`/api/${verse}`);
  let specificVerse = await response.json();
  return specificVerse;
}

async function getManifest() {
  let response = await fetch(`/api/manifest`);
  let manifest = await response.json();
  return manifest;
}

function nameToId(book) {
  for (let manifestBook of manifest.books) {
    if (book == manifestBook.name) {
      return manifestBook.id
    }
  }
}

function processGuess() {
  if (guessInputBook.value == "" || guessInputBook.value == "" || guessInputVerse == "") {
    alert("Please make a guess");
    return;
  }
  let guessBook = nameToId(guessInputBook.value)
  let guessChapter = guessInputChapter.value;
  let guessVerse = guessInputVerse.value;
  // console.log(book)

  let guess = `${guessBook} ${guessChapter}:${guessVerse}`
  getSpecificVerse(guess).then(function(result) {
  
    console.log(result.id, verseToGuess.id)

    difference = Math.abs(result.id - verseToGuess.id)
    console.log(difference)
    let score = 5000 * (Math.E ** ((-difference) / 3000))
    console.log(score)
    scoreText.innerText = Math.round(score)
    userGuess.innerText = `${result.text} REF: ${result.book_name} ${result.chapter}:${result.verse}`
    actualReference.innerText = `${verseToGuess.book_name} ${verseToGuess.chapter}:${verseToGuess.verse}`

  })
  guessInput.value = "";
}

getRandomVerse().then(function (result) {
  console.log(result.text);
  verseToGuess = result;
  verseText.innerHTML = result.text;
});

function resetGame() {
  scoreText.innerText = "";
  userGuess.innerText = "";
  actualReference.innerText = "";
  getRandomVerse().then(function (result) {
    console.log(result.text);
    verseToGuess = result;
    verseText.innerHTML = result.text;
  });
}

let manifest;
getManifest().then(function(result) {
  manifest = result
})
getRandomVerse().then(function(result) {
  console.log(result.text)
  verseToGuess = result
  verseText.innerHTML = result.text;
})

// function autocomplete() {
// }
