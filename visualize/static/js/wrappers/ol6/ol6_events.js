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
  var selectClick = new ol.interaction.Select();
  app.map.addInteraction(selectClick);
  selectClick.on('select', function(e) {
    if (e.selected.length > 0) {
      for (var i = 0; i < e.selected.length; i++) {
        var layer = e.selected[0].getLayer(app.map);
        if (!layer){
          // This seems to work for VectorTile layers
          layer = app.viewModel.getLayerByOLId(e.target.getLayer(e.selected[0]).ol_uid).layer;
        }
        if (layer){
          var mp_layer = layer.get('mp_layer');
          if (mp_layer.attributeEvent == "click"){
            if (app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
              app.wrapper.events.clickOnVectorLayerEvent(layer, e);
            }
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
    condition: ol.events.condition.pointerMove
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
      featureData.push(feature.values_);
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
    var getFeatureInfoUrl = wmsSource.getFeatureInfoUrl( evt.coordinate,
      viewResolution, viewProjection,
      {
        'INFO_FORMAT': mp_layer.wms_info_format,
        'QUERY_LAYERS': mp_layer.wms_slug,
        'LAYERS': mp_layer.wms_slug
      }
    );
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
  if (layerModel.layer.hasOwnProperty('url') && layerModel.layer.url && layerModel.layer.url.length > 0 && layerModel.type.toLowerCase() != 'placeholder') {
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
