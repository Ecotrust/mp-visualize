/*
  * app.wrapper.map.addBaseLayers - add initial base layers to the map
  *@param {null} none
  */
// app.wrapper.map.addBaseLayers() {};

/**
  * app.wrapper.map.getCenter - get the center coords of the map in 4326
  */
app.wrapper.map.getCenter = function() {
  var center = ol.proj.toLonLat(app.map.getView().getCenter(), 'EPSG:3857');
  return {
    'lon': center[0],
    'lat': center[1]
  };
};

/**
  * setCenter - set the center of the map from given coords in 4326
  * @param {float} lon - longitude coordinate (in EPSG:4326) for new center of map view
  * @param {float} lat - latitude coordinate (in EPSG:4326) for new center of map view
  */
app.wrapper.map.setCenter = function(lon, lat) {
  app.map.getView().setCenter(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)], 'EPSG:3857'));
}

/**
  * setZoom - set the zoom level of the map
  * @param {int} zoom - the zoom level to set the map to
  */
app.wrapper.map.setZoom = function(zoom) {
  app.map.getView().setZoom(parseInt(zoom));
}

/**
  * zoomToExtent - focus the map on a given extent
  * @param {list} extent - the extent to set the map to
  */
app.wrapper.map.zoomToExtent = function(extent) {
  app.map.getView().fit(extent, {'duration': 1000});
}

/**
  * zoomToBufferedExtent - focus the map on a given extent + x% buffer
  * @param {list} extent - the extent to set the map to
  * @param {float} extent - the Percent buffer to add to each side of the extent
  *   if 1 or less, treat as 1 = 100%
  *   if greater than 1, tread as 1 = 1%
  */
app.wrapper.map.zoomToBufferedExtent = function(extent, buffer) {
  if (buffer > 1.0) {
    buffer = buffer/100.0;
  }
  width = Math.abs(extent[2]-extent[0]);
  height = Math.abs(extent[3]-extent[1]);
  w_buffer = width * buffer;
  h_buffer = height * buffer;
  buf_west = extent[0] - w_buffer;
  buf_east = extent[2] + w_buffer;
  buf_south = extent[1] - h_buffer;
  buf_north = extent[3] + h_buffer;
  buffered_extent = [buf_west, buf_south, buf_east, buf_north];
  app.wrapper.map.zoomToExtent(buffered_extent);
}

/**
  * animateView - animate panning and zooming the map view to a new location
  * @param {array} center - the X and Y coordinates {floats} for the new view center
  * @param {int} zoom - the zoom level to set the map to
  * @param {int} duration - the number of milliseconds to take to transition the view
  */
app.wrapper.map.animateView = function(center, zoom, duration) {
  var view = app.map.getView();
  view.animate({
    center: ol.proj.fromLonLat(center),
    zoom: zoom,
    duration: duration
  })
}

app.wrapper.map.zoomOut = function() {
  app.map.getView().animate({
    zoom: app.map.getView().getZoom() - 1,
    duration: 250
  })
}

/**
  * getLayers - return all layers on map as an array
  */
app.wrapper.map.getLayers = function() {
  return app.map.getLayers().getArray();
}

/**
  * getOverlays - return all overlay layers on map as an array
  */
app.wrapper.map.getOverlays = function() {
  var layers = app.wrapper.map.getLayers();
  overlays = [];
  for (var i=0; i < layers.length; i++) {
    if (layers[i].get('type') == 'overlay') {
      overlays.push(layers[i]);
    }
  }
  return overlays;
}

/**
  * setBaseLayersIndex - get the value for the map array index for base layers
  *   This needs to be done dynamically - the order of layers changes between
  *   browsers for some reason. It also changes over the course of use.
  *   This used to be hardcoded to 1 in ol6_wrapper.js
  *       RDH 1/8/2021
  */
app.wrapper.map.getBaseLayersIndex = function() {
  var lyr_array = app.map.getLayers().getArray();
  for (var i = 0; i < lyr_array.length; i++) {
    if (typeof lyr_array[i].getLayers != "undefined"){
      app.wrapper.map.baselayersIndex = i;
      return i;
    }
  }
}

/**
  * getLayersByName - get all layers added to map that have the provided name
  * @param {string} layerName - the name of all layers to be returned
  */
app.wrapper.map.getLayersByName = function(layerName) {
  var layers = app.map.getLayers().getArray()[app.wrapper.map.getBaseLayersIndex()].getLayers().getArray();
  var return_layers = []
  for (var i=0; i < layers.length; i++) {
    if (layers[i].get('name') == layerName) {
      return_layers.push(layers[i]);
    }
  }
  return return_layers;
}

/**
  * sortLayers - sort layers by z index
  */
app.wrapper.map.sortLayers = function() {
  // re-ordering map layers by z value
  app.map.layers = app.wrapper.map.getLayers();
  app.map.layers.sort(function(a, b) {
      // ascending sort
      if (a.hasOwnProperty('state_') && a.state_){
        if (b.hasOwnProperty('state_') && b.state_) {
          return a.state_.zIndex - b.state_.zIndex;
        }
      }
      return true;
  });
}

