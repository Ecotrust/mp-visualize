// class madronaMap extends ol.Map {
//   // getLayers() {
//   //   var getLayers = ol.Map.prototype.getLayers.call(this).getArray();
//   //   getLayers.getArray = function(){
//   //     ol.Map.prototype.getLayers.call(this).getArray();
//   //   }
//   //   // return ol.Map.prototype.getLayers.call(this).getArray();
//   //   return getLayers;
//   // }
//   zoomToExtent(extent) {
//     ol.Map.prototype.getView.call(this).fit(extent, {duration: 1500});
//   }
// }
ol.Map.zoomToExtent = function(extent) {
  ol.Map.prototype.getView.call(this).fit(extent, {duration: 1500});
}

app.setLayerZIndex = function(layer, index) {
    layer.layer.setZIndex(index);
};

app.updateUrl = function () {
  if (app.getState) {
    var state = app.getState();

    // save the restore state
    if (app.saveStateMode) {
      app.restoreState = state;
    }
    window.location.hash = $.param(state);
    app.viewModel.currentURL(window.location.pathname + window.location.hash);
  }
};

var mapSettings = {
  getInitMap: function() {
    // ol.Map.zoomToExtent = function(extent) {
    //   ol.Map.prototype.getView.call(this).fit(extent, {duration: 1500});
    // }
    map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Group({
          'title': 'Base maps',
          layers: [
            new ol.layer.Tile({
              title: 'OSM Base Layer',
              source: new ol.source.OSM(),
              name: 'OSM Base Layer',
              type: 'base'
            }),
            new ol.layer.Tile({
              title: 'ESRI Topo',
              source: new ol.source.XYZ({
                url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png'
              }),
              name: 'OSM Base Layer',
              type: 'base'
            })
          ],
        }),
        new ol.layer.Group({
          title: 'Overlays',
          layers: []
        })
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
    return map;
  },
  configureLayer: function(layer) {
    layer.addFeatures = function(features) {
      for (var i=0; i < features.length; i++) {
        feature = features[i];
        layersource = layer.getSource();
        layersource.addFeature(feature);
      }
    }
    layer.addWKTFeatures = function(wkt) {
      var format = new ol.format.WKT();
      geometry = format.readGeometry(wkt);
      feature = format.readFeature(wkt, {
        // Re-write to take dataProjection in and determine featureProjection itself
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857'
      });
      layer.addFeatures([feature]);
    }
    layer.addGeoJSONFeatures = function(geojson_features) {
      layer.addFeatures(new ol.format.GeoJSON().readFeatures(geojson_features));
    }
    layer.setVisibility = function(visibility) {
      layer.setVisible(visibility);
    }
    layer.removeAllFeatures = function() {
      var layersource = layer.getSource();
      if (layersource) {
        layersource.clear();
      }
    }
    layer.getDataExtent = function() {
      return this.getSource().getExtent();
    }
    return layer;
  },
  addPopup: function(action, fillPopupFunction) {

    app.map.popup = new ol.Overlay({
      element: document.getElementById('popup')
    });
    app.map.addOverlay(app.map.popup);
    // app.map.popup = popup.getElement();

    if (!fillPopupFunction) {
      fillPopupFunction = function(evt) {
        var element = app.map.popup.getElement();
        var coordinate = evt.coordinate;
        var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
          coordinate, 'EPSG:3857', 'EPSG:4326'
        ));
        $(element).popover('dispose');
        // $(app.map.popup).popover('hide');
        app.map.popup.setPosition(coordinate);
        var markup = '';
        featureCount = 0;
        map.forEachFeatureAtPixel(evt.pixel, function(feature) {
          featureCount += 1;
          console.log('feature: ' + featureCount);
          if (markup) {
            markup += '<hr><table>';
          } else {
            markup = '<table>';
          }
          properties = feature.getProperties();
          // for (const property in properties) {
          for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            markup += '<tr><th>' + property + '</th><td>' + properties[property] + '</td></tr>';
          }
          markup += '</table>';
        }, {hitTolerance: 1});
        if (markup) {
          $(element).popover({
          // $(element).popover({
            'placement': 'top',
            'animation': false,
            'html': true,
            'content': markup
          });
          $(element).popover('show');
        }
      }
    }
    map.on(action, fillPopupFunction);
  }
}
