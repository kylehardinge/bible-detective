// This file is for the help menu to making it open and close
let helpOpener = document.getElementById("help-open");
let helpMenu = document.getElementById("help-menu");
let helpScreen = document.getElementById("help-screen");
let helpCloser = document.getElementById("help-close");

// Event listeners on the various elements
helpOpener.addEventListener("click", openHelp);
helpCloser.addEventListener("click", closeHelp);
helpScreen.addEventListener("click", closeHelp);

// Add the hidden tag and remove the flex tag
function closeHelp() {
    helpScreen.classList.add("hidden");
    helpMenu.classList.add("hidden");
    helpScreen.classList.remove("flex");
    helpMenu.classList.remove("flex");
    
}

// Remove the hidden tag and add the flex tag
function openHelp() {
    helpScreen.classList.remove("hidden");
    helpMenu.classList.remove("hidden");
    helpScreen.classList.add("flex");
    helpMenu.classList.add("flex");
}
