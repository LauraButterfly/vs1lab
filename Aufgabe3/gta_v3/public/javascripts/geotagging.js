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

    const latitudeTag = document.getElementById("latitudeTag").value;
    const longitudeTag = document.getElementById("longitudeTag").value;
    const latitudeDis = document.getElementById("latitudeDis").value;
    const longitudeDis = document.getElementById("longitudeDis").value;

    if (latitudeTag === "" || longitudeTag === "" || latitudeDis === "" || longitudeDis === "") { //Wenn Koordinaten nicht vorhanden, Geolocation-API aktualisieren
        LocationHelper.findLocation((helper) => {
            fillInCurrentLocation(helper);
            setMapOfCurrentLocation(helper);
        });
    } else {
        updateMap(latitudeTag, longitudeTag);       // Wenn Koordinaten bereits vorhanden, Karte direkt aktualisieren
    }
}

function setMapOfCurrentLocation(helper) {
    const manager = new MapManager();
    manager.initMap(helper.latitude, helper.longitude);
    manager.updateMarkers(helper.latitude, helper.longitude);
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
