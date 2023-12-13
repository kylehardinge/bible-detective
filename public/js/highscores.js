// This file is for the high scores and makes it simple to open and close the high score menu
// Also for the population of high scores in the menu
let hsOpener = document.getElementById("open-high-scores");
let hsMenu = document.getElementById("high-scores");
let hsScreen = document.getElementById("help-screen");
let hsCloser = document.getElementById("help-close");

// Add the event listeners to the correct files
hsOpener.addEventListener("click", openHs);
hsCloser.addEventListener("click", closeHs);
hsScreen.addEventListener("click", closeHs);

// Function to close the high scores by adding the hidden attribute via tailwind
function closeHs() {
    hsScreen.classList.add("hidden");
    hsMenu.classList.add("hidden");
    hsScreen.classList.remove("flex");
    hsMenu.classList.remove("flex");
}

// Function to open the high scores by adding the flex attribute via tailwind
function openHs() {
    hsScreen.classList.remove("hidden");
    hsMenu.classList.remove("hidden");
    hsScreen.classList.add("flex");
    hsMenu.classList.add("flex");
}

// Populate the highscores from localstorage
function populateHighscores() {
    let highscores = JSON.parse(localStorage.getItem("highscores")) || []
    return highscores.map(score => {
        return `<li class="text-base">${score.score} on ${score.date} on Difficulty ${score.difficulty}</li>`
    }).join("");
}
document.getElementById("highscores").innerHTML = populateHighscores();
