// File origin: VS1LAB A2



/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
  * A class to help using the HTML5 Geolocation API.
  */
class LocationHelper {
    // Location values for latitude and longitude are private properties to protect them from changes.
    #latitude = '';

    /**
     * Getter method allows read access to privat location property.
     */
    get latitude() {
        return this.#latitude;
    }

    #longitude = '';

    get longitude() {
        return this.#longitude;
    }

    /**
     * Create LocationHelper instance if coordinates are known.
     * @param {string} latitude 
     * @param {string} longitude 
     */
    constructor(latitude, longitude) {
        this.#latitude = (parseFloat(latitude)).toFixed(5);
        this.#longitude = (parseFloat(longitude)).toFixed(5);
    }

    /**
     * The 'findLocation' method requests the current location details through the geolocation API.
     * It is a static method that should be used to obtain an instance of LocationHelper.
     * Throws an exception if the geolocation API is not available.
     * @param {*} callback a function that will be called with a LocationHelper instance as parameter, that has the current location details
     */
    static findLocation(callback) {
        const geoLocationApi = navigator.geolocation;

        if (!geoLocationApi) {
            throw new Error("The GeoLocation API is unavailable.");
        }

        // Call to the HTML5 geolocation API.
        // Takes a first callback function as argument that is called in case of success.
        // Second callback is optional for handling errors.
        // These callbacks are given as arrow function expressions.
        geoLocationApi.getCurrentPosition((location) => {
            // Create and initialize LocationHelper object.
            let helper = new LocationHelper(location.coords.latitude, location.coords.longitude);
            // Pass the locationHelper object to the callback.
            callback(helper);
        }, (error) => {
            alert(error.message)
        });
    }
}

/**
 * A class to help using the Leaflet map service.
 */
class MapManager {

    #map
    #markers

    /**
    * Initialize a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {number} zoom The map zoom, defaults to 18
    */
    initMap(latitude, longitude, zoom = 18) {
        // set up dynamic Leaflet map
        this.#map = L.map('map').setView([latitude, longitude], zoom);
        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors'
        }).addTo(this.#map);
        this.#markers = L.layerGroup().addTo(this.#map);
    }

    /**
    * Update the Markers of a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
    */
    updateMarkers(latitude, longitude, tags = []) {
        // delete all markers
        this.#markers.clearLayers();
        L.marker([latitude, longitude])
            .bindPopup("Your Location")
            .addTo(this.#markers);
        for (const tag of tags) {
            L.marker([tag.latitude, tag.longitude])
                .bindPopup(tag.name)
                .addTo(this.#markers);
        }
    }
}
const mapManager = new MapManager();
// this class represents the ticket to get the paged data
class PagedRequest {

    constructor(response){
        this.currentPage = 0
        this.pagesCount = response.pagesCount
        this.itemCount = response.itemCount
        this.requestId = response.requestId
        // frontend cache
        this.pages = {}
    }

    async getCurrent(){
        return this.getPage(this.currentPage)
    }
    // if it doesn't have it already,
    // gets page from backend cache and saves to frontend cache
    async getPage(number){
        if(this.pages[number] === undefined){
            const resp = await fetch(`/api/paged?page=${number}&requestId=${this.requestId}`)
            this.pages[number] = await resp.json()
        }
        return this.pages[number]
    }

    getData() {
        return this.pages
    }
}

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation() {
    LocationHelper.findLocation((helper) => {
        const latField = document.getElementById("latInput");
        latField.value = helper.latitude;
        const longField = document.getElementById("longInput");
        longField.value = helper.longitude;
        const discoveryLong = document.getElementById("discoveryLong");
        discoveryLong.value = helper.longitude;
        const discoveryLat = document.getElementById("discoveryLat");
        discoveryLat.value = helper.latitude;
        const tags = JSON.parse(document.getElementById("map").dataset.tags);
        mapManager.initMap(helper.latitude, helper.longitude);
        console.log("Tags:", tags)
        mapManager.updateMarkers(helper.latitude, helper.longitude, tags);
        removeElement("mapText");
        removeElement("mapView");

        initTags()
    });
}

async function initTags() {
    const resp = await fetch('/api/geotags/paged');
    // gets current paged request, depending on the event 
    currentPageRequest = new PagedRequest(await resp.json())
    updateUIFromPagedRequest(currentPageRequest)
}

function addTag() {
    console.log("Hey")
}

// frontend pagination 

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    // listener for moving though the pages 
    document.getElementById("nextPage").addEventListener('click', nextPage)
    document.getElementById("prevPage").addEventListener('click', prevPage)
    updateLocation();
    //event listener for tag submit
    var tagForm = document.getElementById("tag-form");


    tagForm.addEventListener("submit", async (e) => {
        var payLoad = {
            name: document.getElementById("nameInput").value,
            latitude: document.getElementById("latInput").value,
            longitude: document.getElementById("longInput").value,
            hashtag: document.getElementById("hashInput").value,
        }
        e.preventDefault();

        const resp = await fetch('/api/geotags/paged', {
            method: "POST",
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(payLoad),
        })
        // updates the current paged view after another tag has been added
        currentPageRequest = new PagedRequest(await resp.json())
        updateUIFromPagedRequest(currentPageRequest)
    })

    //event listener for tag submit
    var discoveryForm = document.getElementById("discoveryFilterForm");
    discoveryForm.addEventListener("submit", async (e) => {
        var searchTerm = document.getElementById("searchInput").value;
        e.preventDefault();

        const resp = await fetch('/api/geotags/paged?searchTerm=' + searchTerm, {
            method: "GET",
        })
        // updates the current paged view after the items have been filtered via search
        currentPageRequest = new PagedRequest(await resp.json())
        updateUIFromPagedRequest(currentPageRequest)
    })

});

