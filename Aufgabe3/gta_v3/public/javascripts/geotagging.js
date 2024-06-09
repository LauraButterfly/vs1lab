// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");


/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */

function updateLocation() {

    const latitudeTagVal = document.getElementById("latitudeTag").value;
    const longitudeTagVal = document.getElementById("longitudeTag").value;
    const latitudeDisVal = document.getElementById("latitudeDis").value;
    const longitudeDisVal = document.getElementById("longitudeDis").value;

    if(!latitudeTagVal || !longitudeTagVal || !latitudeDisVal || !longitudeDisVal ){
        console.log("grabbing location")
        LocationHelper.findLocation((helper) => {
            fillInCurrentLocation(helper);
            setMapOfCurrentLocation(helper);
        });
        return;
    }

    setMapOfCurrentLocation(helper);
}

function setMapOfCurrentLocation(helper) {
    const manager = new MapManager();
    const tags = JSON.parse(document.getElementById("map").dataset.tags);
    manager.initMap(helper.latitude, helper.longitude);
    manager.updateMarkers(helper.latitude, helper.longitude, tags);
    const imageElement = document.getElementById("mapView");
    imageElement.parentNode.removeChild(imageElement);

}

function fillInCurrentLocation(helper) {
    setValueById("longitudeTag", helper.longitude)
    setValueById("latitudeTag", helper.latitude)
    setValueById("longitudeDis", helper.longitude)
    setValueById("latitudeDis", helper.latitude)
}

function setValueById(id, value) {
    const inputElement = document.getElementById(id);
    inputElement.value = value;
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    //alert("Please change the script 'geotagging.js'");
    updateLocation();
});
