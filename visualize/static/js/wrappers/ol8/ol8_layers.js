let loadFunctionLookup = {
  'drop_z_by_2': function(imageTile, src) {
    let splitter = 'MapServer/tile/';
    let parts = src.split(splitter);
    let xyz = parts[1].split('/')
    xyz[0] = xyz[0]-2;
    parts[1] = xyz.join('/');
    let new_src = parts.join(splitter);
    imageTile.getImage().src = new_src;
  },
  'default': function(imageTile, src) {
    imageTile.getImage().src = src;
  },
};

for (var i = 0; i < app.wrapper.baseLayers.length; i++) {
  var baseLayer = app.wrapper.baseLayers[i];
  if (baseLayer.technology == 'OSM') {
    var source = new ol.source.OSM({
      crossOrigin: 'anonymous'
    });
  } else if (baseLayer.technology == 'ArcGIS') {
    var source = new ol.source.TileArcGISRest({
      url: baseLayer.url,
      projection: baseLayer.projection,
      attributions: baseLayer.attribution,
      params: baseLayer.params,
      crossOrigin: 'anonymous'
    });
  } else {
    // assume 'XYZ' by default

    if (baseLayer.loadFunction != null) {
      var source = new ol.source.XYZ({
        attributions: baseLayer.attribution,
        url: baseLayer.url,
        tileLoadFunction: loadFunctionLookup[baseLayer.loadFunction],
        crossOrigin: 'anonymous'
      });
    } else {
      var source = new ol.source.XYZ({
        attributions: baseLayer.attribution,
        url: baseLayer.url,
        crossOrigin: 'anonymous'
      });
    }
    
  }
  app.wrapper.layers[baseLayer.name] = new ol.layer.Tile({
    source: source,
    useInterimTilesOnError: false,
    zIndex: 0
  });
  app.wrapper.layers[baseLayer.name].set('name', baseLayer.name);
  app.wrapper.layers[baseLayer.name].set('type', 'base');
  app.wrapper.layers[baseLayer.name].set('textColor', baseLayer.textColor);
  app.wrapper.layers[baseLayer.name].setVisible(false);
  if (baseLayer.maxZoom) {
    app.wrapper.layers[baseLayer.name].set('maxZoom', baseLayer.maxZoom);
  }
  if (baseLayer.minZoom) {
    app.wrapper.layers[baseLayer.name].set('minZoom', baseLayer.minZoom);
  }
}

var baseLayers = [];
var keys = Object.keys(app.wrapper.layers);
for (var i = 0; i < keys.length; i++) {
  baseLayers.push(app.wrapper.layers[keys[i]]);
}

// ADD OCEAN LABELS LAYER
app.wrapper.layers['ocean_labels'] = new ol.layer.VectorTile({
  source: new ol.source.VectorTile({
      attributions: "Sources: Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community",
      // RDH 20221129: using the default ol.render.Feature MVT featureClass results in constant errors being thrown when
      //  moving the mouse over the layer. Using ol.Feature does not, but the style rendering is inconsistent.
      //  Using the default is still preferred, but it'd be nice to figure out how to stop the 't.getStyle is not a function'
      // format: new ol.format.MVT({featureClass: ol.Feature}),
      format: new ol.format.MVT({featureClass: ol.render.Feature}),
      url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf?token='+app.ARCGIS_API_KEY,
      // zDirection: 0,
  }),
  style: oceanLabelStyleFunction,
  maxZoom: 13,
  declutter: true,
  useInterimTilesOnError: false,
});


app.wrapper.map.defaultBaseLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: '',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    crossOrigin: 'anonymous'
  }),
  useInterimTilesOnError: false,
  zIndex: 0
});

app.wrapper.map.baseLayersGroup = new ol.layer.Group({
  layers: baseLayers
});

app.wrapper.layer_functions.getLayerExtent = function(layer) {
  if (layer.hasOwnProperty('layer') && 'getSource' in layer.layer) {
    extent = layer.layer.getSource().getExtent();
    return extent;
    // app.wrapper.map.zoomToExtent(extent);
  }
  return null;
}

app.wrapper.layer_functions.getLayerFeatureAsWKT = function(layer, feat_index) {
  var wkt = new ol.format.WKT();
  var geometry = layer.getSource().getFeatures()[feat_index].getGeometry();
  var wkt_text = wkt.writeGeometry(geometry);
  return wkt_text;
}
