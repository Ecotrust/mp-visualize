// represents whether or not restoreState is currently being updated
// example use:  saveStateMode will be false when a user is viewing a bookmark
app.saveStateMode = true;

// save the state of app
app.getState = function () {
  if (app.wrapper.map.hasOwnProperty('getCenter')) {
    var center = app.wrapper.map.getCenter();
  } else {
    // OL2 cruft
    var center = app.map.getCenter().transform(
      new OpenLayers.Projection("EPSG:900913"),
      new OpenLayers.Projection("EPSG:4326")
    );
  }
  if (app.wrapper.map.hasOwnProperty('getZoom')) {
    var zoom = app.wrapper.map.getZoom();
  } else {
    // OL2 cruft
    var zoom = app.map.getZoom();
  }
  var layers = $.map(app.viewModel.activeLayers(), function(layer) {
    //return {id: layer.id, opacity: layer.opacity(), isVisible: layer.visible()};
    if (!layer.hasOwnProperty('is_multilayer') || !layer.is_multilayer()){
      return [ layer.id, layer.opacity(), layer.visible() ];
    } else {
      return null;
    }
  });

  if (app.wrapper.map.hasOwnProperty('getBasemap')) {
    var basemap = app.wrapper.map.getBasemap().name;
  } else {
    var basemap = 'ocean';
  }

  return {
    x: center.lon.toFixed(2),
    y: center.lat.toFixed(2),
    z: zoom,
    logo: app.viewModel.showLogo(),
    controls: app.viewModel.showZoomControls(),
    dls: layers.reverse(),
    basemap: basemap,
    themes: {ids: app.viewModel.getOpenThemeIDs()},
    tab: $('#myTab').find('li.active').data('tab'),
    legends: app.viewModel.showLegend() ? 'true': 'false',
    layers: app.viewModel.showLayers() ? 'true': 'false'
    //and active tab
  };
};

$(document).on('map-ready', function () {
  // Check if disclaimer flag is in local storage
  var disclaimerAcknowledged = localStorage.getItem('disclaimerAcknowledged');
  if ($('#disclaimer-modal').length > 0 && !disclaimerAcknowledged) {
    try {
      $('#disclaimer-modal').modal('show');
      app.state = app.getState();
    } catch (e) {
      setTimeout(function() {
        $('#disclaimer-modal').modal('show');
        app.state = app.getState();
      }, 1000)
    }
  }
  // If accept button if continue button is selected, set flag in local storage
  document.querySelector('[data-decline=false]').addEventListener('click', function() {
    // Set a flag so we don't show the disclaimer again
    localStorage.setItem('disclaimerAcknowledged', true);
  });
});

app.layersAreLoaded = false;
app.establishLayerLoadState = function () {
    var loadTimer, status;
    if (app.wrapper.map.getLayers().length === 0) {
        app.layersAreLoaded = true;
    } else {
        loadTimer = setInterval(function () {
            status = true;
            $.each(app.map.layers, function (i, layer) {
                if (layer.loading === true) {
                    status = false;
                }
            });
            if (status === true) {
                app.layersAreLoaded = true;
                //console.log('layers are loaded');
                clearInterval(loadTimer);
            }
        }, 100);
    }

};

/**
  * function app.activateHashStateLayers
  *   Loops through list of layers to activate on load (from state) and activates
  *   them in order, stopping if the next one isn't loaded yet. Since this gets
  *   called every time a layer is loaded from the state, and keeps going until
  *   if either finds a missing layer or the end, it should load the layers in order
  *   regardless of what order they come back from the AJAX calls.
  */
app.activateHashStateLayers = function() {
  for (var i = 0; i < app.hashStateLayers.length; i++) {
    var layerStatus = app.hashStateLayers[i].status
    if (layerStatus instanceof layerModel) {
      if (app.viewModel.activeLayers().indexOf(layerStatus) < 0) {
        layerStatus.activateLayer("nocompanion", true);
        if (app.hashStateLayers[i].visible == "false" || app.hashStateLayers[i].visible == false) {
          if (layerStatus.visible()){
            layerStatus.toggleVisible();
          }
        }
      }
    } else {
      break;
    }
  }
}

