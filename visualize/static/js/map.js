app.init = function () {

    var map = app.init_map(app.region.map, 'map', app.region.srid, app.region.init_lon, app.region.init_lat, app.region.init_zoom, app.region.max_zoom);

    app.map = map;

    app.map.styles = {
      'colors': [
          'maroon',
          'red',
          'purple',
          'fuchsia',
          'green',
          'lime',
          'olive',
          'yellow',
          'navy',
          'blue',
          'teal',
          'aqua',
          'orange',
          'aquamarine',
          'beige',
          'bisque',
          'blanchedalmond',
          'blueviolet',
          'brown',
          'burlywood',
          'cadetblue',
          'chartreuse',
          'chocolate',
          'coral',
          'cornflowerblue',
          'crimson',
          'darkblue',
          'darkcyan',
          'darkgoldenrod',
          'darkgray',
          'darkgreen',
          'darkgrey',
          'darkkhaki',
          'darkmagenta',
          'darkolivegreen',
          'darkorange',
          'darkorchid',
          'darkred',
          'darksalmon',
          'darkseagreen',
          'darkslateblue',
          'darkslategray',
          'darkturquoise',
          'darkviolet',
          'deeppink',
          'deepskyblue',
          'dodgerblue',
          'firebrick',
          'forestgreen',
          'gainsboro',
          'gold',
          'goldenrod',
          'greenyellow',
          'grey',
          'hotpink',
          'indianred',
          'indigo',
          'khaki',
          'lavender',
          'lawngreen',
          'lightblue',
          'lightcoral',
          'lightcyan',
          'lightgoldenrodyellow',
          'lightgray',
          'lightgreen',
          'lightgrey',
          'lightpink',
          'lightsalmon',
          'lightseagreen',
          'lightskyblue',
          'lightslategray',
          'lightsteelblue',
          'lightyellow',
          'limegreen',
          'linen',
          'mediumaquamarine',
          'mediumblue',
          'mediumorchid',
          'mediumpurple',
          'mediumseagreen',
          'mediumslateblue',
          'mediumspringgreen',
          'mediumturquoise',
          'mediumvioletred',
          'midnightblue',
          'mistyrose',
          'moccasin',
          'navajowhite',
          'olivedrab',
          'orangered',
          'orchid',
          'palegoldenrod',
          'palegreen',
          'paleturquoise',
          'palevioletred',
          'papayawhip',
          'peachpuff',
          'peru',
          'pink',
          'plum',
          'powderblue',
          'rosybrown',
          'royalblue',
          'saddlebrown',
          'salmon',
          'sandybrown',
          'seagreen',
          'seashell',
          'sienna',
          'skyblue',
          'slateblue',
          'slategray',
          'springgreen',
          'steelblue',
          'tan',
          'thistle',
          'tomato',
          'turquoise',
          'violet',
          'wheat',
          'yellowgreen',
          'rebeccapurple'
      ],
      'colorLookup': {
        "aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff",
        "aquamarine":"#7fffd4","azure":"#f0ffff", "beige":"#f5f5dc",
        "bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd",
        "blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a",
        "burlywood":"#deb887", "cadetblue":"#5f9ea0","chartreuse":"#7fff00",
        "chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed",
        "cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
        "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b",
        "darkgray":"#a9a9a9","darkgrey":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b",
        "darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
        "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000",
        "darksalmon":"#e9967a","darkseagreen":"#8fbc8f",
        "darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkslategrey":"#2f4f4f",
        "darkturquoise":"#00ced1", "darkviolet":"#9400d3","deeppink":"#ff1493",
        "deepskyblue":"#00bfff","dimgray":"#696969","dimgrey":"#696969","dodgerblue":"#1e90ff",
        "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22",
        "fuchsia":"#ff00ff", "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff",
        "gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","grey":"#808080",
        "green":"#008000","greenyellow":"#adff2f", "honeydew":"#f0fff0",
        "hotpink":"#ff69b4", "indianred":"#cd5c5c","indigo":"#4b0082",
        "ivory":"#fffff0","khaki":"#f0e68c", "lavender":"#e6e6fa",
        "lavenderblush":"#fff0f5","lawngreen":"#7cfc00",
        "lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080",
        "lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2","lightgray":"#d3d3d3",
        "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1",
        "lightsalmon":"#ffa07a","lightseagreen":"#20b2aa",
        "lightskyblue":"#87cefa","lightslategray":"#778899","lightslategrey":"#778899",
        "lightsteelblue":"#b0c4de", "lightyellow":"#ffffe0","lime":"#00ff00",
        "limegreen":"#32cd32","linen":"#faf0e6", "magenta":"#ff00ff",
        "maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd",
        "mediumorchid":"#ba55d3","mediumpurple":"#9370d8",
        "mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
        "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc",
        "mediumvioletred":"#c71585","midnightblue":"#191970",
        "mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
        "navajowhite":"#ffdead","navy":"#000080", "oldlace":"#fdf5e6",
        "olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500",
        "orangered":"#ff4500","orchid":"#da70d6", "palegoldenrod":"#eee8aa",
        "palegreen":"#98fb98","paleturquoise":"#afeeee",
        "palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9",
        "peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd",
        "powderblue":"#b0e0e6","purple":"#800080", "rebeccapurple":"#663399",
        "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
        "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460",
        "seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d",
        "silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd",
        "slategray":"#708090","slategrey":"#708090","snow":"#fffafa","springgreen":"#00ff7f",
        "steelblue":"#4682b4", "tan":"#d2b48c","teal":"#008080",
        "thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
        "violet":"#ee82ee", "wheat":"#f5deb3","white":"#ffffff",
        "whitesmoke":"#f5f5f5", "yellow":"#ffff00","yellowgreen":"#9acd32"
      }
    }

    if (app.wrapper.map.hasOwnProperty('initBaselayerSwitcher')) {
      app.initBaselayerSwitcher = app.wrapper.map.initBaselayerSwitcher;
    } else {
      app.initBaselayerSwitcher = function(base) {
        html = '';
        for (var i = 0; i < Object.keys(app.wrapper.baseLayers).length; i++) {
          var layer = app.wrapper.baseLayers[i];
          var basey = 'off';
          if (layer.name == base) {
            basey = 'on';
          }
          html += '<a id="SimpleLayerSwitcher_input_' + layer.name +
          '" class="basey basey-' + basey + '">' +
          '<div style="background-image:url(/static/visualize/img/baselayer-' +
          layer.name + '.png); color:' + layer.textColor +
          '" onclick="app.setBasemap(\'' + layer.name + '\')">' +
          layer.verboseName + '</div></a>';
        }
        $('#SimpleLayerSwitcher').html(html);
      };
    }

    app.initBaselayerSwitcher(app.region.map);

    /**
      * showBasemaps - add basemap switcher UI element
      */
    app.wrapper.map.showBasemaps = function(viewModel, event) {
      var $layerSwitcher = $('#SimpleLayerSwitcher');
      if ($layerSwitcher.is(":visible")) {
          $layerSwitcher.hide();
      } else {
          $layerSwitcher.show();
      }
    };

    /**
      * getLayerName - given a string, layer, or other object, try to derive the name value
      * @param {string|layer|object} layer - the item we want a name of
      */
    app.getLayerName = function(layer) {
      if (app.wrapper.map.hasOwnProperty('getLayerName')) {
        return app.wrapper.map.getLayerName(layer);
      } else {
        if (typeof(layer) == "string") {
          return layer;
        } else if (typeof(layer.get) == "function" && layer.get('name')) {
          return layer.get('name');
        } else if (Object.keys(layer).indexOf('name')) {
          return layer.name;
        } else {
          return layer.toString();
        }
      }
    }

    /**
      * app.setBasemap - function to set current basemap and unset old basemap
      * - also updates related state and UI
      */
    app.setBasemap = function(layer) {
      const prevBaseMapName = app.wrapper.map.getBasemap().name;
      if (app.wrapper.map.hasOwnProperty('setBasemap')) {
        app.wrapper.map.setBasemap(layer);
      }
      app.updateUrl();
      $('.basey-on').addClass('basey-off').removeClass('basey-on');
      layerName = app.getLayerName(layer);
      $('#SimpleLayerSwitcher_input_' + layerName).addClass('basey-on').removeClass('basey-off');
      var layerDef = app.getBaseLayerDefinitionByName(layerName);
      if (layerDef) {
        $('#toggleBaselayer').css({
            'background-image': "url(/static/visualize/img/baselayer-" + layerName + ".png)",
            'color': layerDef.textColor
        });
      }
      gtag('event', 'Base Map Changed', {
        'base_map_switch': `From: ${prevBaseMapName}, To: ${layerName}`,
        'base_map_name': layerName
      })
    }

    // TODO:
    if (typeof(P97) != 'undefined' && P97.Controls.hasOwnProperty('LayerLoadProgress')) {
      map.addControl(new P97.Controls.LayerLoadProgress({
        map: app.map,
        element: null,
        onStartLoading: function() {
          this.element.show();
        },
        onLoading: function(num, max, percentStr) {
          this.element.text(percentStr);
        },
        onFinishLoading: function() {
          this.element.hide();
        }
      }));
    }

    // See if addBaseLayers is available in {lib}_map.js
    if (app.wrapper.map.hasOwnProperty('addBaseLayers')) {
      app.wrapper.map.addBaseLayers();
    }

    // See if switcher is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addSwitcher')) {
      app.wrapper.controls.addSwitcher();
    }

    // See if scale is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addScale')) {
      app.wrapper.controls.addScale();
    }

    // See if zoombox is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addZoomBox')) {
      //enables zooming to a given extent on the map by holding down shift key while dragging the mouse
      app.wrapper.controls.addZoomBox();
    }

    // See if mousePosition is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addMousePosition')) {
      app.wrapper.controls.addMousePosition();
    }

    // See if zoomEnd is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addZoomEnd')) {
      app.wrapper.events.addZoomEnd();
    }

    // See if addMoveEnd is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addMoveEnd')) {
      var moveEndFunction = function (evt) {
        app.updateUrl();
      };
      app.wrapper.events.addMoveEnd(moveEndFunction);
    }

    if (!app.wrapper.map.hasOwnProperty('attributes')) {
      app.wrapper.map.attributes = [];
    }

    if (!app.wrapper.map.hasOwnProperty('clickOutput')) {
      app.wrapper.map.clickOutput = { time: 0, attributes: {} };
    }

    // See if addUTFGrid is available in {lib}_controls.js
    if (app.wrapper.controls.hasOwnProperty('addUTFGrid')) {
      app.wrapper.controls.addUTFGrid();
    }

    // See if addFeatureClickEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureClickEvent')) {
      app.wrapper.events.addFeatureClickEvent();
    }

    // See if addFeatureOverEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureOverEvent')) {
      app.wrapper.events.addFeatureOverEvent();
    }

    // See if addFeatureOutEvent is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('addFeatureOutEvent')) {
      app.wrapper.events.addFeatureOutEvent();
    }

    // See if app.wrapper.map.createPopup is available in {lib}_map.js

    app.map.anyVisiblePopups = function() {
        if (app.wrapper.map.hasOwnProperty('popups')) {
          for (var i=0; i<app.wrapper.map.popups.length; i+=1) {
            if (app.map.popups[0].visible()) {
              return true;
            }
          }
          return false;
        } else {
          window.alert("Error: Please inform site owner that map popups are not enabled for current map library");
          return false;
        }
    };

    // See if app.wrapper.map.addMarkersLayer is abailabel in {lib}_map.js
    if (app.wrapper.map.hasOwnProperty('addMarkersLayer')) {
      app.wrapper.map.addMarkersLayer();
    }

    // See if app.wrapper.events.getClickLocation is available in {lib}_events.js
    if (app.wrapper.events.hasOwnProperty('registerClickLocationEvent')) {
      app.wrapper.events.registerClickLocationEvent();
    }

    // See if app.wrapper.map.removeLayerByName is set in {lib}_map.js


    app.utils = {};
    app.utils.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    app.utils.numberWithCommas = function(x) {
        if (x.toString().length > 4){
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
          return x.toString();
        }
    }
    app.utils.isInteger = function(n) {
        return app.utils.isNumber(n) && (Math.floor(n) === n);
    }
    app.utils.formatNumber = function(n, precision) {
        var number = Number(n);
        if (!precision) {
          precision = 1;
        }
        if (app.utils.isInteger(number)) {
            var preciseNumber = number.toFixed(0);
        } else {
            var preciseNumber = number.toFixed(precision);
        }
        return app.utils.numberWithCommas(preciseNumber);
    }
    app.utils.trim = function(str_val) {
        return String(str_val).replace(/^\s+|\s+$/g,'');
    }
    app.utils.getObjectFromList = function(list, field, value) {
        for (var i=0; i<list.length; i+=1) {
            if (list[i][field] === value) {
                return list[i];
            }
        }
        return undefined;
    }

    // setTimeout( function() {
    //     if (app.mafmc) {
    //         map.removeLayer(openStreetMap);
    //         map.removeLayer(googleStreet);
    //         map.removeLayer(googleTerrain);
    //         map.removeLayer(googleSatellite);
    //     }
    // }, 1000);


    app.menus = {}

    if(typeof ContextualMenu != 'undefined'){
      app.menus.bookmark = [
          new ContextualMenu.Item("Share Bookmark", app.viewModel.bookmarks.showSharingModal, 'fa fa-link'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Delete Bookmark", app.viewModel.bookmarks.removeBookmark, 'fa fa-times-circle red')
      ];

      app.menus.sharedDrawing = [
          new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToDrawing, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfDrawing, 'fa fa-copy')
      ];

      app.menus.drawing = [
          new ContextualMenu.Item("Edit", app.viewModel.scenarios.editDrawing, 'fa fa-edit'),
          new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToDrawing, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Share…", app.viewModel.scenarios.shareDrawing, 'fa fa-share-alt'),
          new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Delete Shape", app.viewModel.scenarios.deleteDrawing, 'fa fa-times-circle red')
      ];

      app.menus.sharedUserLayer = [
        new ContextualMenu.Item("Create Copy", app.viewModel.userLayers.createCopyOfLayer, 'fa fa-copy')
      ];

      app.menus.userLayer = [
        new ContextualMenu.Item("Edit", app.viewModel.userLayers.editUserLayer, 'fa fa-edit'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Share...", app.viewModel.userLayers.shareUserLayer, 'fa fa-share-alt'),
        new ContextualMenu.Divider(),
        new ContextualMenu.Item("Delete Layer", app.viewModel.userLayers.removeUserLayer, 'fa fa-times-circle red')
      ];

      app.menus.sharedLeaseBlockCollection = [
          new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToLeaseBlockCollection, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfLeaseBlockCollection, 'fa fa-copy')
      ];

      app.menus.leaseBlockCollection = [
          new ContextualMenu.Item("Edit", app.viewModel.scenarios.editLeaseBlockCollection, 'fa fa-edit'),
          new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToLeaseBlockCollection, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Share", app.viewModel.scenarios.shareLeaseBlockCollection, 'fa fa-share-alt'),
          new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Delete Lease Block Collection", app.viewModel.scenarios.deleteLeaseBlockCollection, 'fa fa-times-circle red')
      ];

      app.menus.sharedWindEnergySiting = [
          new ContextualMenu.Item("Zoom To", function(){console.info("sharedWindEnergySiting: Zoom To")}, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Create Copy", app.viewModel.scenarios.createCopyOfWindEnergySiting, 'fa fa-copy')
      ];

      app.menus.windEnergySiting = [
          new ContextualMenu.Item("Edit", app.viewModel.scenarios.editWindEnergySiting, 'fa fa-edit'),
          new ContextualMenu.Item("Zoom To", app.viewModel.scenarios.zoomToWindEnergySiting, 'fa fa-search-plus'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Share", app.viewModel.scenarios.shareWindEnergySiting, 'fa fa-share-alt'),
          new ContextualMenu.Item("Export…", app.viewModel.exportGeometry.showDialog.bind(app.viewModel.exportGeometry), 'far fa-file'),
          new ContextualMenu.Divider(),
          new ContextualMenu.Item("Delete Wind Energy Siting", app.viewModel.scenarios.deleteWindEnergySiting, 'fa fa-times-circle red')
      ];

      $(function() {
        // manually bind up the context menu here, otherwise ko will complain
        // that we're binding the same element twice (MP's viewmodel applies
        // to the entire page
        //ContextualMenu.Init(app.menus, document.querySelector('#context-menu'))
        app.menuModel = new ContextualMenu.Model(app.menus, document.querySelector('#context-menu'));
        // fix for top nav's negative margin
        app.menuModel.setCorrectionOffset(0, 0);
        ko.applyBindings(app.menuModel, document.querySelector('#context-menu'));
      });

    } else {
      app.menus.bookmark = [];
      app.menus.sharedDrawing = [];
      app.menus.drawing = [];
      app.menus.sharedUserLayer = [];
      app.menus.userLayer = [];
      app.menus.sharedLeaseBlockCollection = [];
      app.menus.leaseBlockCollection = [];
      app.menus.sharedWindEnergySiting = [];
      app.menus.windEnergySiting = [];
    }

    app.map.zoomToExtent = function(extent){
      if (extent instanceof drawingModel) {
        app.viewModel.scenarios.zoomToDrawing()
      } else {
        if (app.wrapper.map.hasOwnProperty('zoomToExtent')) {
            app.wrapper.map.zoomToExtent(extent);
        } else {
          console.log('no zoomToExtent function defined for map');
        }
      }
    }

    app.map.zoomOut = function() {
      if (app.wrapper.map.hasOwnProperty('zoomOut')) {
        app.wrapper.map.zoomOut();
      } else {
        console.log('no zoomOut function defined for map');
      }
    }
};



app.addLayerToMap = function(layer) {
  if (layer instanceof layerModel && layer.fullyLoaded) {
    if (!layer.layer) {
      if (layer.utfurl || (layer.parent && layer.parent.utfurl)) {
        app.addUtfLayerToMap(layer);
      }
      if (layer.type === 'Vector') {
        app.addVectorLayerToMap(layer);
      } else if (layer.type === 'ArcRest') {
        app.addArcRestLayerToMap(layer);
      } else if (layer.type === 'ArcFeatureServer') {
        app.addArcFeatureServerLayerToMap(layer);
      } else if (layer.type === 'WMS') {
        app.addWmsLayerToMap(layer);
      } else if (layer.type === 'VectorTile') {
        app.addVectorTileLayerToMap(layer);
      } else if (layer.type === 'XYZ'){ //if XYZ with no utfgrid
        app.addXyzLayerToMap(layer);
      }
    }
    if (app.wrapper.events.hasOwnProperty('addLayerLoadStart')) {
      app.wrapper.events.addLayerLoadStart(layer);
    }

    if (app.wrapper.events.hasOwnProperty('addLayerLoadEnd')) {
      app.wrapper.events.addLayerLoadEnd(layer);
    }

    if (app.wrapper.events.hasOwnProperty('addLayerLoadError')) {
      app.wrapper.events.addLayerLoadError(layer);
    }
    if (app.wrapper.map.hasOwnProperty('postProcessLayer')) {
      app.wrapper.map.postProcessLayer(layer);
    }
  } else {
    if (layer instanceof layerModel) {
      layer.getFullLayerRecord('addLayerToMap', null);
    } else {
      app.viewModel.getOrCreateLayer(layer, null, 'addLayerToMap', null);
    }
  }
  return layer;
};

// add XYZ layer with no utfgrid
app.addXyzLayerToMap = function(layer) {

  if (app.wrapper.controls.hasOwnProperty('addXYZIdentifyControl')) {
    app.wrapper.controls.addXYZIdentifyControl(layer);
  } else {
    console.log('no addXYZIdentifyControl function defined.');
  }

  if (app.wrapper.map.hasOwnProperty('addXYZLayerToMap')) {
    app.wrapper.map.addXYZLayerToMap(layer);
  } else {
    console.log('no addXYZLayerToMap function defined.');
  }
};

app.addWmsLayerToMap = function(layer) {

    if (app.wrapper.controls.hasOwnProperty('addWMSIdentifyControl')) {
      app.wrapper.controls.addWMSIdentifyControl(layer);
    } else {
      console.log('no addWMSIdentifyControl function defined.');
    }

    if (app.wrapper.map.hasOwnProperty('addWMSLayerToMap')) {
      app.wrapper.map.addWMSLayerToMap(layer);
    } else {
      console.log('no addWMSLayerToMap function defined.');
    }

};

app.addArcRestLayerToMap = function(layer) {
    if (app.wrapper.map.hasOwnProperty('addArcRestLayerToMap')) {
      app.wrapper.map.addArcRestLayerToMap(layer);
    } else {
      console.log('no addArcRestLayerToMap function defined.');
    }


    if (app.wrapper.controls.hasOwnProperty('addArcIdentifyControl')) {
      if (layer.url){
        var identifyUrl = layer.url.replace('export', layer.arcgislayers + '/query');
      } else {
        var identifyUrl = '';
      }
      app.wrapper.controls.addArcIdentifyControl(layer, identifyUrl);
    } else {
      console.log('no addArcIdentifyControl function defined.');
    }
};

app.addArcFeatureServerLayerToMap = function(layer) {
    if (app.wrapper.map.hasOwnProperty('addArcFeatureServerLayerToMap')) {
      app.wrapper.map.addArcFeatureServerLayerToMap(layer);
    } else {
      console.log('no addArcFeatureServerLayerToMap function defined.');
    }
}

app.addVectorLayerToMap = function(layer) {
    if (app.wrapper.controls.hasOwnProperty('addVectorIdentifyControl')) {
      app.wrapper.controls.addVectorIdentifyControl(layer);
    } else {
      console.log('no addVectorIdentifyControl function defined.');
    }

    if (app.wrapper.map.hasOwnProperty('addVectorLayerToMap')) {
      app.wrapper.map.addVectorLayerToMap(layer);
    } else {
      console.log('no addVectorLayerToMap function defined.');
    }
};

app.addVectorTileLayerToMap = function(layer) {
  if (app.wrapper.controls.hasOwnProperty('addVectorTileIdentifyControl')) {
    app.wrapper.controls.addVectorIdentifyControl(layer);
  } else {
    console.log('no addVectorTileIdentifyControl function defined');
  }

  if (app.wrapper.map.hasOwnProperty('addVectorTileLayerToMap')) {
    app.wrapper.map.addVectorTileLayerToMap(layer);
  } else {
    console.log('no addVectorTileLayerToMap function defined.');
  }
}

app.addUtfLayerToMap = function(layer) {
    if (app.wrapper.controls.hasOwnProperty('addUTFIdentifyControl')) {
      app.wrapper.controls.addUTFIdentifyControl(layer);
    } else {
      console.log('no addUTFIdentifyControl function defined.');
    }

    if (app.wrapper.map.hasOwnProperty('addUtfLayerToMap')) {
      app.wrapper.map.addUtfLayerToMap(layer);
    } else {
      console.log('no addUtfLayerToMap function defined.');
    }
};

app.setLayerVisibility = function(layer, visibility) {
  if (app.wrapper.map.hasOwnProperty('setLayerVisibility')) {
    app.wrapper.map.setLayerVisibility(layer, visibility);
  }
};

app.setLayerZIndex = function(layer, index) {
    layer.layer.setZIndex(index);
};


app.reCenterMap = function () {
    app.setMapPosition(app.state.x, app.state.y, 7);
};

app.addDrawingLayerToMap = function(name) {
  if (app.wrapper.map.hasOwnProperty('addDrawingLayerToMap')) {
    var drawingLayer = app.wrapper.map.addDrawingLayerToMap(name);
  } else {
    console.log('no addDrawingLayerToMap function defined.');
  }
}

app.addFeaturesToDrawingLayer = function(geojson) {
  if (app.wrapper.maps.hasOwnProperty('addFeaturesToDrawingLayer')) {
    app.wrapper.maps.addFeaturesToDrawingLayer(geojson);
  } else {
    console.log('no addFeaturesToDrawingLayer function defined.')
  }
}

app.startSketch = function(){
  if (app.wrapper.controls.hasOwnProperty('startSketch')) {
    app.wrapper.controls.startSketch();
  } else {
    console.log('no startSketch function defined for controls.')
  }
}

app.startPolygonSketch = function(){
  if (app.wrapper.controls.hasOwnProperty('startPolygonSketch')) {
    app.wrapper.controls.startPolygonSketch();
  } else {
    console.log('no startPolygonSketch function defined for controls.')
  }
}

app.startLineSketch = function(){
  if (app.wrapper.controls.hasOwnProperty('startLineSketch')) {
    app.wrapper.controls.startLineSketch();
  } else {
    console.log('no startLineSketch function defined for controls.')
  }
}

app.startPointSketch = function(){
  if (app.wrapper.controls.hasOwnProperty('startPointSketch')) {
    app.wrapper.controls.startPointSketch();
  } else {
    console.log('no startPointSketch function defined for controls.')
  }
}

app.completeSketch = function() {
  if (app.wrapper.controls.hasOwnProperty('completeSketch')) {
    app.wrapper.controls.completeSketch();
  } else {
    console.log('no completeSketch function defined for controls.')
  }
}

app.startEdit = function() {
  var drawingForm = app.viewModel.scenarios.drawingFormModel;
  drawingForm.isEditing(true);
  app.viewModel.disableFeatureAttribution();
  if (app.wrapper.controls.hasOwnProperty('startEdit')) {
    app.wrapper.controls.startEdit();
  } else {
    console.log('no startEdit function defined for controls.')
  }
}

app.completeEdit = function() {
  var drawingForm = app.viewModel.scenarios.drawingFormModel;
  drawingForm.isEditing(false);
  if (app.wrapper.controls.hasOwnProperty('completeEdit')) {
    app.wrapper.controls.completeEdit();
  } else {
    console.log('no completeEdit function defined for controls.')
  }
  app.viewModel.enableFeatureAttribution();
  if (app.wrapper.map.hasOwnProperty('countFeatures')){
    num_features = app.wrapper.map.countFeatures(app.map.drawingLayer);
    if (num_features == 0) {
      drawingForm.hasShape(false);
      window.alert('You have no shapes drawn. Please draw a shape before saving.');
      // app.startSketch();
    } else if (num_features > 1) {
      app.consolidatePolygonLayerFeatures();
    }
  } else {
    console.log('no countFeatures function defined for map');
  }
}

app.cleanupDrawing = function() {
  if (app.wrapper.events.hasOwnProperty('cleanupDrawing')) {
    app.wrapper.events.cleanupDrawing();
  } else {
    console.log('no cleanupDrawing function defined for events.');
  }
}

app.consolidatePolygonLayerFeatures = function(){
  if (app.wrapper.controls.hasOwnProperty('consolidatePolygonLayerFeatures')) {
    app.wrapper.controls.consolidatePolygonLayerFeatures();
  } else {
    console.log('no consolidatePolygonLayerFeatures function defined for controls');
  }
}

app.getLayerFeatureAsWKT = function(layer, feature_index) {
  if (app.wrapper.layer_functions.hasOwnProperty('getLayerFeatureAsWKT')) {
    return app.wrapper.layer_functions.getLayerFeatureAsWKT(layer, feature_index);
  } else {
    console.log('no getLayerFeatureAsWKT function defined for layers');
  }
}

app.addMeasurementLayerToMap = function(name) {
  if (app.wrapper.map.hasOwnProperty('addMeasurementLayerToMap')) {
    app.map.measurementLayer = app.wrapper.map.addMeasurementLayerToMap(name);
    app.map.addLayer(app.map.measurementLayer);
  } else {
    console.log('no addDrawingLayerToMap function defined.');
  }
}
