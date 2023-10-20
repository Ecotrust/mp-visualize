/*
  * addZoomEnd - add event watcher to trigger on zoom end
  */
app.wrapper.events.addZoomEnd = function(){
  // map.events.register("zoomend", null, function () {
  //     if (map.zoomBox.active) {
  //         app.viewModel.deactivateZoomBox();
  //     }
  //     if( map.getZoom() < 5)
  //     {
  //         map.zoomTo(5);
  //     }
  //     if (map.getZoom() > 13)
  //     {
  //         map.zoomTo(13);
  //     }
  //     app.viewModel.zoomLevel(map.getZoom());
  // };
};


/**
  * addMoveEnd - enable code to be run every time the map is moved
  * @param {function} moveEndFunction - a function to be run when the map is moved
  */
app.wrapper.events.addMoveEnd = function(moveEndFunction) {
  app.map.on('moveend', moveEndFunction);
}

/**
  * addFeatureClickEvent - event that fires when (vector?) features on map are clicked
  */
app.wrapper.events.addFeatureClickEvent = function(){
  // TODO: Update this for OL5
  app.map.interactions.selectClick = new ol.interaction.Select({
    style: app.wrapper.map.getSelectedStyle
  });
  app.map.addInteraction(app.map.interactions.selectClick);
  app.map.interactions.selectClick.on('select', function(e) {
    var selected_features = app.map.getFeaturesAtPixel(e.mapBrowserEvent.pixel);
    // var selected_features = e.selected;
    if (selected_features.length > 0) {
      for (var i = 0; i < selected_features.length; i++) {
        var layer = selected_features[i].getLayer(app.map);
        if (!layer && e.target.getLayer(selected_features[i]) && e.target.getLayer(selected_features[i]).hasOwnProperty('ol_uid')) {
          layer = app.viewModel.getLayerByOLId(e.target.getLayer(selected_features[i]).ol_uid).layer;
        }
        if (layer){
          var mp_layer = layer.get('mp_layer');
          if (mp_layer.attributeEvent == "click"){
            if (app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
              app.wrapper.events.clickOnVectorLayerEvent(layer, e);
            }
          } else if (mp_layer.isDrawingModel){
            app.wrapper.events.clickOnVectorLayerEvent(layer, e);
          }
        }
      }
    } else if (e.deselected.length > 0) {
      app.viewModel.closeAttribution();
    }
  });
  // app.map.events.register(layerModel && "featureclick", null, function(e, test) {
  //   var layer = e.feature.layer.layerModel || e.feature.layer.scenarioModel;
  //   if (layer) {
  //     var text = [],
  //     title = layer.featureAttributionName;
  //
  //     if ( layer.scenarioAttributes && layer.scenarioAttributes.length ) {
  //       var attrs = layer.scenarioAttributes;
  //       for (var i=0; i<attrs.length; i++) {
  //         text.push({'display': attrs[i].title, 'data': attrs[i].data});
  //       }
  //     } else if ( layer.attributes.length ) {
  //       var attrs = layer.attributes;
  //
  //       for (var i=0; i<attrs.length; i++) {
  //         if ( e.feature.data[attrs[i].field] ) {
  //           text.push({'display': attrs[i].display, 'data': e.feature.data[attrs[i].field]});
  //         }
  //       }
  //     }
  //
  //     // the following delay prevents the #map click-event-attributes-clearing from taking place after this has occurred
  //     setTimeout( function() {
  //       if (text.length) {
  //         app.wrapper.map.clickOutput.attributes[layer.featureAttributionName] = [{
  //           'name': 'Feature',
  //           'id': layer.featureAttributionName + '-0',
  //           'attributes':text
  //         }];
  //         app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
  //         app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.event.xy));
  //       }
  //       // if (app.marker) {
  //       // app.marker.display(true);
  //       // }
  //     }, 100);
  //
  //   }
  //
  // });//end featureclick event registration
}

/**
  * addFeatureOverEvent - event that fires when (vector?) features on map are hovered over
  */
