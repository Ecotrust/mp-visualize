app.init = function () {
    //mp-vis

    var map = app.init_map(app.region.map, 'map', app.region.srid, app.region.init_lon, app.region.init_lat, app.region.init_zoom);

    app.map = map;

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
    // if (app.wrapper.map.hasOwnProperty('removeLayerByName')) {
    //   // Do what, exactly?
    // }

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
    app.utils.formatNumber = function(n) {
        var number = Number(n);
        if (app.utils.isInteger(number)) {
            var preciseNumber = number.toFixed(0);
        } else {
            var preciseNumber = number.toFixed(1);
        }
        return app.utils.numberWithCommas(preciseNumber);
    }
    app.utils.trim = function(str) {
        return str.replace(/^\s+|\s+$/g,'');
    }
    app.utils.getObjectFromList = function(list, field, value) {
        for (var i=0; i<list.length; i+=1) {
            if (list[i][field] === value) {
                return list[i];
            }
        }
        return undefined;
    }

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
          new ContextualMenu.Item("Delete Drawing", app.viewModel.scenarios.deleteDrawing, 'fa fa-times-circle red')
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
      app.menus.sharedLeaseBlockCollection = [];
      app.menus.leaseBlockCollection = [];
      app.menus.sharedWindEnergySiting = [];
      app.menus.windEnergySiting = [];
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
      } else if (layer.type === 'WMS') {
        app.addWmsLayerToMap(layer);
      } else if (layer.type === 'VectorTile') {
        app.addVectorTileLayerToMap(layer);
      } else { //if XYZ with no utfgrid
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
