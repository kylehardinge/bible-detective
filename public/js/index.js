// NOT USED
//
//
//
// Function to populate the high score window the the current highscores
function populateHighscores() {
    let highscores = JSON.parse(localStorage.getItem("highscores")) || []
    return highscores.map(score => {
        return `<li class="text-sm">${score.score} on ${score.date} on Difficulty ${score.difficulty}</li>`
    }).join("");
}


// This function changes the color based on the radio button clicked
function changeColor(radio) {
    let difficulty = radio.value;
    localStorage.setItem("difficulty", difficulty);
    let options = document.querySelectorAll(".option");
    options.forEach((option) => {
        option.style.backgroundColor =
            option.contains(radio) && radio.checked
                ? getDifficultyColor(difficulty)
                : "#48537B";
    });
}

// These are the colors that should be used
function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case "easy":
            return "green";
        case "medium":
            return "blue";
        case "hard":
            return "red";
        default:
            return "#48537B";
    }
}

// Populate the highscores in the high score menu
document.getElementById("highscores").innerHTML = populateHighscores();

// If the difficulty is not already set to medium, do it
let difficulty = localStorage.getItem("difficulty");
if (difficulty !== null) {
    let radio = document.querySelector(
        `.option input[value="${difficulty}"]`
    );
    radio.checked = true;
    changeColor(radio);
}