app.wrapper.events.addFeatureOverEvent = function(){
  // TODO: Update this for OL5
  var selectHover = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    style: app.wrapper.map.getFocusedStyle
  });
  app.map.addInteraction(selectHover);
  selectHover.on('select', function(e) {
    if (e.selected.length > 0) {
      for (var i = 0; i < e.selected.length; i++) {
        var layer = e.selected[0].getLayer(app.map);
        if (layer){
          var mp_layer = layer.get('mp_layer');
          if (mp_layer && mp_layer.attributeEvent == "mouseover"){
            console.log('Write OL5 code for feature hover in ol5_events.js: app.wrapper.events.addFeatureOverEvent()');
          }
        }
      }
    } else if (e.deselected.length > 0) {
      var layer = e.deselected[0].getLayer(app.map);
      if (layer){
        var mp_layer = layer.get('mp_layer');
        if (mp_layer && mp_layer.attributeEvent == "mouseover"){
          app.viewModel.closeAttribution();
        }
      }
    }
  });
  // OL2 Cruft below
  // //mouseover events
  // app.map.events.register("featureover", null, function(e, test) {
  //     var feature = e.feature,
  //         layerModel = e.feature.layer.layerModel;
  //
  //     if (layerModel && layerModel.attributeEvent === 'mouseover') {
  //             if (app.map.popups.length) {
  //
  //                 if ( feature.layer.getZIndex() >= app.map.currentPopupFeature.layer.getZIndex() ) {
  //                     app.map.currentPopupFeature.popup.hide();
  //                     app.map.createPopup(feature);
  //                     app.map.currentPopupFeature = feature;
  //                 } else {
  //                     app.map.createPopup(feature);
  //                     feature.popup.hide();
  //                 }
  //
  //             } else {
  //                 app.map.createPopup(feature);
  //                 app.map.currentPopupFeature = feature;
  //             }
  //     }
  //
  // });
  //
  // //mouseout events
  // app.map.events.register("featureout", null, function(e, test) {
  //     var feature = e.feature,
  //         layerModel = e.feature.layer.layerModel;
  //
  //     if (layerModel && layerModel.attributeEvent === 'mouseover') {
  //         //app.map.destroyPopup(feature);
  //         app.map.removePopup(feature.popup);
  //         if (app.map.popups.length && !app.map.anyVisiblePopups()) {
  //             var hiddenPopup = app.map.popups[app.map.popups.length-1];
  //             hiddenPopup.show();
  //             app.map.currentPopupFeature = hiddenPopup.feature;
  //         }
  //     }
};

/*
  * addFeatureOutEvent - event that fires when mouse leaves (vector?) features on map
  */
// app.wrapper.events.addFeatureOutEvent = function(){
//   // OL5 covers both mouse over and mouse out events with 'pointerMove' condition in addFeatureOverEvent function above.
// }

/**
  * registerClickLocationEvent - save location of last map click
  */
app.wrapper.events.registerClickLocationEvent = function() {
  app.map.on('click', function(evt){
    app.wrapper.map.clickLocation = ol.proj.toLonLat(evt.coordinate, 'EPSG:3857');
  });
};

/**
  * generateExtentFromPixel - from a click event, generate a duffered extent to
  *   select nearby features
  * @param {array} pixel - the coordinates of the pixel [x, y]
  * @param {integer} buffer - how many pixels to buffer in all directions
  * @see https://gis.stackexchange.com/a/217833/53225
  */
app.wrapper.events.generateExtentFromPixel = function(pixel, buffer) {
  var EXTENT_TL = app.map.getCoordinateFromPixel([pixel[0]-buffer, pixel[1]-buffer]);
  var EXTENT_BR = app.map.getCoordinateFromPixel([pixel[0]+buffer, pixel[1]+buffer]);
  var extent = ol.extent.boundingExtent([EXTENT_TL, EXTENT_BR]);
  return extent
}


