app.wrapper.controls = {};
(function(){
/**
LayerLoadProgress - Control that attempts to compute layer loading progress
for tiled layers. Basically, it counts the number of loading tiles in every
layer (according to OL), then produces a percentage based on the maximum number
of tiles there are (based on previous calculations).

SRH 12-Sep-2014
 */

// var LayerLoadProgress = OpenLayers.Class(OpenLayers.Control, {
//     CLASS_NAME: "LayerLoadProgress",
//     autoActivate: true, // OL will call activate()
//     element: null,
//     maxTiles: 1,
//     loadingStr: 'Loading … {PERCENT}',
//     finishedLoadingStr: '&nbsp;',
//     counterRunning: false,
//     isLoading: false,
//     /* Callback - notify caller that loading is in progress
//        Parameters:
//            cur - current number loaded
//            max - maximum number to load (guessed)
//            percentStr - a string that replaces {PERCENT} with the current
//                         percentage loaded as an integer+% from 1%-100%, or
//                         the string "waiting" if loading has started by no tiles
//                         have been received yet. */
//     onLoading: function(cur, max, percentStr) {},
//     /* Callback - used to notify caller that loading has started */
//     onStartLoading: function() {},
//     /* Callback - used to notify caller that loading has finished */
//     onFinishLoading: function() {},
//
//     initialize: function(options) {
//         OpenLayers.Control.prototype.initialize.apply(this, arguments);
//
//         // TODO: This is a hack waiting for a style guide that tells us where
//         // the message should go .
//         if (!this.element) {
//             var styles = {
//                 position: 'absolute',
//                 bottom: '10%',
//                 left: '50%',
//                 'margin-left': '-128px',
//                 height: '50px',
//                 width: '224px',
//                 padding: '8px',
//                 overflow: 'hidden',
//                 border: '8px solid #fff',
//                 'border-radius': '16px',
//                 'background-color': 'rgba(255,255,255, 0.75)',
//                 color: 'black',
//                 opacity: '0.75',
//                 'text-align': 'center',
//                 'z-index': 1000
//             }
//             this.element = $('<div id="__msg"></div>').css(styles);
//             $('body').append(this.element);
//         }
//
//     },
//     activate: function() {
//         if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
//             this.map.events.register('move', this,
//                 this.startCountingLoadingTiles);
//             return true;
//         }
//         else {
//             return false;
//         }
//     },
//     deactivate: function() {
//         if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
//             this.map.events.unregister('move', this,
//                 this.startCountingLoadingTiles);
//             return true;
//         }
//         else {
//             return false;
//         }
//     },
//     getNumLoadingTiles: function() {
//         var sum = 0;
//         for (var i = 0; i < this.map.layers.length; i++) {
//             // only grid layers have 'numLoadingTiles'
//             if (typeof(this.map.layers[i].numLoadingTiles) != "undefined") {
//                 sum += this.map.layers[i].numLoadingTiles;
//             }
//         }
//         return sum;
//     },
//
//     startCountingLoadingTiles: function() {
//         if (this.counterRunning) {
//             return;
//         }
//
//         this.countLoadingTiles();
//     },
//
//     countLoadingTiles: function() {
//         var percentStr = '';
//         var num = this.getNumLoadingTiles();
//
//         if (!this.isLoading && num > 0) {
//             this.isLoading = true;
//             this.onStartLoading();
//         }
//
//
//         // we auto adjust the max up (for example, when new layers are shown)
//         // but don't know how to auto adjust down yet. Maybe we can ask
//         // OpenLayers how many tiles there are in all the layers?
//         if (num > this.maxTiles) {
//             this.maxTiles = num;
//         }
//
//         var percent = (100 * (1 - num / this.maxTiles)).toFixed(0);
//         if (percent == "0") {
//             percent = "waiting"
//         }
//         else {
//             percent = percent + '%';
//         }
//
//         if (num > 0) {
//             this.counterRunning = setTimeout(this.countLoadingTiles.bind(this),
//                                              50);
//             percentStr = this.loadingStr.replace('{PERCENT}', percent);
//
//             this.onLoading(num, this.maxTiles, percentStr);
//             if (this.element) {
//                 this.element.html(percentStr);
//             }
//         }
//         else {
//             this.counterRunning = false;
//             percentStr = 'Loaded';
//
//             this.isLoading = false;
//
//             this.onFinishLoading();
//             if (this.element) {
//                 this.element.html(this.finishedLoadingStr);
//             }
//         }
//     }
// });

window['P97'] = window.P97 || {};
window['P97']['Controls'] = window.P97.Controls || {};
// window['P97']['Controls']['LayerLoadProgress'] = LayerLoadProgress;

})();