app.wrapper.map.setLayerVisibility = function(layer, visibility){
      // if layer is in openlayers, hide/show it
      if (layer.layer) {
          if (layer.layer instanceof layerModel && layer.layer.hasOwnProperty('layer') && layer.layer.layer) {
            layer.layer.layer.set('visible', visibility);
          } else {
            if (layer.layer.hasOwnProperty('setVisible')) {
              layer.layer.setVisible(visibility);
            } else {
              layer.layer.set('visible', visibility);
            }
          }
      }
}

/**
  * app.wrapper.map.getZoom - get the current zoom level of the map
  */
app.wrapper.map.getZoom = function() {
  return app.map.getView().getZoom();
}

/**
  * app.wrapper.map.setMouseWheelZoom - enable or disable mouse wheel zoom interaction
  * @param {boolean} set_active - whether or not your enabling or disabling mouse wheel zoom
  */
app.wrapper.map.setMouseWheelZoom = function(set_active) {
  app.map.getInteractions().forEach(function (interaction) {
    if(interaction instanceof ol.interaction.MouseWheelZoom) {
      interaction.setActive(set_active);
    }
  });
};

/**
  * app.wrapper.map.getBasemap - get info about the current active base layer
  */
app.wrapper.map.getBasemap = function() {
  var mapGroups = app.map.getLayers().getArray();
  var basemaps = [];
  for (var i=0; i < mapGroups.length; i++) {
    var basemapGroup = mapGroups[i];
    if ('getLayers' in basemapGroup || basemapGroup.hasOwnProperty('getLayers')) {
      var basemaps = basemapGroup.getLayers().getArray();
      i = mapGroups.length; //break
    }
  }
  var basemap = false;
  for (var i = 0; i < basemaps.length; i++) {
    if (basemaps[i].getVisible()) {
      if (basemap) {
        basemaps[i].setVisible(false);
      } else {
        basemap = basemaps[i];
      }
    }
  }
  if (!basemap) {
    basemap = basemaps[0];
    basemap.setVisible(true);
  }
  return {
    'name': basemap.get('name'),
    'id': basemap.ol_uid,
    'textColor': basemap.get('textColor'),
    'layer': basemap
  }
}

/**
  * setBasemap - set basemap to the given layer
  * @param {object} layer - the name of the layer to set as the live basemap
  */
app.wrapper.map.setBasemap = function(layer) {
  var basemapGroup = app.map.getLayers().getArray()[app.wrapper.map.getBaseLayersIndex()];
  var basemaps = basemapGroup.getLayers().getArray();
  var current_basemap = app.wrapper.map.getBasemap().layer;
  // determine if layer is layer object or name
  if (typeof(layer) == "string") {
    for (var i = 0; i < basemaps.length; i++) {
      if (basemaps[i].get('name').toLowerCase() == app.getBaseLayerDefinitionByName(layer).name.toLowerCase()) {
        layer = basemaps[i];
        break;
      }
    }
  }
  current_basemap.setVisible(false);
  layer.setVisible(true);

  if (layer == app.wrapper.layers['ocean']) {
    app.wrapper.layers['ocean_labels'].setVisible(true);
  } else {
    app.wrapper.layers['ocean_labels'].setVisible(false);
  }


  //testing
  var match_found = false;
  var name_match_found = false;
  for (var i=0; i < basemaps.length; i++) {
    if (basemaps[i].get('name').toLowerCase() == layer.get('name').toLowerCase()) {
      name_match_found = true;
    }
    if (basemaps[i] == layer) {
      match_found = true;
    }
  }
  if (!match_found){
    basemaps.push(layer);
    if (!name_match_found) {
      alert('Provided base map is nothing like any designated basemap options. Adding...');
    } else {
      alert('Provided base map not included in designated basemaps. Adding...');
    }
  }
}

/**
  * createPopup - function to create OL popups on map
  * @param {object} feature - map feature on which to apply the popup
  */
app.wrapper.map.createPopup = function(feature) {
    window.alert('Please create OL5 logic to handle this scenario in ol5_map.js: app.wrapper.map.createPopup.');
    // OL2 Cruft below
    // var mouseoverAttribute = feature.layer.layerModel.mouseoverAttribute,
    //     attributeValue = mouseoverAttribute ? feature.attributes[mouseoverAttribute] : feature.layer.layerModel.name,
    //     location = feature.geometry.getBounds().getCenterLonLat();
    //
    // if ( ! app.map.getExtent().containsLonLat(location) ) {
    //     location = app.map.center;
    // }
    // var popup = new OpenLayers.Popup.FramedCloud(
    //     "",
    //     location,
    //     new OpenLayers.Size(100,100),
    //     "<div>" + attributeValue + "</div>",
    //     null,
    //     false,
    //     null
    // );
    // popup.feature = feature;
    // feature.popup = popup;
    // app.wrapper.map.addPopup(popup);
};

/**
  * addMarkersLayer - function to add a vector layer for displaying markers on map
  */
