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
    return [ layer.id, layer.opacity(), layer.visible() ];
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
    if ($('#disclaimer-modal').length > 0){
      $('#disclaimer-modal').modal('show');
    }
    app.state = app.getState();
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
    if (state.dls) {
        var unloadedDesigns = [];
        for (x=0; x < state.dls.length; x=x+3) {
            var id = state.dls[x+2],
                opacity = state.dls[x+1],
                isVisible = state.dls[x];

            if (app.viewModel.layerIndex[id]) {
                app.viewModel.layerIndex[id].activateLayer();
                app.viewModel.layerIndex[id].opacity(opacity);
                //obviously not understanding something here...
                if (isVisible || !isVisible) {
                    if (isVisible !== 'true' && isVisible !== true) {
                        app.viewModel.layerIndex[id].toggleVisible();
                    }
                }
            } else {
                unloadedDesigns.push({id: id, opacity: opacity, isVisible: isVisible});
            }
       }
       if ( unloadedDesigns.length ) {
            app.viewModel.unloadedDesigns = unloadedDesigns;
            $('#designsTab').tab('show'); //to activate the loading of designs
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
        app.setBasemap(app.wrapper.map.getLayersByName(state.basemap)[0]);
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

    // turn on the layers that should be active
    app.viewModel.deactivateAllLayers();
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

    if (state.basemap) {
        app.wrapper.map.setBasemap(app.wrapper.map.getLayersByName(state.basemap.name)[0]);
    }
    // now that we have our layers
    // to allow for establishing the layer load state
    app.establishLayerLoadState();

    if (state.activeTab && state.activeTab.tab === 'active') {
        $('#activeTab').tab('show');
    } else {
        if (state.activeTab || state.openThemes) {
            $('#dataTab').tab('show');
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