// RDH - It's best for the MANY controls (scale, mouse position, etc..)
//    to be added at map instantiation, so this has been moved into ol5_wrapper.js

/*
  * app.wrapper.controls.addSwitcher - add a layer switcher control to the map (used for base layers)
  *@param {null} none
  */
// app.wrapper.controls.addSwitcher() {};

/*
  * app.wrapper.controls.addScale - add a scale bar to the map
  *@param {null} none
  */
// app.wrapper.controls.addScale() {
// };

/*
  * app.wrapper.controls.addZoomBox - enable users to drag with shift to zoom to a bbox extent
  *@param {null} none
  */
//RDH: OL5 enables this by default
// app.wrapper.controls.addZoomBox = function(){};

/**
  * app.wrapper.controls.addMousePosition - add control for displaying mouse position as coords on map
  */
app.wrapper.controls.addMousePosition = function() {
  $('#map').mouseenter(function() {
    $('.olControlMousePosition').show();
  });
  $('#map').mouseout(function() {
    $('.olControlMousePosition').hide();
  })
};

/**
  * addUTFControl - add control for handling UTFGrid layers
  */
app.wrapper.controls.addUTFControl = function(){
  // This is not needed for OL5.
}

// app.wrapper.controls.addUTFGrid = function(){
//   // // RDH -- The below code is from OL2
//   // //UTF Attribution
//   // app.map.UTFControl = new OpenLayers.Control.UTFGrid({
//   //   //attributes: layer.attributes,
//   //   layers: [],
//   //   //events: {fallThrough: true},
//   //   handlerMode: 'click',
//   //   callback: function(infoLookup, lonlat, xy) {
//   //     app.map.utfGridClickHandling(infoLookup, lonlat, xy);
//   //   }
//   // });
//   // map.addControl(app.map.UTFControl);
// }

