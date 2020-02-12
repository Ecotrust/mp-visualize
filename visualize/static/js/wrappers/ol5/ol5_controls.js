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
