let helpOpener = document.getElementById("help-open");
let helpMenu = document.getElementById("help-menu");
let helpScreen = document.getElementById("help-screen");
let helpCloser = document.getElementById("help-close");

helpOpener.addEventListener("click", openHelp);
helpCloser.addEventListener("click", closeHelp);
helpScreen.addEventListener("click", closeHelp);

function closeHelp() {
    helpScreen.classList.add("hidden");
    helpMenu.classList.add("hidden");
    helpScreen.classList.remove("flex");
    helpMenu.classList.remove("flex");
    
}

function openHelp() {
    helpScreen.classList.remove("hidden");
    helpMenu.classList.remove("hidden");
    helpScreen.classList.add("flex");
    helpMenu.classList.add("flex");
}