// app.map.utfGridClickHandling = function(infoLookup, lonlat, xy) {
//     var clickAttributes = {};
//
//     for (var idx in infoLookup) {
//         $.each(app.viewModel.visibleLayers(), function (layer_index, potential_layer) {
//           if (potential_layer.type !== 'Vector') {
//             var new_attributes,
//                 info = infoLookup[idx];
//             //debugger;
//             if (info && info.data) {
//                 var newmsg = '',
//                     hasAllAttributes = true,
//                     parentHasAllAttributes = false;
//                 // if info.data has all the attributes we're looking for
//                 // we'll accept this layer as the attribution layer
//                 //if ( ! potential_layer.attributes.length ) {
//                 if (potential_layer.attributes.length) {
//                     hasAllAttributes = true;
//                 } else {
//                     hasAllAttributes = false;
//                 }
//                 //}
//                 $.each(potential_layer.attributes, function (attr_index, attr_obj) {
//                     if ( !(attr_obj.field in info.data) ) {
//                         hasAllAttributes = false;
//                     }
//                 });
//                 if ( !hasAllAttributes && potential_layer.parent) {
//                     parentHasAllAttributes = true;
//                     if ( ! potential_layer.parent.attributes.length ) {
//                         parentHasAllAttributes = false;
//                     }
//                     $.each(potential_layer.parent.attributes, function (attr_index, attr_obj) {
//                         if ( !(attr_obj.field in info.data) ) {
//                             parentHasAllAttributes = false;
//                         }
//                     });
//                 }
//                 if (hasAllAttributes) {
//                     new_attributes = potential_layer.attributes;
//                 } else if (parentHasAllAttributes) {
//                     new_attributes = potential_layer.parent.attributes;
//                 }
//
//                 if (new_attributes) {
//                     var attribute_objs = [];
//                     $.each(new_attributes, function(index, obj) {
//                         if ( potential_layer.compress_attributes ) {
//                             var display = obj.display + ': ' + info.data[obj.field];
//                             attribute_objs.push({'display': display, 'data': ''});
//                         } else {
//                             /*** SPECIAL CASE FOR ENDANGERED WHALE DATA ***/
//                             var value = info.data[obj.field];
//                             if (value === 999999) {
//                                 attribute_objs.push({'display': obj.display, 'data': 'No Survey Effort'});
//                             } else {
//                                 try {
//                                     //set the precision and add any necessary commas
//                                     value = value.toFixed(obj.precision);
//                                     value = app.utils.numberWithCommas(value);
//                                 }
//                                 catch (e) {
//                                     //keep on keeping on
//                                 }
//                                 attribute_objs.push({'display': obj.display, 'data': value});
//                             }
//                         }
//                     });
//                     var title = potential_layer.featureAttributionName,
//                         text = attribute_objs;
//                     if ( potential_layer.name === 'OCS Lease Blocks' ) {
//                         text = app.viewModel.getOCSAttributes(info.data);
//                     } else if ( potential_layer.name === 'Sea Turtles' ) {
//                         text = app.viewModel.getSeaTurtleAttributes(info.data);
//                     } else if ( potential_layer.name === 'Toothed Mammals (All Seasons)' ) {
//                         text = app.viewModel.getToothedMammalAttributes(info.data);
//                     } else if ( potential_layer.name === 'Wind Speed' ) {
//                         text = app.viewModel.getWindSpeedAttributes(info.data);
//                     } else if ( potential_layer.name === 'BOEM Wind Planning Areas' ) {
//                         text = app.viewModel.getWindPlanningAreaAttributes(info.data);
//                     } else if ( potential_layer.name === 'Party & Charter Boat' ) {
//                         text = app.viewModel.adjustPartyCharterAttributes(attribute_objs);
//                     } else if ( potential_layer.name === 'Port Commodity (Points)' ) {
//                         text = app.viewModel.getPortCommodityAttributes(info.data);
//                     } else if ( potential_layer.name === 'Port Commodity' ) {
//                         text = app.viewModel.getPortCommodityAttributes(info.data);
//                     } else if ( potential_layer.name === 'Port Ownership (Points)' ) {
//                         text = app.viewModel.getPortOwnershipAttributes(info.data);
//                     } else if ( potential_layer.name === 'Port Ownership' ) {
//                         text = app.viewModel.getPortOwnershipAttributes(info.data);
//                     } else if ( potential_layer.name === 'Maintained Channels') {
//                         text = app.viewModel.getChannelAttributes(info.data);
//                     } else if ( potential_layer.name === 'Essential Fish Habitats') {
//                         text = app.viewModel.getEFHAttributes(info.data);
//                     } else if ( title === 'Benthic Habitats (North)' || title === 'Benthic Habitats (South)' ) {
//                         title = 'Benthic Habitats';
//                     }
//                     clickAttributes[title] = [{
//                         'name': 'Feature',
//                         'id': potential_layer.featureAttributionName + '-0',
//                         'attributes': text
//                     }];
//                     //app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
//                 }
//             }
//           }
//         });
//
//         $.extend(app.wrapper.map.clickOutput.attributes, clickAttributes);
//         app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
//
//     }
//     app.viewModel.updateMarker(lonlat);
//     //app.marker.display(true);
//
// }; //end utfGridClickHandling

// RDH 20190719 - click events only seem to hit the map in ol5. Handling via a massive map-level click handler.
/*
  * addArcIdentifyControl - map control to trigger and handle 'identify' actions on ArcREST layers
  * @param {object} layer - the mp layer object.
  */
// app.wrapper.controls.addArcIdentifyControl = function(layer, identifyUrl) {
// };

app.wrapper.controls.completeSketch = function() {
  app.map.addInteraction(app.map.interactions.selectClick);
  app.viewModel.enableFeatureAttribution();
  app.map.removeInteraction(app.viewModel.scenarios.drawingFormModel.draw);
  app.viewModel.scenarios.drawingFormModel.isDrawing(false);
  app.wrapper.controls.enableDoubleClickZoom();
}

app.wrapper.controls.startSketch = function() {
    var drawingForm = app.viewModel.scenarios.drawingFormModel;
    var features = app.map.drawingLayer.getSource().getFeatures();
    if (features.length > 0 && features[0].geometry instanceof ol.geom.Polygon) {
      app.wrapper.controls.consolidatePolygonLayerFeatures();
    }
    drawingForm.isDrawing(true);
    return drawingForm;
};

