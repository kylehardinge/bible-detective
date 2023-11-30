let verseText = document.getElementById("verse-box");
let guessInputBook = document.getElementById("guess-input-book");
let guessInputChapter = document.getElementById("guess-input-chapter");
let guessInputVerse = document.getElementById("guess-input-verse");
let guessButton = document.getElementById("enter-guess");
let scoreText = document.getElementById("score-box");
let userGuess = document.getElementById("user-guess");
let actualReference = document.getElementById("actual-reference");
let resetButton = document.getElementById("reset-button");
let bookAutoComp = document.getElementById("book-suggestions");
let verseToGuess;

guessButton.addEventListener("click", processGuess);
resetButton.addEventListener("click", resetGame);

async function getRandomVerse() {
  let response = await fetch("/api/random?contextVerses=3");
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
  guessInputBook.value = "";
  guessInputChapter.value = "";
  guessInputVerse.value = "";
}

populateVerse()

function resetGame() {
  scoreText.innerText = "";
  userGuess.innerText = "";
  actualReference.innerText = "";
  populateVerse()
}
function populateVerse() {
  getRandomVerse().then(function (result) {
    console.log(result.text);
    verseToGuess = result;
    let verseHTML = ``
    for (let verse of result.context) {
      console.log(verse);
      if (verse.id === result.id) {
        verseHTML += `<p class="box-border border-white border-2 text-2xl w-auto h-auto px-6 py-3" id="verse-to-guess">${verse.text}</p>`
      } else {
        verseHTML += `<p class="text-2xl w-auto h-auto px-6 py-3">${verse.text}</p>`
      }
    }
    console.log(verseHTML);
    verseText.innerHTML = verseHTML;
  });
}

let manifest;
getManifest().then(function(result) {
  manifest = result
})

// function autocomplete() {
// }
const copyContent = async () => {
  let textToCopy = `🎉 I just played the daily challenge and got ${scoreText.innerText} points! 🚀\nHow well can you do? 😎\nhttp://theoguessr.com/`

  try {
      await navigator.clipboard.writeText(textToCopy);
      console.log('Content copied to clipboard');
      showModal();
      setTimeout(closeModal, 2000)
  } catch (err) {
      console.error('Failed to copy: ', err);
  }
};

const showModal = () => {
  const modal = document.getElementById('modal');
  modal.showModal();
  document.getElementById('closeBtn').addEventListener('click', closeModal);
};

const closeModal = () => {
  const modal = document.getElementById('modal');
  modal.close();
};

document.getElementById('shareBtn').onclick = copyContent;

let bookAutoCompleteValues=[]
guessInputBook.addEventListener("input", bookAutoComplete);

function bookAutoComplete() {
  let input = guessInputBook.value.toLowerCase();
  let books = []
  if (input == "") {
    return
  }

  for (let manifestBook of manifest.books) {
    books.push(manifestBook.name.toLowerCase());
  }
  books.sort((a, b) => {
    return mostRelevant(a, b, input)
  })
  bookAutoComp.innerHTML = `<p>${books[0]}</p><hr><p>${books[1]}</p><hr><p>${books[2]}</p><hr><p>${books[3]}</p><hr><p>${books[4]}</p><hr><p>${books[5]}</p><hr>`
  
}

function mostRelevant(a, b, input) {
  let indexA = a.search(input);
  let indexB = b.search(input)
  if (indexA == -1 && indexB != -1) {
    return 1
  } else if (indexB == -1 && indexA != -1) {
    return -1
  } else if (indexB == -1 && indexA == -1) {
    return 0
  } else {
    return indexA - indexB
  }
}

function numAutoComplete(inputItem) {
  let input = inputItem.value.toLowerCase();
  let books = []
  if (input == "") {
    return
  }

  for (let manifestBook of manifest.books) {
    books.push(manifestBook.name.toLowerCase());
  }
  books.sort((a, b) => {
    return mostRelevant(a, b, input)
  })
  bookAutoComp.innerHTML = `<p>${books[0]}</p><hr><p>${books[1]}</p><hr><p>${books[2]}</p><hr><p>${books[3]}</p><hr><p>${books[4]}</p><hr><p>${books[5]}</p><hr>`
}
