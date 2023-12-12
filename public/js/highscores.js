let hsOpener = document.getElementById("open-high-scores");
let hsMenu = document.getElementById("high-scores");
let hsScreen = document.getElementById("help-screen");
let hsCloser = document.getElementById("help-close");

hsOpener.addEventListener("click", openHs);
hsCloser.addEventListener("click", closeHs);
hsScreen.addEventListener("click", closeHs);

function closeHs() {
    hsScreen.classList.add("hidden");
    hsMenu.classList.add("hidden");
    hsScreen.classList.remove("flex");
    hsMenu.classList.remove("flex");
}

function openHs() {
    hsScreen.classList.remove("hidden");
    hsMenu.classList.remove("hidden");
    hsScreen.classList.add("flex");
    hsMenu.classList.add("flex");
}
