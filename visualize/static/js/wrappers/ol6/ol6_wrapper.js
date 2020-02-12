/**
  * init_map (OL5)- Takes map parameters and returns an OpenLayers 5 map instance
  * @param {string} base - a layer as defined in wrappers/ol5/layers.js
  * @param {string} target - the id of the map div
  * @param {int} srid - the SRID used to generate this map
  * @param {float} center_x - Map initial center longitude coordinate
  * @param {float} center_y - Map initial center latitude coordinate
  * @param {int} zoom - Map initial zoom level
  */
app.init_map = function(base, target, srid, center_x, center_y, zoom){
  if (srid == 4326) {
    var center = ol.proj.fromLonLat([center_x, center_y]);
  } else {
    var center = [center_x, center_y];
  }

  // ---------- OL5 CONTROLS ------------- //
  var scaleLineControl = new ol.control.ScaleLine();
  scaleLineControl.setUnits("us");

  var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'olControlMousePosition',
    undefinedHTML: null
  });

  var map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: {
        'label': 'i',
        'collapseLabel': '«',
        'collapsible': true,
      }
    }).extend([
      scaleLineControl,
      mousePositionControl
    ]),
    layers: [
      app.wrapper.map.defaultBaseLayer,
      app.wrapper.map.baseLayersGroup
    ],
    target: target,
    view: new ol.View({
      center: center,
      zoom: zoom
    })
  });
  app.wrapper.map.baselayersIndex = 1;

  var layerClickCallback = function(layer, pixelColor) {
    if (layer.get('utfgrid')) {
      if (app.wrapper.events.hasOwnProperty('clickOnUTFGridLayerEvent')){
        app.wrapper.events.clickOnUTFGridLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'ArcRest'){
      if (app.wrapper.events.hasOwnProperty('clickOnArcRESTLayerEvent')) {
        app.wrapper.events.clickOnArcRESTLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'Vector'){
      if (app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
        app.wrapper.events.clickOnVectorLayerEvent(layer, app.wrapper.map.event)
      }
    } else if (layer.get('tech') == 'WMS'){
      if (app.wrapper.events.hasOwnProperty('clickOnWMSLayerEvent')) {
        app.wrapper.events.clickOnWMSLayerEvent(layer, app.wrapper.map.event)
      }
    } else { //if (layer.get('tech') == 'XYZ'){
      if (app.wrapper.events.hasOwnProperty('clickOnXYZLayerEvent')) {
        app.wrapper.events.clickOnXYZLayerEvent(layer, app.wrapper.map.event)
      }
    }
    return true;
  }

  map.on('singleclick', function (evt) {
    app.wrapper.map.clearMarkers();
    app.viewModel.closeAttribution();
    app.wrapper.map.event = evt;
    app.wrapper.map.clickOutput = {
        attributes: []
    };
    var overlays = app.wrapper.map.getOverlays();
    for (var i = 0; i < overlays.length; i++) {
      layerClickCallback(overlays[i]);
    }
  });

  return map;
}

/**
 * This is a workaround from Jonatas Walker
 * https://stackoverflow.com/a/31299728
 * Returns the associated layer.
 * @param {ol.Map} map.
 * @return {ol.layer.Vector} Layer.
 */
ol.Feature.prototype.getLayer = function(map) {
    var this_ = this, layer_, layersToLookFor = [];
    /**
     * Populates array layersToLookFor with only
     * layers that have features
     */
    var check = function(layer){
        var source = layer.getSource();
        if(source instanceof ol.source.Vector){
            var features = source.getFeatures();
            if(features.length > 0){
                layersToLookFor.push({
                    layer: layer,
                    features: features
                });
            }
        }
    };
    //loop through map layers
    app.map.getLayers().forEach(function(layer){
        if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(check);
        } else {
            check(layer);
        }
    });
    layersToLookFor.forEach(function(obj){
        var found = obj.features.some(function(feature){
            return this_ === feature;
        });
        if(found){
            //this is the layer we want
            layer_ = obj.layer;
        }
    });
    return layer_;
};