/**
  * clickOnVectorLayerEvent - logic to handle when vector layer features are selected.
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
app.wrapper.events.clickOnVectorLayerEvent = function(layer, evt){
  if (!layer){
    return;
  }
  if (evt.hasOwnProperty('coordinate')) {
    var selectedFeatures = layer.getSource().getFeaturesAtCoordinate(evt.coordinate);
  } else if (evt.hasOwnProperty('mapBrowserEvent') && 'coordinate' in evt.mapBrowserEvent) {  // 'coordinate' does not exist in mapBrowserEvent's 'own' scope.
    // get all overlapping features at click, not just the selected feature
    var selectedFeatures = layer.getSource().getFeaturesAtCoordinate(evt.mapBrowserEvent.coordinate);
    if (evt.hasOwnProperty('selected')) {
      //handle point/line polys in a way that still supports selecting overlapping vector features
      selectedFeatures = jQuery.unique(selectedFeatures, evt.selected);
    }
    if (selectedFeatures.length == 0) {
      var clickPixelBuffer = 5;
      var bufferedClickExtent = app.wrapper.events.generateExtentFromPixel(evt.mapBrowserEvent.pixel_, clickPixelBuffer);
      selectedFeatures = layer.getSource().getFeaturesInExtent(bufferedClickExtent);
    }
  } else if (evt.hasOwnProperty('selected')) {
    var selectedFeatures = evt.selected;
  } else {
    var selectedFeatures = [];
  }
  var mp_layer = layer.get('mp_layer');
  if (selectedFeatures.length > 0){
    var featureData = [];
    for (var i = 0; i < selectedFeatures.length; i++) {
      var feature = selectedFeatures[i];
      var geom = feature.getGeometry();
      if (!bufferedClickExtent || bufferedClickExtent.length == 0 ||geom.intersectsExtent(bufferedClickExtent)){
        if (mp_layer.isDrawingModel) {
          feature_values = {}
          for (var j = 0; j < mp_layer.scenarioModel.scenarioAttributes.length; j++) {
              var report_value = mp_layer.scenarioModel.scenarioAttributes[j];
              feature_values[report_value.title] = report_value.data;
          }
          featureData.push(feature_values);
        } else {
          featureData.push(feature.values_);
        }
      }
    }
    app.wrapper.events.generateAttributeReport(mp_layer, featureData);
  }
};


/**
  * clickOnUTFGridLayerEvent - attempt to pull ID data from UTF grid and populate attribute report
  * @param {object} layer - the clicked OpenLayers UTF-enabled layer object.
  * @param {object} evt - the OpenLayers click event
  */
app.wrapper.events.clickOnUTFGridLayerEvent = function(layer, evt){
  var mp_layer = layer.get('mp_layer');
  var utfgrid = mp_layer.utfgrid;
  var gridSource = utfgrid.getSource();
  var viewResolution = /** @type {number} */ (app.map.getView().getResolution());
  var coordinate = evt.coordinate;
  gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
    function(data) {
      app.wrapper.events.generateAttributeReport(mp_layer, [data]);
    });
};

/**
  * clickOnWMSLayerEvent - attempt to pull ID data from UTF grid and populate attribute report
  * @param {object} layer - the clicked OpenLayers WMS layer object.
  * @param {object} evt - the OpenLayers click event
  */
app.wrapper.events.clickOnWMSLayerEvent = function(layer, evt){
  var mp_layer = layer.get('mp_layer');
  if (mp_layer.hasOwnProperty('wms_info') && mp_layer.wms_info) {
    var wmsSource = layer.getSource();
    var view = app.map.getView();
    var viewResolution = view.getResolution();
    var viewProjection = view.projection_.code_;
    let getFeatureInfoUrl = wmsSource.getFeatureInfoUrl( evt.coordinate,
      viewResolution, viewProjection,
      {
        'INFO_FORMAT': mp_layer.wms_info_format,
        'QUERY_LAYERS': mp_layer.wms_slug,
        'LAYERS': mp_layer.wms_slug
      }
    );
    if (layer.proxy_url) {
      // RDH 2022-06-07: This would be bad: proxying a proxy (queryWMSFeatureInfo will likely proxy this)
      // So, let's be sure to enforce only a single layer of proxy and make it easy to parse:
      let url_split = layer.url.split(encodeURLComponent('?'));
      let report_querystring = getFeatureInfoUrl.split('&proxy_params=true')[1];
      url_split[0] = url_split[0] + encodeURLComponent('?') + encodeURIComponent(report_querystring);
      getFeatureInfoUrl = url_split.join('');
    }
    app.wrapper.events.queryWMSFeatureInfo(mp_layer, getFeatureInfoUrl);
  }
};