app.wrapper.map.addMarkersLayer = function() {

  var markerSource = new ol.source.Vector({
    features: []
  });
  var markerLayer = new ol.layer.Vector({
    source: markerSource
  });
  markerLayer.set('name', 'markers');
  markerLayer.set('type', 'markers');
  app.wrapper.map.markerLayer = markerLayer;
  app.map.addLayer(app.wrapper.map.markerLayer);
  markerLayer.setZIndex(999);
  app.markers = {};
}

/**
  * clearMarkers - function to remove all markers from the marker layer
  */
app.wrapper.map.clearMarkers = function(){
  var markerLayer = app.wrapper.map.getMarkerLayer();
  if (markerLayer) {
    app.wrapper.map.markerLayer.getSource().clear();
  }

};

/**
  * addMarker - add a marker to the marker layer at the given coordinates
  * @param {float} lon - the longitude coordinate to place the marker (EPSG:4326)
  * @param {float} lat - the latitude coordinate to place the marker (EPSG:4326)
  */
app.wrapper.map.addMarker = function(lon, lat){
  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
    name: 'Marker'
  });
  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon( ({
      anchor: [0.5, 1],
      src: '/static/visualize/img/red-pin.png',
      scale: 0.35,
    }))
  });
  iconFeature.setStyle(iconStyle);
  var markerLayer = app.wrapper.map.getMarkerLayer();
  if (!markerLayer) {

  }
  markerLayer.getSource().addFeature(iconFeature);

};

/**
  * getMarkerLayer - function to identify the marker layer object and return it.
  */
app.wrapper.map.getMarkerLayer = function() {
  var layers = app.map.getLayers().getArray();
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    if (layer.get('name') == 'markers' && layer.get('type') == 'markers') {
      return layer;
    }
  }
  app.wrapper.map.addMarkersLayer();
  return app.wrapper.map.getMarkerLayer();
}

/**
  * removeLayerByName - given a string, find layers with that name and remove them from the map
  * @param {string} layerName - string representing the name of layer(s) to be removed
  */
app.wrapper.map.removeLayerByName = function(layerName) {
  var layers = app.map.getLayers().getArray();
  for (var i=0; i<layers.length; i++) {
      if (layers[i].get('name') === layerName) {
          app.map.removeLayer(layers[i]);
      }
  }
  var active_layers = app.viewModel.activeLayers();
  for (var i=0; i<active_layers.length; i++) {
    if (active_layers[i].name === layerName) {
      var obsolete_layer = active_layers[i]
      app.viewModel.activeLayers.remove(obsolete_layer);
      break;
    }
  }
};

/**
  * removeLayerByUID - given a string, find layers with that UID and remove them from the map
  * @param {string} uid - string representing the name of layer(s) to be removed
  */
app.wrapper.map.removeLayerByUID = function(uid) {
  var layers = app.map.getLayers().getArray();
  for (var i=0; i<layers.length; i++) {
      if (layers[i].get('mpid') === uid || layers[i].get('uid') === uid) {
          app.map.removeLayer(layers[i]);
      }
  }
  var active_layers = app.viewModel.activeLayers();
  for (var i=0; i<active_layers.length; i++) {
    if (active_layers[i].id === uid) {
      var obsolete_layer = active_layers[i]
      app.viewModel.activeLayers.remove(obsolete_layer);
      break;
    }
  }
};

/**
  * postProcessLayer - perform additional post-processing steps on any layer added
  * @param {object} layer - mp layer instance
  */
app.wrapper.map.postProcessLayer = function(layer){
  layer.layer.set('name', layer.name);
  layer.layer.set('type', 'overlay');
  layer.layer.set('mpid', layer.id);
  layer.layer.set('proxy_url', layer.proxy_url);
  layer.layer.set('query_by_point', layer.query_by_point);
  if (layer.hasOwnProperty('type')) {
    layer.layer.set('tech', layer.type);
  } else if (layer.hasOwnProperty('layer_type')) {
    layer.layer.set('tech', layer.layer_type);
  } else {
    layer.layer.set('tech', null);
  }
  if (layer.layer.proxy_url){
    // RDH 2022-06-07: Proxies are hard.
    //  * we include the layer_id to provide security -- does the requested URL domain match the layer's domain in the DB?
    //  * We encode the URL -- this means we also need to re-write all logic that parses the URL (like legend, export, and query)
    //  * finally, we add proxy_params=true -- this gives us a nice pattern to break on (anything appended is assumed to be meant for 'url')
    layer.url.set('url', "/visualize/proxy?layer_id=" + layer.id + "&url=" + encodeURIComponent(layer.url) + "%3F&proxy_params=true");
    if (layer.type == "XYZ") {
      // RDH 2022-06-07: Proxies get harder
      //  XYZ templates are interpreted client-side by OpenLayers, so they CAN'T be encoded, or OL will never recognize them.
      //  This block restores them back to an un-encoded format.
      let templates = ["{x}", "{X}","{y}","{Y}","{z}","{Z}"];
      for (var i = 0; i < templates.length; i++) {
        let encoded_template = encodeURIComponent(templates[i]);
        if (layer.url.indexOf(encoded_template) >= 0) {
          layer.url = layer.url.split(encoded_template).join(templates[i]);
        }
      }
    }
  } else {
    layer.layer.set('url', layer.url);
  }
  layer.layer.set('arcgislayers', layer.arcgislayers);
  layer.layer.set('utfgrid', layer.utfurl || (layer.parent && layer.parent.utfurl));
  layer.layer.set('mp_layer', layer);
  if (typeof(layer.opacity) == 'function') {
    layerOpacity = layer.opacity();
  } else {
    layerOpacity = layer.opacity;
  }
  if (typeof(layerOpacity) == 'string') {
    layerOpacity = parseFloat(layerOpacity);
  }
  layer.layer.setOpacity(layerOpacity);

  app.map.addLayer(layer.layer);
}

