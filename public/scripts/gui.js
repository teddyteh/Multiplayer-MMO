var menuToggled = false;
window.addEventListener("keydown", function(event) {
    if (event.keyCode == 27) {
        var menu = document.getElementById("main-menu");

        if (menuToggled == false) {
            menu.style.visibility = "visible";

            menuToggled = true;
        } else if (menuToggled == true) {
            menu.style.visibility = "hidden";

            menuToggled = false;
        }
    }
}, false);

var fullscreenBtn = document.getElementById("full-screen");
fullscreenBtn.addEventListener("click", function(event) {
    goFullScreen();
}, false)


var volumeSlider = document.getElementById("volume-slider");
volumeSlider.addEventListener("change",function(event) {
    var music = document.getElementById("music");
    
    music.volume = this.value/100;
}, false);

var hideMenuBtn = document.getElementById("hide-menu");
hideMenuBtn.addEventListener("click", function(event) {
    var menu = document.getElementById("main-menu");
    menu.style.visibility = "hidden";
}, false)
