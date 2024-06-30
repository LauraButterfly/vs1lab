// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');
const LocationHelper = require('../public/javascripts/location-helper')
/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
/*const GeoTagStore = require('../models/geotag-store');*/
const InMemoryGeoTagStore = require('../models/geotag-store');
const { tagList } = require('../models/geotag-examples');
const geoTagStore = new InMemoryGeoTagStore();
// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  const helpingTag = new GeoTag;
  //helpingTag.latitude = 48.9374;
  //helpingTag.longitude = 8.4027;
  // TODO: sollte eigentlich die aktuelle Location sein, der LocHelper gönnt aber nichts außer errors EDIT: brauchen wir nicht?
  res.render('index', { taglist: geoTagStore.getNearbyGeoTags(helpingTag, 1000), searchInput: "" })
});

router.post('/tagging', (req, res) => {
  geoTagStore.addGeoTag(req.body);
  res.render('index', { taglist: geoTagStore.getNearbyGeoTags(req.body, 1000), searchInput: "" })
});

router.post('/discovery', (req, res) => {
  res.render('index', { taglist: geoTagStore.searchNearbyGeoTags(req.body, 1000), searchInput: req.body.keyword })
});
// API routes (A4)

const requestCache = []
const pageSize = 5

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

// TODO: ... your code here ...

router.get('/api/geotags', (req, res) => {
  const radius = req.query.radius;
  const searchTerm = req.query.searchTerm;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const geoTag = { latitude, longitude };

  if (radius != null) {
    res.json(geoTagStore.getNearbyGeoTags(geoTag, radius));
    return;
  }
  // TODO: filter for searchterm
  if (searchTerm != null) {
    res.json(geoTagStore.getAllGeoTags().filter((tag) => {
      return tag.name.includes(searchTerm) || tag.hashtag.includes(searchTerm);
    }));
    return;
  }

  res.json(geoTagStore.getAllGeoTags());

});

const fillPageCache = (res, requestId, data) => {
  // fill the cache at requestId
  requestCache[requestId] = data
  // return requestId and MetaData to client
  res.json({
    requestId,
    itemCount: data.length,
    pagesCount: Math.ceil(data.length/pageSize)
  })
}
// copy of get(/api/geotags), but instead of returning the data, fills the cache
// and returns requestId
router.get('/api/geotags/paged', (req, res) => {
  const radius = req.query.radius;
  const searchTerm = req.query.searchTerm;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const geoTag = { latitude, longitude };

  //create new requestId
  const requestId = requestCache.length;

  if (radius != null) {
    fillPageCache(res, requestId, geoTagStore.getNearbyGeoTags(geoTag, radius));
    return;
  }
  
  if (searchTerm != null) {
    fillPageCache(res, requestId, geoTagStore.getAllGeoTags().filter((tag) => {
      return tag.name.includes(searchTerm) || tag.hashtag.includes(searchTerm);
    }));
    return;
  }

  fillPageCache(res, requestId, geoTagStore.getAllGeoTags());
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

router.post('/api/geotags', (req, res) => {
  const name = req.body.name;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const hashtag = req.body.hashtag;
  geoTagStore.addGeoTag({ name, latitude, longitude, hashtag });
  const allGeoTags = geoTagStore.getAllGeoTags();

  res.json(allGeoTags);
});
// copy of post('/api/geotags'), but instead of returning the data fills the cache
// and returns requestId
router.post('/api/geotags/paged', (req, res) => {
  const name = req.body.name;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const hashtag = req.body.hashtag;
  geoTagStore.addGeoTag({ name, latitude, longitude, hashtag });
  
  const requestId = requestCache.length;
  fillPageCache(res, requestId, geoTagStore.getAllGeoTags());
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...

router.get('/api/geotags/:id', (req, res) => {
  const geoTagId = req.params.id;
  res.json(geoTagStore.getAllGeoTags().find((tag) => {
    return tag.name.includes(geoTagId);
  }));
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id', (req, res) => {
    const geoTagId = req.params.id;
    const geoTag = req.body;
    geoTagStore.removeGeoTag(geoTagId);
    geoTagStore.addGeoTag(geoTag);

    res.json(geoTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...
router.delete('/api/geotags/:id', (req, res) => {
  const geoTagId = req.params.id;
  const geoTag = geoTagStore.getAllGeoTags().find((tag) => {
    return tag.name.includes(geoTagId);
  });
  geoTagStore.removeGeoTag(geoTagId);
  res.json(geoTag);

});

// retrieve the data by requestId and pageIndex
router.get('/api/paged', (req, res) => {
  const pageIndex = +(req.query.page);
  const requestId = req.query.requestId;

  const data = requestCache[requestId]
  const pageData = data.slice(pageIndex*pageSize, (pageIndex+1)*pageSize)

  res.json(pageData);
});



module.exports = geoTagStore;
module.exports = router;
