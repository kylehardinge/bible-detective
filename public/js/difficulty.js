
// Set the difficulty if not already set
let difficulty = localStorage.getItem("difficulty");
if (difficulty !== null) {
    let radio = document.querySelector(
        `.option input[value="${difficulty}"]`
    );
    radio.checked = true;
    changeColor(radio);
}

// Change the color based on the radio button selected
function changeColor(radio) {
    let difficulty = radio.value;
    localStorage.setItem("difficulty", difficulty);
    let options = document.querySelectorAll(".option");
    options.forEach((option) => {
        option.style.backgroundColor =
            option.contains(radio) && radio.checked
                ? getDifficultyColor(difficulty)
                : "#7f849c";
    });
}

// Return the correct colors
function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case "easy":
            return "#a6e3a1";
        case "medium":
            return "#cba6f7";
        case "hard":
            return "#f38ba8";
        case "impossible":
            return "#b4befe";
        default:
            return "#7f849c";
    }
}