/**
  * reportGMLAttributes - given a GML response to a GetFeatureInfo query,
  *     attempt to populate the attribute report with something useful (or punt).
  * @param {object} mp_layer - the mp_layer the report is for
  * @param {list} getFeatureInfoUrl - the formatted WMS query URL
  */
app.wrapper.events.reportGMLAttributes = function(mp_layer, data) {
  var reported = false;
  try{
    var gml_format = new ol.format.GML3();
    var responses = gml_format.readFeatures(data, {});
    console.log(data);
    // TODO: Actually get attributes of feature(s) and report attributes
    // reported = true;
  } catch (error) {
    console.log(error);
    var responses = [];
  }
  return reported;
};

app.wrapper.events.tileSources = [
  'XYZ',
  'ArcRest',
  'WMS',
];

app.wrapper.events.imageSources = [];
app.wrapper.events.vectorSources = [
  'Vector',
  'VectorTile',
  'ArcFeatureServer',
];

/**
  * layerLoadStart - 'layer loading' event to be added to layerModels
  * @param {object} layerModel - the layerModel to add layer loading logic to
  */
app.wrapper.events.layerLoadStart = function(layerModel) {
  layerModel.loadStatus('loading');
  if (layerModel.hasOwnProperty('parent') && layerModel.parent) {
    layerModel.parent.loadStatus('loading');
  }
}

/**
  * addLayerLoadStart - apply 'layer loading' event to layerModel
  * @param {object} layerModel - the layerModel to add layer loading logic to
  */
app.wrapper.events.addLayerLoadStart = function(layerModel) {
  if (layerModel.hasOwnProperty('url') && layerModel.url && layerModel.url.length > 0 && layerModel.type.toLowerCase() != 'placeholder') {
    if (app.wrapper.events.tileSources.indexOf(layerModel.type) >= 0) {
      layerModel.layer.getSource().on('tileloadstart', function() {
        app.wrapper.events.layerLoadStart(layerModel);
      });
    }
    if (app.wrapper.events.imageSources.indexOf(layerModel.type) >= 0) {
      layerModel.layer.getSource().on('imageloadstart', function() {
        app.wrapper.events.layerLoadStart(layerModel);
      });
    }
    if (app.wrapper.events.vectorSources.indexOf(layerModel.type) >= 0) {
      layerModel.layer.on('prerender', function() {
        app.wrapper.events.layerLoadStart(layerModel);
      });
    }
  }
}

/**
  * layerLoadEnd - the 'layer loaded' event to be added to layerModels
  * @param {object} layerModel - the layerModel to add layer loaded logic to
  */
app.wrapper.events.layerLoadEnd = function(layerModel) {
  layerModel.loadStatus(false);
  if (layerModel.hasOwnProperty('parent') && layerModel.parent) {
    layerModel.parent.loadStatus(false);
  }
}

/**
  * addLayerLoadEnd - apply 'layer loaded' event to layerModel
  * @param {object} layerModel - the layerModel to add layer loaded logic to
  */
app.wrapper.events.addLayerLoadEnd = function(layerModel) {
  if (app.wrapper.events.tileSources.indexOf(layerModel.type) >= 0) {
    layerModel.layer.getSource().on('tileloadend', function() {
      app.wrapper.events.layerLoadEnd(layerModel);
    });
  }
  if (app.wrapper.events.imageSources.indexOf(layerModel.type) >= 0) {
    layerModel.layer.getSource().on('imageloadend', function() {
      app.wrapper.events.layerLoadEnd(layerModel);
    });
  }
  if (app.wrapper.events.vectorSources.indexOf(layerModel.type) >= 0) {
    layerModel.layer.on('postrender', function() {
      app.wrapper.events.layerLoadEnd(layerModel);
    });
  }
}

