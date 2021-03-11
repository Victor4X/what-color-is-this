var toggled = false;
var timeout = 5;
var interval;
var latestCoords;
var lastCoords = [0, 0];
var textField;

let tempCanvas = document.createElement('canvas');
let tempContext = tempCanvas.getContext('2d');

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "toggle") {
            toggled = !toggled;
            if (toggled) {
                alert("toggled on!");
                document.addEventListener('mousemove', logPosition);
                textField = document.createElement("P");
                textField.style.setProperty('position', 'fixed');
                textField.style.setProperty('top', 0);
                textField.style.setProperty('z-index', 1100); // put on top?
                textField.style.setProperty('font-size', 40);
                textField.style.setProperty('background', "rgba(0,0,0,0.2)");
                document.body.appendChild(textField);
                interval = setInterval(grabColor, 80) //interval for grabbing color (interval x timeout)
            } else {
                alert("toggled off!");
                document.removeEventListener('mousemove', logPosition);
                textField.remove();
                clearInterval(interval);
            }
        }
    }
);

function logPosition(e) {
    timeout = 3;
    var x = e.clientX;
    var y = e.clientY;
    var coor = "Coordinates: (" + x + "," + y + ")";
    latestCoords = [x, y];
}

function grabColor() {
    timeout = timeout - 1;
    if (timeout < 0) {
        if (latestCoords[0] != lastCoords[0] || latestCoords[1] != lastCoords[1]) {
            lastCoords = latestCoords.slice(0); //clone latestcoords
            //console.log(latestCoords);

            chrome.runtime.sendMessage({ message: 'capture' }, (currentScreen) => {
                //console.log(currentScreen.imgSrc);
                let img = new Image();
                img.src = currentScreen.imgSrc;
                img.onload = function () {
                    tempCanvas.width = img.naturalWidth;
                    tempCanvas.height = img.naturalHeight;

                    tempContext.drawImage(img, 0, 0);

                    // Use pixel ratio to make sure it works on screens with very high resolutions like Retina
                    getColor(latestCoords[0] * window.devicePixelRatio, latestCoords[1] * window.devicePixelRatio);
                }
            });
        }
    }
}

function getColor(x, y) {
    let pixel = tempContext.getImageData(x, y, 1, 1).data;
    let red = pixel[0];
    let green = pixel[1];
    let blue = pixel[2];

    //console.log(`${red},${green},${blue}`);
    let hexColor = rgbToHex(red, green, blue);

    chrome.runtime.sendMessage({ message: 'getColorName', data: hexColor }, (response) => {
        console.log(response.name);
        colorName = response.name;
        textField.innerText = `${red},${green},${blue} \n ${hexColor.toUpperCase()} \n ${colorName[1]}`;
    });



}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}