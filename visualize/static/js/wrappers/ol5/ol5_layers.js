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
}

var baseLayers = [];
var keys = Object.keys(app.wrapper.layers);
for (var i = 0; i < keys.length; i++) {
  baseLayers.push(app.wrapper.layers[keys[i]]);
}

app.wrapper.map.baseLayersGroup = new ol.layer.Group({
  layers: baseLayers
})
