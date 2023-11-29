let verseText = document.getElementById("verse-to-guess");
let guessInput = document.getElementById("guess-input");
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
  console.log(verse);
  return verse;
}
async function getSpecificVerse(verse) {
  console.log(`/api/${verse}`);
  let response = await fetch(`/api/${verse}`);
  let specificVerse = await response.json();
  console.log(specificVerse);
  return specificVerse;
}

function processGuess() {
  let guess = guessInput.value;
  getSpecificVerse(guess).then(function (result) {
    console.log(result.id, verseToGuess.id);

    difference = Math.abs(result.id - verseToGuess.id);
    console.log(difference);
    let score = 5000 * Math.E ** (-difference / 2000);
    console.log(score);
    scoreText.innerText = Math.round(score);
    userGuess.innerText = `${result.text} REF: ${result.book_name} ${result.chapter}:${result.verse}`;
    actualReference.innerText = `${verseToGuess.book_name} ${verseToGuess.chapter}:${verseToGuess.verse}`;
  });
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
