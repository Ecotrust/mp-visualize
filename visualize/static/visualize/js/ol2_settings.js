app_settings = {};

esriOcean = new OpenLayers.Layer.XYZ("Ocean", "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}", {
    sphericalMercator: true,
    isBaseLayer: true,
    numZoomLevels: 13,
    attribution: "Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others",
    textColor: "black"
});

openStreetMap = new OpenLayers.Layer.OSM("Open Street Map", "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", {
    sphericalMercator: true,
    isBaseLayer: true,
    numZoomLevels: 13,
    visibility: false,
    textColor: "black"
});
googleStreet = new OpenLayers.Layer.Google("Streets", {
    sphericalMercator: true,
    isBaseLayer: true,
    numZoomLevels: 13,
    visibility: false,
    textColor: "black"
});
googleTerrain = new OpenLayers.Layer.Google("Physical", {
    type: google.maps.MapTypeId.TERRAIN,
    sphericalMercator: true,
    isBaseLayer: true,
    numZoomLevels: 13,
    visibility: false,
    textColor: "black"
});
googleSatellite = new OpenLayers.Layer.Google("Satellite", {
    type: google.maps.MapTypeId.SATELLITE,
    sphericalMercator: true,
    isBaseLayer: true,
    numZoomLevels: 13,
    visibility: false,
    textColor: "white"
});


    openStreetMap = new OpenLayers.Layer.OSM(
    "Open Street Map",
    [
      "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
      "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
      "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
    ],
    {
        sphericalMercator: true,
        isBaseLayer: true,
        textColor: "black",
        numZoomLevels: 20,
        minZoomLevel: 0,
        maxZoomLevel: 19
    });

mapboxKey = 'create new key at mapbox.com'
MapBoxHybrid = new OpenLayers.Layer.XYZ(
  "Hybrid",
  [
    "http://a.tiles.mapbox.com/v4/mapbox.streets-satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://b.tiles.mapbox.com/v4/mapbox.streets-satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://c.tiles.mapbox.com/v4/mapbox.streets-satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://d.tiles.mapbox.com/v4/mapbox.streets-satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey
  ], {
      attribution: "<div style='background-color:#CCC; padding: 3px 8px; margin-bottom: 2px;'>Tiles &copy; <a href='http://mapbox.com/'>MapBox</a></div>",
      sphericalMercator: true,
      wrapDateLine: true,
      textColor: "white",
      numZoomLevels: 20,
  });

MapBoxSat = new OpenLayers.Layer.XYZ(
  "Satellite",
  [
    "http://a.tiles.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://b.tiles.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://c.tiles.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey,
    "http://d.tiles.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.png?access_token=" + mapboxKey
  ], {
      attribution: "<div style='background-color:#CCC; padding: 3px 8px; margin-bottom: 2px;'>Tiles &copy; <a href='http://mapbox.com/'>MapBox</a></div>",
      sphericalMercator: true,
      wrapDateLine: true,
      textColor: "white",
      numZoomLevels: 20
  });

ESRITopo = new OpenLayers.Layer.XYZ(
  "Terrain",
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}",
  {
      sphericalMercator: true,
      textColor: "black",
      numZoomLevels: 20,
      wrapDateLine: true,
      attribution: "<div style='background-color:#CCC; padding: 3px 8px; margin-bottom: 2px;'>Basemap by ESRI, USGS</div>"
  }
);

nauticalCharts = new OpenLayers.Layer.ArcGIS93Rest("Nautical Charts", "http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer/exportImage",
    {
        layers: 'null'
    },
    {
        isBaseLayer: true,
        numZoomLevels: 13,
        projection: "EPSG:3857",
        visibility: false,
        textColor: "black"
    }
);
// nauticalCharts = new OpenLayers.Layer.TMS("Nautical Charts", ["http://c3429629.r29.cf0.rackcdn.com/stache/NETiles_layer/"],
//     {
//         buffer: 1,
//         'isBaseLayer': true,
//         'sphericalMercator': true,
//         getURL: function (bounds) {
//             var z = map.getZoom();
//             var url = this.url;
//             var path = 'blank.png' ;
//             if ( z <= 13 && z >= 0 ) {
//                 var res = map.getResolution();
//                 var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
//                 var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
//                 var limit = Math.pow(2, z);
//                 var path = (z) + "/" + x + "/" + y + ".png";
//             }
//             tilepath = url + path;
//             return url + path;
//         }
//     }
// );

app_settings.baselayers = [esriOcean, openStreetMap, googleStreet, ESRITopo, googleSatellite, nauticalCharts]

app_settings.minzoom = 5;
app_settings.maxzoom = 13;
