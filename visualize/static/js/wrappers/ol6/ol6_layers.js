for (var i = 0; i < app.wrapper.baseLayers.length; i++) {
  var baseLayer = app.wrapper.baseLayers[i];
  if (baseLayer.technology == 'OSM') {
    var source = new ol.source.OSM();
  } else if (baseLayer.technology == 'ArcGIS') {
    var source = new ol.source.TileArcGISRest({
      url: baseLayer.url,
      projection: baseLayer.projection,
      params: baseLayer.params,
    })
  } else {
    // assume 'XYZ' by default
    var source = new ol.source.XYZ({
      attributions: baseLayer.attribution,
      url: baseLayer.url
    });
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

app.wrapper.map.defaultBaseLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
              'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
              'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
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
