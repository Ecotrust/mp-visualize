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
        if (layer){
          var mp_layer = layer.get('mp_layer');
          if (mp_layer.attributeEvent == "click"){
            if (app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
              app.wrapper.events.clickOnVectorLayerEvent();
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
  var selectedFeatures = layer.getSource().getFeaturesAtCoordinate(evt.coordinate);
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
    var getFeatureInfoUrl = wmsSource.getGetFeatureInfoUrl( evt.coordinate,
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
  * parseGMLFeatureInfoResponse - given a GML response to a GetFeatureInfo query,
  *     attempt to populate the attribute report with something useful (or punt).
  * @param {object} mp_layer - the mp_layer the report is for
  * @param {list} getFeatureInfoUrl - the formatted WMS query URL
  */
app.wrapper.events.parseGMLFeatureInfoResponse = function(mp_layer, data) {
  if (data.length > 0) {
    try{
      var gml_format = new ol.format.GML3();
      var responses = gml_format.readFeatures(data, {});
      console.log(data);
    } catch (error) {
      console.log(error);
      var responses = [];
    }
    if (responses.length < 1) {
      try{
        var xml_data = $.parseXML(data);
        var nodeData = {};
        var ignoreTags = [
          'gml:boundedBy',
          'gml:Box',
          'gml:coordinates'
        ]
        for (var i = 0; i < xml_data.all.length; i++) {
          var node = xml_data.all[i];
          var anticipated_prefixes = [
            'gml:',
            'geonode:'
          ]
          for (var prefix_idx = 0; prefix_idx < anticipated_prefixes.length; prefix_idx++) {
            var prefix = anticipated_prefixes[prefix_idx];
            if (node.children.length == 0 && node.tagName.indexOf(prefix) >= 0 && ignoreTags.indexOf(node.tagName) < 0) {
              var nodeNameList = node.tagName.split(prefix);
              var nodeName = nodeNameList[nodeNameList.length-1];
              nodeData[node.tagName.split(prefix)[1]] = node.textContent;
            }
          }
        }
        app.wrapper.events.generateAttributeReport(mp_layer, [nodeData]);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return;
}