app.wrapper.controls.addSketchInteraction = function(drawingForm) {
    app.map.addInteraction(drawingForm.draw);
    //disable feature attribution
    app.viewModel.disableFeatureAttribution();
    app.map.removeInteraction(app.map.interactions.selectClick);
    drawingForm.draw.on('drawend',function() {
      app.wrapper.controls.completeSketch();
      app.viewModel.scenarios.drawingFormModel.showEdit(true);
      app.viewModel.scenarios.drawingFormModel.hasShape(true);
      setTimeout(function() {
        app.wrapper.controls.consolidatePolygonLayerFeatures();
      }, 100);
    });
    drawingForm.draw.on('drawabort', app.wrapper.controls.completeSketch);
    app.wrapper.controls.disableDoubleClickZoom();
};

app.wrapper.controls.startPolygonSketch = function() {
    drawingForm=app.wrapper.controls.startSketch();
    drawingForm.sketchMode('polygon');
    //activate the draw feature control
    drawingForm.draw = new ol.interaction.Draw({
      source: app.map.drawingLayer.getSource(),
      type: 'Polygon'
    });
    app.wrapper.controls.addSketchInteraction(drawingForm);
};

app.wrapper.controls.startLineSketch = function() {
  drawingForm=app.wrapper.controls.startSketch();
  drawingForm.sketchMode('line');
  //activate the draw feature control
  drawingForm.draw = new ol.interaction.Draw({
    source: app.map.drawingLayer.getSource(),
    type: 'LineString'
  });
  app.wrapper.controls.addSketchInteraction(drawingForm);
}

app.wrapper.controls.startPointSketch = function() {
  drawingForm=app.wrapper.controls.startSketch();
  drawingForm.sketchMode('point');
  //activate the draw feature control
  drawingForm.draw = new ol.interaction.Draw({
    source: app.map.drawingLayer.getSource(),
    type: 'Point'
  });
  app.wrapper.controls.addSketchInteraction(drawingForm);
};

app.wrapper.controls.consolidatePolygonLayerFeatures = function(layer){
  var featureList = app.map.drawingLayer.getSource().getFeatures();
  var multigeometry = new ol.geom.GeometryCollection([]);
  var in_geometries = [];
  for (var i = 0; i < featureList.length; i++) {
    var feat = featureList[i].getGeometry();
    if (feat instanceof ol.geom.Polygon || feat instanceof ol.geom.LineString || feat instanceof ol.geom.Point) {
      in_geometries.push(feat);
    } else if (feat instanceof ol.geom.MultiPolygon){
      var polygons = feat.getPolygons();
      for (var j = 0; j < polygons.length; j++) {
        in_geometries.push(polygons[j]);
      }
    } else if (feat instanceof ol.geom.GeometryCollection){
      var geometries = feat.getGeometries();
      for (var j = 0; j < geometries.length; j++) {
        in_geometries.push(geometries[j]);
      }
    } else {
      console.log('feature type is not yet supported');
      alert('Unable to add feature to the drawings.');
    }
  }
  multigeometry.setGeometries(in_geometries);
  app.map.drawingLayer.getSource().clear();
  multigeometry_feature = new ol.Feature({geometry: multigeometry});
  setTimeout(function() {
    app.map.drawingLayer.getSource().addFeature(multigeometry_feature);
  }, 300);
};

app.wrapper.controls.setDoublClickZoomInteraction = function() {
  app.map.getInteractions().getArray().forEach(function(interaction) {
    if (interaction instanceof ol.interaction.DoubleClickZoom) {
      app.map.controls.dblClickInteraction = interaction;
    }
  });
};

app.wrapper.controls.enableDoubleClickZoom = function() {
  if (!app.map.controls.hasOwnProperty('dblClickInteraction')){
    app.wrapper.controls.setDoublClickZoomInteraction();
  }
  setTimeout(function() {
    app.map.addInteraction(app.map.controls.dblClickInteraction);
  }, 300);
};

app.wrapper.controls.disableDoubleClickZoom = function() {
  if (!app.map.controls.hasOwnProperty('dblClickInteraction')){
    app.wrapper.controls.setDoublClickZoomInteraction();
  }
  app.map.removeInteraction(app.map.controls.dblClickInteraction);
};

app.wrapper.controls.startEdit = function() {
  var drawingForm = app.viewModel.scenarios.drawingFormModel;
  // activate the modify feature control
  drawingForm.edit = new ol.interaction.Modify({
    source: app.map.drawingLayer.getSource()
  });
  // drawingForm.edit.on('modifyend', app.completeEdit);
  app.map.addInteraction(drawingForm.edit);
}

