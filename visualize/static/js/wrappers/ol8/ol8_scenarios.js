/**
  * app.wrapper.scenarios.getScenarioLayer - Create a map-library-defined vector layer to display scenario data
  */
app.wrapper.scenarios.getScenarioLayer = function(scenarioLayerModel) {
  var styles = app.wrapper.map.createOLStyleMap(scenarioLayerModel.style);
  var styleFunction = function(feature) {
    var featureStyle = styles[feature.getGeometry().getType()];
    return featureStyle;
  }
  var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: "/features/generic-links/links/geojson/" + scenarioLayerModel.scenarioId + "/",
          format: new ol.format.GeoJSON()
        }),
        style: styleFunction,
        strategy: new ol.loadingstrategy.all(),
      }
  );
  return layer;
  // var layer = new OpenLayers.Layer.Vector(
  //     scenarioId,
  //     {
  //         projection: new OpenLayers.Projection('EPSG:3857'),
  //         displayInLayerSwitcher: false,
  //         styleMap: new OpenLayers.StyleMap({
  //             fillColor: fillColor,
  //             fillOpacity: opacity,
  //             strokeColor: strokeColor,
  //             strokeOpacity: stroke
  //         }),
  //         //style: OpenLayers.Feature.Vector.style['default'],
  //         scenarioModel: scenario
  //     }
  // );
}

/**
  * app.wrapper.scenarios.addFeaturesToScenarioLayer - Add provided GeoJSON formatted features to the provided vector ScenarioLayer
  */
app.wrapper.scenarios.addFeaturesToScenarioLayer = function(scenarioLayer, features) {
  // layer.addFeatures(new OpenLayers.Format.GeoJSON().read(feature));
}
