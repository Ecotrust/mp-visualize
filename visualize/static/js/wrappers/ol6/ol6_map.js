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
  * getLayersByName - get all layers added to map that have the provided name
  * @param {string} layerName - the name of all layers to be returned
  */
app.wrapper.map.getLayersByName = function(layerName) {
  var layers = app.map.getLayers().getArray()[app.wrapper.map.baselayersIndex].getLayers().getArray();
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
          layer.layer.set('visible', visibility);
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
  var basemapGroup = app.map.getLayers().getArray()[app.wrapper.map.baselayersIndex];
  var basemaps = basemapGroup.getLayers().getArray();
  var current_basemap = app.wrapper.map.getBasemap().layer;
  // determine if layer is layer object or name
  if (typeof(layer) == "string") {
    for (var i = 0; i < basemaps.length; i++) {
      if (basemaps[i].get('name') == layer) {
        layer = basemaps[i];
        break;
      }
    }
  }
  current_basemap.setVisible(false);
  layer.setVisible(true);

  //testing
  var match_found = false;
  var name_match_found = false;
  for (var i=0; i < basemaps.length; i++) {
    if (basemaps[i].get('name') == layer.get('name')) {
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
};

/**
  * postProcessLayer - perform additional post-processing steps on any layer added
  * @param {object} layer - mp layer instance
  */
app.wrapper.map.postProcessLayer = function(layer){
  layer.layer.set('name', layer.name);
  layer.layer.set('type', 'overlay');
  layer.layer.set('mpid', layer.id);
  if (layer.hasOwnProperty('type')) {
    layer.layer.set('tech', layer.type);
  } else if (layer.hasOwnProperty('layer_type')) {
    layer.layer.set('tech', layer.layer_type);
  } else {
    layer.layer.set('tech', null);
  }
  layer.layer.set('url', layer.url);
  layer.layer.set('arcgislayers', layer.arcgislayers);
  layer.layer.set('utfgrid', layer.utfurl || (layer.parent && layer.parent.utfurl));
  layer.layer.set('mp_layer', layer);
  if (typeof(layer.opacity) == 'function') {
    layer.layer.setOpacity(layer.opacity());
  } else {
    layer.layer.setOpacity(layer.opacity);
  }
  
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
      layers: 'show:' + layer.arcgislayers
    },
    projection: 'ESPG:3857',
    url: layer.url,
    crossOrigin: 'anonymous',
    tilePixelRatio: 1,
    tileGrid: new ol.tilegrid.createXYZ({
      tileSize: [1024, 1024]      // RDH 20191118 - "singleTile" replacement hack.
    }),

  })
  layer.layer = new ol.layer.Tile({
    source: layerSource,
    useInterimTilesOnError: false
  });

  return layer;

};

/**
  * createOLStyleMap - interpret style from layer record into an OpenLayers styleMap
  * @param {object} layer - the mp layer definition to derive the style from
  */
app.wrapper.map.createOLStyleMap = function(layer){
  var stroke = new ol.style.Stroke({
    color: layer.outline_color,
    width: layer.outline_width
  });
  var fill = new ol.style.Fill({
    color: layer.color,
    opacity: layer.fillOpacity,
  });
  if (layer.graphic && layer.graphic.length > 0) {
    var image = new ol.style.Icon({
      src: layer.graphic,
      anchor: [0.5, 0.5],
      scale: layer.graphic_scale,
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
    });
  } else {
    var image = new ol.style.Circle({
      radius: layer.point_radius,
      fill: fill,
      stroke: stroke,
    });
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
    })
  }

  return style_dict;
}

/**
  * addVectorLayerToMap - add vector layer to the (ol5) map
  * @param {object} layer - the mp layer definition to add to the map
  */
app.wrapper.map.addVectorLayerToMap = function(layer) {
  var styles = app.wrapper.map.createOLStyleMap(layer);
  var lookupField = layer.lookupField;
  var lookupDetails = layer.lookupDetails;
  var default_opacity = layer.opacity;
  var point_radius = layer.point_radius;
  var default_width = layer.outline_width;
  var default_color = layer.color;
  var default_stroke_color = layer.outline_color;

  var styleFunction = function(feature) {
    var featureStyle = styles[feature.getGeometry().getType()];

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
    for (var i = 0; i < lookupDetails.length; i++) {
      var detail = lookupDetails[i];
      if (detail.value.toString() == feature.getProperties()[lookupField].toString()) {
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

    if (new_style) {
      return new_style;
    } else {
      return featureStyle;
    }
  };
  layer.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          url: layer.url,
          format: new ol.format.GeoJSON()
        }),
        style: styleFunction,
        strategy: new ol.loadingstrategy.all(),
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
    layers: layer.wms_slug,
    transparent: "true"
  }
  if (layer.wms_format){
    layer_params.format = layer.format;
  } else {
    layer_params.format = "image/png";
  }
  if (layer.wms_srs){
    // OL2 - We need to proxy to another WMS that DOES support the current projection
    // if (layer.wms_srs != 'EPSG:3857') {
    //   wms_proxy = true;
    //   // var time_def_param_key = app.server_constants.time_def_param_key;
    //   wms_url = app.server_constants.wms_proxy_url;
    //   layer_params[app.server_constants.wms_proxy_mapfile_field] = app.server_constants.wms_proxy_mapfile
    //   layer_params[app.server_constants.source_srs_param_key] = layer.srs;
    //   layer_params[app.server_constants.conn_param_key] =  layer.url;
    //   layer_params[app.server_constants.layer_name_param_key] = layer.wms_slug;
    //   if (layer.wms_timing) {
    //     layer_params.layers = app.server_constants.proxy_time_layer;
    //     layer_params[app.server_constants.time_param_key] = layer.wms_timing;
    //     if (layer.wms_time_item) {
    //       layer_params[app.server_constants.time_item_param_key] = layer.wms_time_item;
    //     }
    //   } else {
    //     layer_params.layers = app.server_constants.proxy_generic_layer;
    //   }
    //   layer_params[app.server_constants.format_param_key] = layer.wms_format;
    //   layer_params[app.server_constants.version_param_key] = layer.wms_version;
    //   layer_params[app.server_constants.style_param_key] = layer.wms_styles;
    // }
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

  var wmsSource = new ol.source.TileWMS({
    url: wms_url,
    params: layer_params,
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
      return styles[feature.getGeometry().getType()];
    };

    var layerSource = new ol.source.VectorTile({
      attributions: '',  //TODO: get layer attributions
      format: new ol.format.MVT({
        featureClass: ol.Feature
      }),
      url: layerUrl
    });

    layer.layer = new ol.layer.VectorTile({
      declutter: true,
      source: layerSource,
      style: styleFunction
    });
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