/**
  * getLayerParameter - logic to pull a given common mp parameter from (ol5) layer objects
  * @param {object} layer - an (ol5) layer object
  * @param {string} param - a parameter to recover from the layer object, if available
  */
app.wrapper.map.getLayerParameter = function(layer, param){
  return layer.get(param);
}

/**
  * formatOL5URLTemplate - clear url template of OL2 assumptions and reformat for OL5
  * @param {string} layerUrl - the OL2 formatted url template
  */
app.wrapper.map.formatOL5URLTemplate = function(layerUrl){
  // clean ol2 assumptions in URL formatting:
  if (layerUrl && layerUrl != '') {
    layerUrl = layerUrl.split('${x}').join('{x}');
    layerUrl = layerUrl.split('${y}').join('{y}');
    layerUrl = layerUrl.split('${z}').join('{z}');
  }
  return layerUrl;
}

/**
  * addArcRestLayerToMap - add an arcRest layer to the (ol6) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addArcRestLayerToMap = function(layer) {
  var layerSource = new ol.source.TileArcGISRest({
    attributions: '',
    params: {
      layers: 'show:' + layer.arcgislayers,
      DPI: 96,
    },
    projection: 'ESPG:3857',
    url: layer.url,
    hidpi: false,
    crossOrigin: 'anonymous',
    tilePixelRatio: 1,
    tileGrid: new ol.tilegrid.createXYZ({
      tileSize: [1024, 1024]      // RDH 20191118 - "singleTile" replacement hack.
    }),

  })
  layer.layer = new ol.layer.Tile({
    source: layerSource,
    useInterimTilesOnError: false,
  });

  if (layer.minZoom != null && layer.minZoom != undefined) {
    layer.layer.setMinZoom(layer.minZoom);
  }
  if (layer.maxZoom != null && layer.maxZoom != undefined) {
    layer.layer.setMaxZoom(layer.maxZoom);
  }

  return layer;

};

app.wrapper.map.addArcFeatureServerLayerToMap = function(layer) {

  var esrijsonFormat = new ol.format.EsriJSON();

  var layerSource = new ol.source.Vector({
    loader: function(extent, resolution, projection) {
      let path_suffix = layer.arcgislayers + '/query/';
      let geom_string = 'f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=';
      let extent_string = encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":102100}}'
      );
      let envelope_string = '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100';
      let query_suffix = geom_string +
        extent_string +
        envelope_string;
      let url = layer.url + path_suffix + '?' + query_suffix;
      if (layer.proxy_url) {
        path_suffix = encodeURIComponent(path_suffix);
        // query_suffix = encodeURIComponent(query_suffix);
        let split_url = layer.url.split(encodeURIComponent('?'));
        split_url[0] = split_url[0] + path_suffix;
        url = split_url.join(encodeURIComponent('?'))
        if (url.indexOf(encodeURIComponent('?')) >= 0) {
          url = url + query_suffix;
        } else {
          url = url + encodeURIComponent('?') + query_suffix;
        }
      }
      

        
      $.ajax({
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
        success: function (response) {
          if (response.error) {
            alert(
              response.error.message + '\n' + response.error.details.join('\n')
            );
          } else {
            // dataProjection will be read from document
            var features = esrijsonFormat.readFeatures(response, {
              featureProjection: projection,
            });
            if (features.length > 0) {
              layerSource.addFeatures(features);
            }
          }
        },
      });
    },
    strategy: ol.loadingstrategy.tile(
      ol.tilegrid.createXYZ({
        tileSize: 512,
      })
    ),
    crossOrigin: 'anonymous'
  });

  layer.layer = new ol.layer.Vector({
    source: layerSource,
    style: app.wrapper.map.getLayerStyle,
    declutter: true,
  });
  if (layer.minZoom != null && layer.minZoom != undefined) {
    layer.layer.setMinZoom(layer.minZoom);
  }
  if (layer.maxZoom != null && layer.maxZoom != undefined) {
    layer.layer.setMaxZoom(layer.maxZoom);
  }

  let request_url = layer.url + layer.arcgislayers;
  if (layer.proxy_url) {
    let url_split = layer.url.split(encodeURIComponent('?'));
    url_split[0] = url_split[0] + layer.arcgislayers;
    request_url = url_split.join(encodeURIComponent('?'));
  }
  if (request_url.indexOf('?') == -1) {
    request_url = request_url + '?f=json';
  } else {
    request_url = request_url + '&f=json';
  }

  $.ajax({
    dataType: "jsonp",
    crossDomain: true,
    url: request_url,
    'success': function(response){
      // TODO: Override Arc FeatureServer styles from 'createStyleFunction' with:
      //  * Style defaults from Django Layer Form [ DONE ]
      //  * Custom 'Lookup Styles' from Django Layer Form
      createStyleFunction(response)
      .then(styleFunction => {
        layer.defaultStyleFunction = styleFunction;
      });
      interpretArcGISFeatureServerLegend(layer, response);
    }
  });

  return layer;

};

app.wrapper.map.getRandomColor = function(feature, resolution) {
  if (feature && feature != undefined) {
    console.log(feature);
  }
  var colors = app.map.styles.colors;
  var random_color = Math.floor(Math.random() * colors.length);
  return colors[random_color];
}

app.wrapper.map.getCustomColor = function(layer, feature) {
  color_key = layer.color.split(":")[1].trim();
  if (feature && feature != undefined && feature != null && feature.getKeys().indexOf(color_key) >= 0 ) {
    return feature.get(color_key);
  } else {
    return app.wrapper.map.getRandomColor(feature, null);
  }
}

app.wrapper.map.convertColorToRGB = function(colorValue) {
  if (Object.keys(app.map.styles.colorLookup).indexOf(colorValue) >= 0) {
    return app.wrapper.map.convertHexToRGB(app.map.styles.colorLookup[colorValue]);
  } else if (colorValue.indexOf('#') == 0 || colorValue.length == 6 || colorValue.length == 3) {
    return app.wrapper.map.convertHexToRGB(colorValue);
  } else {
    // Value is not a valid hex value
    // console.log("ERROR: value '" + colorValue + "'is not a valid hex value");
    return {'red': 180, 'green': 180, 'blue': 0};
  }
}

app.wrapper.map.convertHexToRGB = function(hex) {
  if (hex.indexOf('#') == 0) {
    hex = hex.split('#')[1];
  }
  if (hex.length == 3) {
    var hexRed = hex[0];
    var hexGreen = hex[1];
    var hexBlue = hex[2];
  } else {  // if  (hex.length == 6)
    var hexRed = hex.substr(0,2);
    var hexGreen = hex.substr(2,2);
    var hexBlue = hex.substr(4,2);
  }
  var red = parseInt(hexRed, 16);
  var green = parseInt(hexGreen, 16);
  var blue = parseInt(hexBlue, 16);
  return {'red': red, 'green': green, 'blue': blue};
}

app.wrapper.map.cartoGetLayerFill = function(layer, feature) {
  // The below will set all shapes to the same random color.
  // This is an improvement over assuming all vector layers should be orange.
  if (feature && (!layer.color || layer.color == null || layer.color == undefined || layer.color.toLowerCase() == "random")) {
    var fill_color = app.wrapper.map.getRandomColor(feature);
  } else if (feature && layer.color.toLowerCase().indexOf("custom:") == 0) {
    var fill_color = app.wrapper.map.getCustomColor(layer, feature);
  } else {
    var fill_color = layer.color;
  }

  // OpenLayers' stile.Fill doesn't accept 'opacity' as an argument.
  //    Instead, you need to convert your color to an RGBA and apply opacity
  //    as part of that value:
  if (layer.fillOpacity) {
    rgbObject = app.wrapper.map.convertColorToRGB(fill_color);
    if (rgbObject.hasOwnProperty('red') && rgbObject.hasOwnProperty('green') && rgbObject.hasOwnProperty('blue')) {
      fill_color = 'rgba(' + rgbObject.red + ',' + rgbObject.green + ',' + rgbObject.blue +',' + layer.fillOpacity + ')';
    } else {
      console.log("Error: unable to interpret fill_color: " + fill_color);
      fill_color = 'rgba(180,180,0,' + layer.fillOpacity + ')';
    }
  }

  var fill = new ol.style.Fill({
    color: fill_color
  });
  return fill;
}

/**
  * createOLStyleMap - interpret style from layer record into an OpenLayers styleMap
  * @param {object} layer - the mp layer definition to derive the style from
  */