app.wrapper.controls.completeEdit = function() {
  var drawingForm = app.viewModel.scenarios.drawingFormModel;
  app.map.removeInteraction(drawingForm.edit);
};

app.wrapper.controls.getAttributionState = function() {
  if ($('.ol-attribution').hasClass('ol-collapsed')) {
    return 'hide';
  } else {
    return 'show';
  }
}

app.wrapper.controls.setAttributionState = function(state) {
  if (state == 'hide') {
    $('.ol-attribution').addClass('ol-collapsed')
  } else {
    $('.ol-attribution').removeClass('ol-collapsed')
  }
}

/** Measurement contols
  *   A cross between the old measurement logic and the OL demo here:
  *   https://openlayers.org/en/latest/examples/measure.html
*/

app.wrapper.controls.measurementFeature = false;

app.wrapper.controls.getFixedLengthHelper = function(rawNumber) {
  if (rawNumber < 19) {
    var to_fixed_digits = 2;
  } else if (rawNumber > 187 ) {
    var to_fixed_digits = 0;
  } else {
    var to_fixed_digits = 1;
  }
  return rawNumber.toFixed(to_fixed_digits);
}

app.wrapper.controls.humanizeNumber = function(rawNumber) {
  var num = app.wrapper.controls.getFixedLengthHelper(rawNumber);
  if (num >= 1000) {
    var numString = num.toString();
    var humanNumStringList = [];
    var comma_index = (numString.length-1) % 3;
    for (var i = 0; i < numString.length; i++){
      humanNumStringList.push(numString[i]);
      if (i == comma_index && i < (numString.length-1) ) {
        humanNumStringList.push(',');
        comma_index += 3;
      }
    }
    return humanNumStringList.join('');
  } else {
    return num;
  }

}

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
app.wrapper.controls.formatLength = function (line) {
  var meters = ol.sphere.getLength(line);
  var naut_miles = meters/1852;
  var measures = [];
  if (meters > 750) {
    var kilometers = meters / 1000;
    var miles = kilometers/1.609344;
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(miles) + '</td><td>mi</td>');
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(kilometers) + '</td><td>km</td>');
  } else {
    var feet = meters*3.28084;
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(feet) + '</td><td>ft</td>');
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(meters) + '</td><td>m</td>');
  }
  measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(naut_miles) + '</td><td>Naut. mi</td>');
  var output = "<table><tr><th>Measure:&nbsp;</th>" + measures.join('</tr><tr><td></td>') + '</tr></table>';
  return output;
};