/**
  * layerLoadError - the 'layer loading error' event to add to layerModels
  * @param {object} layerModel - the layerModel to add layer loading error logic to
  */
app.wrapper.events.layerLoadError = function(layerModel) {
  if (layerModel.loadStatus()) {
    layerModel.loadStatus('error');
    if (layerModel.hasOwnProperty('parent') && layerModel.parent) {
      layerModel.parent.loadStatus('error');
    }
  }
}

/**
  * addLayerLoadError - apply 'layer loading error' event to layerModel
  * @param {object} layerModel - the layerModel to add layer loading error logic to
  */
app.wrapper.events.addLayerLoadError = function(layerModel) {
  if (app.wrapper.events.tileSources.indexOf(layerModel.type) >= 0) {
    layerModel.layer.getSource().on('tileloaderror', function() {
      app.wrapper.events.layerLoadError(layerModel);
    });
  }
  if (app.wrapper.events.imageSources.indexOf(layerModel.type) >= 0 && !layerModel.is_multilayer_parent()) {
    layerModel.layer.getSource().on('imageloaderror', function() {
      app.wrapper.events.layerLoadError(layerModel);
    });
  }
}

app.wrapper.events.cleanupDrawing = function() {
  if (app.viewModel.scenarios.drawingFormModel.hasOwnProperty('draw')) {
    app.map.removeInteraction(app.viewModel.scenarios.drawingFormModel.draw);
  }

  if (app.viewModel.scenarios.drawingFormModel.hasOwnProperty('edit')) {
    app.map.removeInteraction(app.viewModel.scenarios.drawingFormModel.edit);
  }

  app.map.removeLayer(app.map.drawingLayer);
  app.wrapper.controls.enableDoubleClickZoom();
}

app.wrapper.events.formatAttributeReportValue = function(value) {
  // TODO: implement comma-formatted large numbers when appropriate
  // report_attr.data = app.utils.numberWithCommas(report_attr.data);
  if (value && value.hasOwnProperty('precision') && value.precision != null) {
    return report_attr.data.toFixed(value.precision);
  } else {
    // format common data types:
    if (typeof(value) == "string") {
      // URLs:
      if (value.indexOf('http') == 0) {
        return '<a href="' + value + '" target="_blank">' + value + "</a>";
      }
    }
  }
  return value;
}

/**
  * formatAttributeReportEntry - given id response data and a layer, format it for display in attributes window
  * returns a list of formatted Attribute Objects.
  * @param {object} feature - the data returned by the identification request
  * @param {object} mp_layer - the Marine Planner formatted layer object.
  */
app.wrapper.events.formatAttributeReportEntry = function(feature, mp_layer) {
  var attributeObjs = [];
  try {
    if (feature instanceof HTMLElement) {
      attributeObjs.push({
        'display': null,
        'data': feature
      });
      return attributeObjs;
    }
  } catch (error) { /*do nothing*/  }

  if (Array.isArray(feature)) {
    // legacy case supports tabbed attrs
    return feature;
  }

  var attr_keys = Object.keys(feature);
  var attr_fields = mp_layer.attributes;
  var report_attributes = {};
  for (var i = 0; i < attr_fields.length; i++) {
    report_attributes[attr_fields[i].field] = {
      display: attr_fields[i].display,
      // mp_layer.attributes is ordered by 'order' on the server side. We can derive effective order from the list's own order
      order: i,
      precision: attr_fields[i].precision
    };
  }
  var report_keys = Object.keys(report_attributes);

  for (var j = 0; j < attr_keys.length; j++) {
    var key = attr_keys[j];
    if (report_keys.length == 0){
      attributeObjs.push({
        'display': key,
        'data': app.wrapper.events.formatAttributeReportValue(feature[key])
      });
    } else if(report_keys.indexOf(key) >= 0) {
      var report_attr = {
        'display': report_attributes[key].display,
        'data': app.wrapper.events.formatAttributeReportValue(feature[key]),
        'order': report_attributes[key].order
      };
      attributeObjs.push(report_attr);
      attributeObjs.sort(function(a,b){ return a.order - b.order;});
    }
  }
  return attributeObjs;
};