app.wrapper.map.createOLStyleMap = function(layer, feature){
  if (!layer){
    layer = {
      outline_color: "#ee9900",
      outline_width: 1,
      color: "#ee9900",
      fillOpacity: 0.5,
      graphic: false,
      point_radius: 5,
      annotated: false
    };
  }

  var stroke = new ol.style.Stroke({
    color: layer.outline_color,
    width: layer.outline_width
  });

  var fill = app.wrapper.map.cartoGetLayerFill(layer, feature)

  if (layer.graphic && layer.graphic.length > 0) {
    var image = new ol.style.Icon({
      src: layer.graphic,
      anchor: [0.5, 0.5],
      scale: layer.graphic_scale,
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
    });
  } else {
    try {
      var image = new ol.style.Circle({
        radius: layer.point_radius,
        fill: fill,
        stroke: stroke,
      });
    } catch (err) {
      fill.setColor("orange");
      var image = new ol.style.Circle({
        radius: layer.point_radius,
        fill: fill,
        stroke: stroke,
      });
    }
  }
  if (layer.annotated){
    var textStroke = new ol.style.Stroke({
      color: "#333",
    });
    var text = new ol.style.Text({
      text: "${NAME}",
      stroke: textStroke,
      font: "12px sans-serif",
    });
  } else {
    var text = null;
  }

  var style_dict = {
    'Point': new ol.style.Style({
      image: image,
      text: text
    }),
    'LineString': new ol.style.Style({
      stroke: stroke,
      text: text
    }),
    'MultiLineString': new ol.style.Style({
      stroke: stroke,
      text: text
    }),
    'MultiPoint': new ol.style.Style({
      image: image,
      text: text
    }),
    'MultiPolygon': new ol.style.Style({
      stroke: stroke,
      fill: fill,
      text: text
    }),
    'Polygon': new ol.style.Style({
      stroke: stroke,
      fill: fill,
      text: text
    }),
    'GeometryCollection': new ol.style.Style({
      stroke: stroke,
      fill: fill,
      image: image,
      text: text
    }),
    'Circle': new ol.style.Style({
      stroke: stroke,
      fill: fill,
      text: text
    }),
    'Label': new ol.style.Style({
      text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        overflow: true,
        fill: new ol.style.Fill({
          color: '#000',
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 3,
        }),
      })
    })
  }

  return style_dict;
}