/**
 * Format area output.
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
app.wrapper.controls.formatArea = function (polygon) {
  var sq_meters = ol.sphere.getArea(polygon);
  var acres = sq_meters * 0.000247105;
  var measures = [];
  if (sq_meters > 10000) {
    var sq_km = sq_meters / 1000000;
    var sq_mi = sq_meters * 0.0000003861;
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(sq_mi) + '</td><td>mi<sup>2</sup></td>');
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(sq_km) + '</td><td>km<sup>2</sup></td>');
  } else {
    var sq_feet = sq_meters*10.7639;
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(sq_feet) + '</td><td>ft<sup>2</sup></td>');
    measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(sq_meters) + '</td><td>m<sup>2</sup></td>');
  }
  measures.push('<td class="val">' + app.wrapper.controls.humanizeNumber(acres) + '</td><td>acres</td>');
  var output = "<table><tr><th>Measure:&nbsp;</th>" + measures.join('</tr><tr><td></td>') + '</tr></table>';
  return output;
};

app.wrapper.controls.updateMeasurementText = function(event) {
  var geom = event.target;
  if (!(geom instanceof ol.geom.Polygon || geom instanceof ol.geom.LineString)) {
    // For the event type passed by drawEnd
    geom = event.feature.getGeometry();
  }
  var output;
  if (geom instanceof ol.geom.Polygon) {
    output = app.wrapper.controls.formatArea(geom);
  } else if (geom instanceof ol.geom.LineString) {
    output = app.wrapper.controls.formatLength(geom);
  }
  var element = document.getElementById('measurement-output');
  if (output) {
    element.innerHTML = output;
  } else {
    element.innerHTML = "";
  }

}

// app.wrapper.controls.startLinearMeasurement = function(event) {
//     app.wrapper.controls.measurementFeature = event.feature;
//     app.wrapper.controls.measurementListener = app.wrapper.controls.measurementFeature.getGeometry().on('change', app.wrapper.controls.updateMeasurementText)
// }

// Not sure why this function was written twice - overloading did not seem to work
// However, later let's get that update logic from the other function (above) working
// in this function. RDH 2/2/2021
app.wrapper.controls.startLinearMeasurement = function() {
  app.wrapper.controls.clearAreaMeasurement();
  if (!app.wrapper.controls.linearMeasurementControl) {
    app.wrapper.controls.createLinearControl();
  } else {
    app.wrapper.controls.linearMeasurementControl.setActive(true);
  }

  // Clear features from Measurement layer!
  app.map.measurementLayer.getSource().clear();

  // Activate drawing (linestring)
  app.map.addInteraction(app.wrapper.controls.linearMeasurementControl);

  $('#measurement-display h3').html('Linear Measurement');
  $('#measurement-display').show();
  // change $('#linear-measurement-button') to work as cancel/clear
  $('#linear-measurement i').removeClass('fa-ruler-vertical');
  $('#linear-measurement i').addClass('fa-times');
}

app.wrapper.controls.createLinearControl = function() {
  app.wrapper.controls.linearMeasurementControl = new ol.interaction.Draw({
    source: app.map.measurementLayer.getSource(),
    type: 'LineString',
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

  app.wrapper.controls.linearMeasurementControl.on('drawstart', app.wrapper.controls.startLinearMeasurement);
  app.wrapper.controls.linearMeasurementControl.on('drawend', function(event) {
    app.wrapper.controls.updateMeasurementText(event);
    ol.Observable.unByKey(app.wrapper.controls.measurementListener);
  });
}

app.wrapper.controls.clearLinearMeasurement = function() {
  $('#measurement-display').hide();
  $('#measurement-output').html('');
  if(app.wrapper.controls.linearMeasurementControl){
    app.wrapper.controls.linearMeasurementControl.setActive(false);
  }
  app.wrapper.controls.measurementFeature = false;
  app.map.measurementLayer.getSource().clear();
  $('#linear-measurement i').removeClass('fa-times');
  $('#linear-measurement i').addClass('fa-ruler-vertical');
}

app.wrapper.controls.startAreaMeasurement = function() {
  app.wrapper.controls.clearLinearMeasurement();
  if (!app.wrapper.controls.areaMeasurementControl) {
    app.wrapper.controls.createAreaMeasurementControl();
  } else {
    app.wrapper.controls.areaMeasurementControl.setActive(true);
  }

  // Clear features from Measurement layer!
  app.map.measurementLayer.getSource().clear();

  // Activate drawing (Polygon)
  app.map.addInteraction(app.wrapper.controls.areaMeasurementControl);
  $('#measurement-display h3').html('Area Measurement');
  $('#measurement-display').show();
  // change $('#area-measurement') to work as cancel/clear button
  $('#area-measurement i').removeClass('fa-ruler-combined');
  $('#area-measurement i').addClass('fa-times');
}

app.wrapper.controls.createAreaMeasurementControl = function() {
  app.wrapper.controls.areaMeasurementControl = new ol.interaction.Draw({
    source: app.map.measurementLayer.getSource(),
    type: 'Polygon',
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

  app.wrapper.controls.areaMeasurementControl.on('drawstart', app.wrapper.controls.startAreaMeasurement);
  app.wrapper.controls.areaMeasurementControl.on('drawend', function(event) {
    app.wrapper.controls.updateMeasurementText(event);
    ol.Observable.unByKey(app.wrapper.controls.areaMeasurementListener);
  });
}


app.wrapper.controls.clearAreaMeasurement = function() {
  $('#measurement-display').hide();
  $('#measurement-output').html('');
  if(app.wrapper.controls.areaMeasurementControl) {
    app.wrapper.controls.areaMeasurementControl.setActive(false);
  }
  app.wrapper.controls.measurementFeature = false;
  app.map.measurementLayer.getSource().clear();
  $('#area-measurement i').removeClass('fa-times');
  $('#area-measurement i').addClass('fa-ruler-combined');
}

app.wrapper.controls.clearMeasurementTool = function() {
  app.wrapper.controls.clearLinearMeasurement();
  app.wrapper.controls.clearAreaMeasurement();
}
