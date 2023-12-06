document.addEventListener("DOMContentLoaded", function () {
    let difficulty = localStorage.getItem("difficulty");
    if (difficulty !== null) {
        let radio = document.querySelector(
            `.option input[value="${difficulty}"]`
        );
        radio.checked = true;
        changeColor(radio);
    }
});

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