app.wrapper.map.getFocusedStyle = function(feature) {
  var selectedStyle = app.wrapper.map.getLayerStyle(feature);
  if (Array.isArray(selectedStyle)) {
    var featureStyle = selectedStyle[0];
  } else {
    var featureStyle = selectedStyle;
  }
  if (featureStyle.getStroke()) {
    featureStyle.getStroke().setWidth(3);
    featureStyle.getStroke().setColor("#000000");
  }
  if (Array.isArray(selectedStyle)) {
    selectedStyle[0] = featureStyle;
    return selectedStyle;
  } else {
    return featureStyle;
  }
}

app.wrapper.map.getSelectedStyle = function(feature) {
  var selectedStyle = app.wrapper.map.getLayerStyle(feature);
  if (Array.isArray(selectedStyle)) {
    var featureStyle = selectedStyle[0];
  } else {
    var featureStyle = selectedStyle;
  }
  if (featureStyle.getStroke()) {
    featureStyle.getStroke().setWidth(3);
    featureStyle.getStroke().setColor("#FF8800");
  }
  if (Array.isArray(selectedStyle)) {
    selectedStyle[0] = featureStyle;
    return selectedStyle;
  } else {
    return featureStyle;
  }
}

app.wrapper.map.getLayerStyle = function(feature) {
  if (feature && feature.getLayer()) {
    var layer = app.viewModel.getLayerByOLId(feature.getLayer().ol_uid);
    var styles = app.wrapper.map.createOLStyleMap(layer);
    if (layer.type == 'ArcFeatureServer' && layer.hasOwnProperty('defaultStyleFunction')) {
      var styles = {};
      styles[feature.getGeometry().getType()] = layer.defaultStyleFunction(feature)[0];
      if (layer.hasOwnProperty('color') && layer.color){
        var fill_color = app.wrapper.map.cartoGetLayerFill(layer);
        if (layer.override_color && fill_color) {
          styles[feature.getGeometry().getType()].setFill(fill_color);
        }
      }

      if (layer.override_outline && layer.hasOwnProperty('outline_color') && layer.outline_color) {
        var outline_color = layer.outline_color;
      } else {
        try {
          var outline_color = styles[feature.getGeometry().getType()]['stroke_']['color_'];
        } catch (error) {
          // RDH 2022-06-16: If no stroke color, set to invisible.
          var outline_color = "rgba(0,0,0,0)";
        }
      }
      if (layer.override_outline_width && layer.hasOwnProperty('outline_width') && layer.outline_width) {
        var outline_width = layer.outline_width;
      } else {
        // RDH 2022-05-25: maintaining current width as 'default' will prevent a return to a normal width after selection.
        //    TODO: This is a bug that will need to be fixed to support any vector layer whose default stroke width is not 1.
        // var outline_width = styles[feature.getGeometry().getType()]['stroke_']['width_'];
        try {
          var outline_width = styles[feature.getGeometry().getType()]['stroke_']['width_'];
        } catch (error) {
          // RDH 2022-06-16: If no stroke width, set to 0.
          var outline_width = 0;
        }  
      }
      // RDH 20221202: some logic must be testing against width - a 0 value is resulting in all features re-rendered after
      //  a selected feture gets an outline. For now: use a non-zero number with an invisible outline.
      if (outline_width == 0) {
        outline_width = 0.01;
        outline_color = 'rgba(0,0,0,0)';
      }
      var stroke_style = new ol.style.Stroke({
        color: outline_color,
        width: outline_width
      });
      styles[feature.getGeometry().getType()].setStroke(stroke_style);

    }
    var labels = layer.label_field;
    var lookupField = layer.lookupField;
    var lookupDetails = layer.lookupDetails;
    var default_opacity = layer.opacity;
    var point_radius = layer.point_radius;
    var default_width = layer.outline_width;
    var default_color = layer.color;
    var default_stroke_color = layer.outline_color;

    if (layer.color && (layer.color.toLowerCase() == "random" || layer.color.toLowerCase().indexOf("custom:") == 0 )) {
      var featureStyle = app.wrapper.map.createOLStyleMap(layer, feature)[feature.getGeometry().getType()];
    } else {
      var featureStyle = styles[feature.getGeometry().getType()];
    }
  } else {
    var styles = app.wrapper.map.createOLStyleMap(false);
    var lookupField = false;
    var lookupDetails = [];
    var default_opacity = 0.5;
    var point_radius = 5;
    var default_width = 1;
    var default_color = "#ee9900";
    var default_stroke_color = "#ee9900";
    var featureStyle = styles[feature.getGeometry().getType()];
  }

  var new_style = false;
  var default_fill = featureStyle.getFill();
  if (!default_fill) {
    default_fill = { color: default_color, opacity: default_opacity};
  }
  var default_stroke = featureStyle.getStroke();
  if (!default_stroke) {
    default_stroke = { color: default_stroke_color, width: default_width};
  }
  var default_text = featureStyle.getText();
  if (!lookupDetails) {
    lookupDetails = [];
  }
  for (var i = 0; i < lookupDetails.length; i++) {
    var detail = lookupDetails[i];
    if (lookupField && detail.value.toString() == feature.getProperties()[lookupField].toString()) {
      if (detail.fill) {
        var fill_color = detail.color;
        var fill_opacity = default_opacity;
        var new_fill = new ol.style.Fill({
          color: fill_color,
          opacity: fill_opacity
        });
      } else {
        var new_fill = null;
      }
      if (detail.hasOwnProperty('stroke_color') && detail.stroke_color && detail.stroke_color != '') {
        var stroke_color = detail.stroke_color;
      } else {
        var stroke_color = default_stroke.color;
      }
      if (detail.hasOwnProperty('stroke_width') && typeof(detail.stroke_width) == "number" && detail.stroke_width >= 0) {
        var stroke_width = detail.stroke_width;
      } else {
        var stroke_width = default_stroke.width;
      }
      switch(detail.dashstyle) {
        case 'dot':
          var stroke_dash = [1,6];
          break;
        case 'dash':
          var stroke_dash = [6,6];
          break;
        case 'dashdot':
          var stroke_dash = [6,6,2,6];
          break;
        case 'longdash':
          var stroke_dash = [12,6];
          break;
        case 'longdashdot':
          var stroke_dash = [12,6,2,6];
          break;
        case 'solid':
          var stroke_dash = null;
          break;
        default:
          var stroke_dash = null;
      }

      var new_stroke = new ol.style.Stroke({
        color: stroke_color,
        width: stroke_width,
        lineDash: stroke_dash
      });
      if (detail.graphic && detail.graphic.length > 0) {
        var new_image = new ol.style.Icon({
          src: detail.graphic,
          anchor: [0.5, 0.5],
          scale: detail.graphic_scale,
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
        });
      } else {
        var new_image = new ol.style.Circle({
          radius: point_radius,
          fill: new_fill,
          stroke: new_stroke,
        });
      }

      switch(feature.getGeometry().getType()) {
        case 'Point':
          var new_style = new ol.style.Style({
            image: new_image
          });
          break;
        case 'LineString':
          var new_style = new ol.style.Style({
            stroke: new_stroke
          });
          break;
        case 'MultiLineString':
          var new_style = new ol.style.Style({
            stroke: new_stroke
          });
          break;
        case 'MultiPoint':
          var new_style = new ol.style.Style({
            image: new_image
          });
          break;
        case 'MultiPolygon':
          var new_style = new ol.style.Style({
            stroke: new_stroke,
            fill: new_fill
          });
          break;
        case 'Polygon':
          var new_style = new ol.style.Style({
            stroke: new_stroke,
            fill: new_fill
          });
          break;
        case 'GeometryCollection':
          var new_style = new ol.style.Style({
            stroke: new_stroke,
            fill: new_fill,
            image: new_image
          });
        case 'Circle':
          var new_style = new ol.style.Style({
            stroke: new_stroke,
            fill: new_fill
          });
          break;
        default:
          var new_style = new ol.style.Style({
            stroke: new_stroke,
            fill: new_fill,
            image: new_image
          });
      }
      break;
    }
  }


  if (labels) {
    label_style = styles['Label'];
    label_style.getText().setText(feature.get(labels));
    if (new_style) {
      return [new_style, label_style];
    } else {
      return [featureStyle, label_style];
    }
  } else {
    if (new_style) {
      return new_style;
    } else {
      return featureStyle;
    }
  }


}