app.updateHashStateLayers = function(id, status, visible) {
  if (!app.hasOwnProperty('hashStateLayers')) {
    app.hashStateLayers = [];
  }

  var match_found = false;
  for (var i = 0; i < app.hashStateLayers.length; i++) {
    if (app.hashStateLayers[i].id == id) {
      app.hashStateLayers[i].status = status;
      match_found = true;
      break;
    }
  }
  if (!match_found){
    app.hashStateLayers.push({
      id: id,
      status: status,
      visible: visible
    });
  }

  app.activateHashStateLayers();

}

app.addKnownLayerFromState = function(id, opacity, isVisible, unloadedDesigns) {
  if (app.viewModel.layerIndex[id]) {
      app.viewModel.layerIndex[id].activateLayer();
      window.setTimeout(function(){
        app.viewModel.layerIndex[id].opacity(opacity);
      }, 200);
      //obviously not understanding something here...
      if (isVisible || !isVisible) {
          if (isVisible !== 'true' && isVisible !== true) {
              app.viewModel.layerIndex[id].toggleVisible();
          }
      }
  } else {
      if (!isNaN(parseInt(id))){
        var layer_obj = {'name': 'loading...', 'id': id, 'opacity': parseFloat(opacity), 'isVisible': isVisible};
        app.updateHashStateLayers(id, null, isVisible);
        app.viewModel.getOrCreateLayer(layer_obj, null, 'updateHashStateLayers', null, true);
      } else {
        unloadedDesigns.push({id: id, opacity: opacity, isVisible: isVisible});
      }
  }
  return unloadedDesigns
}

// load compressed state (the url was getting too long so we're compressing it
app.loadCompressedState = function(state) {
    // turn off active laters
    // create a copy of the activeLayers list and use that copy to iteratively deactivate
    var activeLayers = $.map(app.viewModel.activeLayers(), function(layer) {
        return layer;
    });
    $.each(activeLayers, function (index, layer) {
        layer.deactivateLayer();
    });
    // turn on the layers that should be active
    if (state.layers && state.layers instanceof Array) {
      var unloadedDesigns = [];
      for(var i = 0; i < state.layers.length; i++) {
        var layer = state.layers[i];
        if (layer.dynamic) {
          var lyrObj = {
            type: layer.type,
            wmsSession: layer.isUserLayer,
            id: layer.id,
            name: layer.name,
            url: layer.url,
            arcgis_layers: layer.arcgislayers,
            isVTR: layer.isVTR,
            isMDAT: layer.isMDAT,
          }
          var dynamicLayer = app.viewModel.getOrCreateLayer(lyrObj, null, 'activateLayer', null);

        }
        if (layer.hasOwnProperty('id') && layer.id) {
          unloadedDesigns = app.addKnownLayerFromState(layer.id.toString(), layer.opacity, layer.visible, unloadedDesigns);
        }
      }
      if ( unloadedDesigns.length ) {
           app.viewModel.unloadedDesigns = unloadedDesigns;
      }
    } else if (state.dls) {
        var unloadedDesigns = [];

        for (x=0; x < state.dls.length; x=x+3) {
            var id = state.dls[x+2],
                opacity = state.dls[x+1],
                isVisible = state.dls[x];

            unloadedDesigns = app.addKnownLayerFromState(id, opacity, isVisible, unloadedDesigns);
       }
       if ( unloadedDesigns.length ) {
            app.viewModel.unloadedDesigns = unloadedDesigns;
            try {
              $('#designsTab').tab('show'); //to activate the loading of designs
            } catch(err) {
              setTimeout(function(){
                $('#designsTab').tab('show');
              }, 700)
            }
       }
    }

    if (state.logo === 'false') {
        app.viewModel.hideLogo();
    }

    if (state.controls === 'false') {
        app.viewModel.hideZoomControls();
    }

    if (state.print === 'true') {
        app.printMode();
    }
    if (state.borderless === 'true') {
        app.borderLess();
    }

    if (state.basemap) {
      basemap = app.wrapper.map.getLayersByName(state.basemap)[0];
      if (!basemap) {
        // It's okay, app.setBasemap knows how to handle strings now!
        basemap = state.basemap;
      }
      app.setBasemap(basemap);
    }

    app.establishLayerLoadState();
    // data tab and open themes
    if (state.themes) {
        //$('#dataTab').tab('show');
        if (state.themes) {
            $.each(app.viewModel.themes(), function (i, theme) {
                if ( $.inArray(theme.id, state.themes.ids) !== -1 || $.inArray(theme.id.toString(), state.themes.ids) !== -1 ) {
                    if ( app.viewModel.openThemes.indexOf(theme) === -1 ) {
                        //app.viewModel.openThemes.push(theme);
                        theme.setOpenTheme();
                    }
                } else {
                    if ( app.viewModel.openThemes.indexOf(theme) !== -1 ) {
                        app.viewModel.openThemes.remove(theme);
                    }
                }
            });
        }
    }

    //if (app.embeddedMap) {
    if ( $(window).width() < 768 || app.embeddedMap ) {
        state.tab = "data";
    }

    // active tab -- the following prevents theme and data layers from loading in either tab (not sure why...disbling for now)
    // it appears the dataTab show in state.themes above was causing the problem...?
    // timeout worked, but then realized that removing datatab show from above worked as well...
    // now reinstating the timeout which seems to fix the toggling between tours issue (toggling to ActiveTour while already in ActiveTab)
    if (state.tab && state.tab === "active") {
        //$('#activeTab').tab('show');
        setTimeout( function() { $('#activeTab').tab('show'); }, 200 );
    } else if (state.tab && state.tab === "designs") {
        setTimeout( function() { $('#designsTab').tab('show'); }, 200 );
    } else if (state.tab && state.tab === "legend") {
        setTimeout( function() { $('#legendTab').tab('show'); }, 200 );
    } else {
        setTimeout( function() { $('#dataTab').tab('show'); }, 200 );
    }

    if ( state.legends && state.legends === 'true' ) {
        app.viewModel.showLegend(true);
    } else {
        app.viewModel.showLegend(false);
    }

    if (state.layers && state.layers === 'false') {
        app.viewModel.showLayers(false);
        app.map.render('map');
    } else {
        app.viewModel.showLayers(true);
    }

    // map title for print view
    if (state.title) {
        app.viewModel.mapTitle(state.title);
    }

    app.setMapPosition(state.x, state.y, state.z);
};

