// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    // TODO: ... your code here ...
    #geoTags = [];

    addGeoTag(name, latitude, longitude, hashtag){
        this.#geoTags.push(new GeoTag(name, latitude, longitude, hashtag));
    }

    removeGeoTag(name) {
        this.#geoTags = this.#geoTags.filter(tag => tag.name !== name);
    }

    getNearbyGeoTags(latitude, longitude, radius) {
        return this.#geoTags.filter(tag => {
            const distance = this._calculateDistance(latitude, longitude, tag.latitude, tag.longitude);
            return distance <= radius;
        });
    }

    

    searchNearbyGeoTags(latitude, longitude, keyword, radius) {

    }

    _calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = this._deg2rad(lat2 - lat1);  //Berechnung mit Harversine-Formel https://www.kompf.de/gps/distcalc.html
        const dLon = this._deg2rad(lon2 - lon1);
        const a = Math.pow(Math.sin(dLat / 2.0), 2) + Math.pow(Math.sin(dLon / 2.0), 2) * Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2));
        const dist = 6378.388 * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return dist;
    }

    _deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

}

module.exports = InMemoryGeoTagStore