/**
  * addVectorLayerToMap - add vector layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addVectorLayerToMap = function(layer) {
  layer.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: layer.url,
          format: new ol.format.GeoJSON(),
          crossOrigin: 'anonymous'
        }),
        style: app.wrapper.map.getLayerStyle,
        strategy: new ol.loadingstrategy.all(),
        declutter: true,
      }
  );
  return layer;
}

/**
  * addWMSLayerToMap - add WMS layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addWMSLayerToMap = function(layer) {
  wms_url = layer.url;
  wms_proxy = false;
  layer_params = {
    LAYERS: layer.wms_slug,
    TRANSPARENT: "true"
  }
  if (layer.wms_format){
    layer_params.format = layer.format;
  } else {
    layer_params.format = "image/png";
  }

  if (!wms_proxy) {
    if (layer.wms_styles){
      layer_params.styles = layer.wms_styles;
    }
    if (layer.wms_timing){
      layer_params.time = layer.wms_timing;
    }
    if (layer.wms_additional){
      if (layer.wms_additional[0] == '?') {
        layer.wms_additional = layer.wms_additional.slice(1);
      }
      var additional_list = layer.wms_additional.split("&");
      for (var i = 0; i < additional_list.length; i++) {
        key_val = additional_list[i].split('=');
        if (key_val.length == 2) {
          key = key_val[0];
          value = key_val[1];
          layer_params[key] = value;
        }
      }
    }

  }

  var layer_projection = 'ESPG:3857';
  if (layer.wms_srs){
    var layer_projection = layer.wms_srs;
  }
  layer_params.CRS = layer_projection;

  var wmsSource = new ol.source.TileWMS({
    url: wms_url,
    hidpi: false,
    params: layer_params,
    projection: layer_projection.toUpperCase(),
    tiled: true
  });

  layer.layer = new ol.layer.Tile({
    source: wmsSource
  });

  return layer;
}

/**
  * addVectorTileLayerToMap - add Vector Tile layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addVectorTileLayerToMap = function(layer) {
    var layerUrl = app.wrapper.map.formatOL5URLTemplate(layer.url);
    var styles = app.wrapper.map.createOLStyleMap(layer);
    var styleFunction = function(feature) {
      default_style = styles[feature.getGeometry().getType()];
      if (layer.color.toLowerCase() == "random" || layer.color.toLowerCase().indexOf("custom:") == 0 ) {
        var new_style = app.wrapper.map.createOLStyleMap(layer, feature)[feature.getGeometry().getType()];
        default_style = new_style;
      }
      return default_style;
    };

    var layerSource = new ol.source.VectorTile({
      attributions: '',  //TODO: get layer attributions
      format: new ol.format.MVT({
        featureClass: ol.Feature
      }),
      crossOrigin: 'anonymous',
      url: layerUrl
    });

    layer.layer = new ol.layer.VectorTile({
      declutter: true,
      source: layerSource,
      style: styleFunction
    });

    if (layer.color.toLowerCase() == "random") {
      layer.layer.getSource().on('addfeature', function(event) {
        print(layer);
      });
    }

    return layer;
}

/**
  * addXYZLayerToMap - add XYZ layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addXYZLayerToMap = function(layer){

  var layerUrl = app.wrapper.map.formatOL5URLTemplate(layer.url);

  var layerSource = new ol.source.XYZ({
    url: layerUrl,
    crossOrigin: 'anonymous'
  });
  layer.layer = new ol.layer.Tile({
    source: layerSource,
    useInterimTilesOnError: false
  });
  return layer;
};

/**
  * addUtfLayerToMap - add UTF Grid layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addUtfLayerToMap = function(layer){
  var utfUrl = layer.utfurl ? layer.utfurl : layer.parent.utfurl
  utfUrl = app.wrapper.map.formatOL5URLTemplate(utfUrl);
  var utfSource = new ol.source.UTFGrid({
    tileJSON: {
      tiles: [layer.url],
      grids: [utfUrl],
    },
    // jsonp: true,
  })
  layer.utfgrid = new ol.layer.Tile({
    source: utfSource,
  });

  app.map.addLayer(layer.utfgrid);

  return layer;

};


/**
  * addDrawingLayerToMap - add blank vector layer to the (ol6) map for drawing
  */