app.setMapPosition = function(x, y, z) {
    app.wrapper.map.setCenter(x, y);
    app.wrapper.map.setZoom(z);
};

// hide buttons and other features for printing
app.printMode = function () {
    $('body').addClass('print');
};

// also hide logo and rules
app.borderLess = function () {
    $('body').addClass('borderless');
};

// load state from fixture or server

app.loadState = function(state) {
    var loadTimer;

    if (state.hasOwnProperty('bookmark') && !isNaN(state.bookmark)) {
      // Quick way to trigger pulling drawings/bookmarks from server. See scenarios.js: $('#designsTab').on('show.bs.tab'.....;
      // Without this, drawings in shared bookmarks won't load.
      $('#designsTab').tab('show');
      app.viewModel.bookmarks.loadBookmarkFromHash(state.bookmark);
      return;
    }

    // if the request is to load and display a single, named layer
    for ( key in state ) {
        if (state.hasOwnProperty(key)) {
            var slug = key;
            var layer = app.viewModel.getLayerBySlug(slug);
            break;
        }
    }
    //var slug = Object.keys(state)[0], //fails in IE
    //    layer = app.viewModel.getLayerBySlug(slug);
    if (layer) {
        app.loadCompressedState(state);
        //activate layer (/planner/#<layer-name>)
        app.viewModel.layerIndex[layer.id].activateLayer();
        //set open theme

        var theme = layer.themes()[0];
        if (theme) {
            layer.themes()[0].setOpenTheme();
        } else {
            layer.parent.themes()[0].setOpenTheme();
        }

        return;
    }

    // otherwise, if url is up to date
    if (state.z || state.login) {
        return app.loadCompressedState(state);
    }
    // else load it up the old fashioned way...(might be ready to jettison this sometime soon...)

    if (state.print === 'true') {
        app.printMode();
    }
    if (state.borderless === 'true') {
        app.borderLess();
    }
    // turn off active laters
    // create a copy of the activeLayers list and use that copy to iteratively deactivate
    var activeLayers = $.map(app.viewModel.activeLayers(), function(layer) {
        return layer;
    });
    //var activeLayers = $.extend({}, app.viewModel.activeLayers());

    if (state.basemap) {
        basemap = app.wrapper.map.getLayersByName(state.basemap)[0];
        if (!basemap) {
          // It's okay, app.setBasemap knows how to handle strings now!
          if (typeof(state.basemap) == 'string') {
            basemap = state.basemap;
          } else if (typeof(state.basemap) == 'object') {
            basemap = state.basemap.name;
          }
        }
        app.wrapper.map.setBasemap(basemap);
    }
    // now that we have our layers
    // to allow for establishing the layer load state
    app.establishLayerLoadState();

    if (state.activeTab && state.activeTab.tab === 'active') {
        try {
          $('#activeTab').tab('show');
        } catch (e) {
          setTimeout(function(){
            $('#activeTab').tab('show');
          }, 7000)
        }
    } else {
        if (state.activeTab || state.openThemes) {
            try {
              $('#dataTab').tab('show');
            } catch (e) {
              setTimeout(function(){
                $('#dataTab').tab('show');
              }, 7000)
            }
            if (state.openThemes) {
                $.each(app.viewModel.themes(), function (i, theme) {
                    if ( $.inArray(theme.id, state.openThemes.ids) !== -1 || $.inArray(theme.id.toString(), state.openThemes.ids) !== -1 ) {
                        theme.setOpenTheme();
                    } else {
                        app.viewModel.openThemes.remove(theme);
                    }
                });
            }
        }
    }

    // turn on the layers that should be active
    app.viewModel.deactivateAllLayers();
    if (app.viewModel.openThemes().length == 0 || Object.keys(app.viewModel.layerIndex).length < 1) {
      openTimeout = 1000;
    } else {
      openTimeout = 100;
    }
    setTimeout(function() {
      if (state.activeLayers) {
        $.each(state.activeLayers, function(index, layer) {
          if (app.viewModel.layerIndex[layer.id]) {
            app.viewModel.layerIndex[layer.id].activateLayer();
            app.viewModel.layerIndex[layer.id].opacity(layer.opacity);
            //must not be understanding something about js, but at the least the following seems to work now...
            if (layer.isVisible || !layer.isVisible) {
              if (layer.isVisible !== 'true' && layer.isVisible !== true) {
                app.viewModel.layerIndex[layer.id].toggleVisible();
              }
            }
          }
        });
      }
    }, openTimeout)

    if ( state.legends && state.legends.visible === "true" ) {
        app.viewModel.showLegend(true);
    } else {
        app.viewModel.showLegend(false);
    }

    if (state.layers && state.layers === 'false') {
        app.viewModel.showLayers(false);
        app.map.render('map');
    } else {
        app.viewModel.showLayers(true);
    }

    // map title for print view
    if (state.title) {
        app.viewModel.mapTitle(state.title);
    }

    if (state.location) {
        app.setMapPosition(state.location.x, state.location.y, state.location.zoom);
    }
};

// load the state from the url hash

app.loadStateFromHash = function (hash) {
    app.loadState($.deparam(hash.slice(1)));
};

// update the hash
app.updateUrl = function () {
    var state = app.getState();

    // save the restore state
    if (app.saveStateMode) {
        app.restoreState = state;
    }
    var ua = window.navigator.userAgent;
    if (ua.indexOf("MSIE ") > -1 || ua.indexOf("Edge") > -1 || ua.indexOf("Trident") > -1) {
      while ($.param(state).length > 2047) {
        state.dls.pop();
        state.dls.pop();
        state.dls.pop();
      }
    }
    window.location.hash = $.param(state);
    app.viewModel.currentURL(window.location.pathname + window.location.hash);
};