function updateDiscoveryResults(taglist) {
    var tagListElement = document.getElementById("discoveryResults");
    tagListElement.innerHTML = taglist.map(gtag => `<li>${gtag.name} (${gtag.latitude}, ${gtag.longitude}) ${gtag.hashtag}</li>`).join("");
}

function updateDiscoveryWidget(taglist) {
    updateDiscoveryMap(taglist);
    updateDiscoveryResults(taglist);
}

function updateDiscoveryMap(taglist) {
    var latitude = document.getElementById("latInput").value;
    var longitude = document.getElementById("longInput").value;
    mapManager.updateMarkers(latitude, longitude, taglist);
}

function removeElement(id) {
    var elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}

let currentPageRequest = null
// update ui elements like the buttons and the discovery widget with page data
async function updateUIFromPagedRequest(pagedRequest) {
    const pageInfo = document.getElementById("pageInfo")
    pageInfo.innerText = `${pagedRequest.currentPage+1}/${pagedRequest.pagesCount} (${pagedRequest.itemCount})`
    updateDiscoveryWidget(await pagedRequest.getCurrent())
    setEnabledForNav(currentPageRequest.currentPage, currentPageRequest.pagesCount-1)
}
// functions to navigate to next or previous page, 
// in or decreases current pageindex
function nextPage(){
    if(currentPageRequest == null) return;
    currentPageRequest.currentPage = Math.min(currentPageRequest.currentPage + 1, currentPageRequest.pagesCount - 1)
    updateUIFromPagedRequest(currentPageRequest)
}

function prevPage(){
    if(currentPageRequest == null) return;
    currentPageRequest.currentPage = Math.max(currentPageRequest.currentPage - 1, 0)
    updateUIFromPagedRequest(currentPageRequest)
}
// enable or disable depending on current pageIndex
function setEnabledForNav(curr, maxIndex) {
    if(curr + 1 > maxIndex){
        document.getElementById("nextPage").setAttribute("disabled", "disabled");
    }else{
        document.getElementById("nextPage").removeAttribute("disabled");
    }

    if(curr - 1 < 0){
        document.getElementById("prevPage").setAttribute("disabled", "disabled");
    }else{
        document.getElementById("prevPage").removeAttribute("disabled");
    }
}