app.wrapper.map.addDrawingLayerToMap = function() {

  // var layer = app.wrapper.map.createDrawingLayer(name);
  // var style_dict = app.wrapper.map.createOLStyleMap(layer);
  var source = new ol.source.Vector({wrapX: false});

  app.map.drawingLayer = new ol.layer.Vector({
    source: source,
  });

  app.map.addLayer(app.map.drawingLayer);

  return app.map.drawingLayer;
};

app.wrapper.map.addFeaturesToDrawingLayer = function(geojson_object) {
  let drawing_source = app.map.drawingLayer.getSource();
  let json_features = new ol.format.GeoJSON({featureProjection: app.map.getView().getProjection()}).readFeatures(geojson_object);
  drawing_source.clear();
  drawing_source.addFeatures(json_features);
  app.wrapper.map.zoomToExtent(drawing_source.getExtent());
  if (drawing_source.getFeatures().length > 0) {
    app.consolidatePolygonLayerFeatures();
    app.viewModel.scenarios.drawingFormModel.hasShape(true);
  }
}

app.wrapper.map.countFeatures = function(layer) {
  return layer.getSource().getFeatures().length;
}

/* Creating Feature Layers to support map controls */
app.wrapper.map.addMeasurementLayerToMap = function() {
  var source = new ol.source.Vector({wrapX: false});

  measurementLayer = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33',
        }),
      }),
    })
  });

  return measurementLayer;

}
