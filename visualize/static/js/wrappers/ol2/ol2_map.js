app.init = function () {

    //to turn basemap indicator off (hide the plus sign)
    //see email from Matt on 7/26 2:24pm with list of controls
    var map = new OpenLayers.Map(null, {
        //allOverlays: true,
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        projection: "EPSG:3857"
    });

    map.addControl(new P97.Controls.LayerLoadProgress({
        map: map,
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

    esriOcean = new OpenLayers.Layer.XYZ("Ocean", "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: 13,
        attribution: "Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others",
        textColor: "black"
    });
    openStreetMap = new OpenLayers.Layer.OSM("Open Street Map", "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: 13,
        visibility: false,
        textColor: "black"
    });
    esriStreets = new OpenLayers.Layer.XYZ("ESRI Streets", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: 13,
        attribution: "Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom, and others",
        buffer: 3,
        textColor: "black"
    });
    esriTopo = new OpenLayers.Layer.XYZ("ESRI Physical", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}", {
        sphericalMercator: true,
        isBaseLayer: true,
        numZoomLevels: 13,
        attribution: "Sources: Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, and others",
        buffer: 3,
        textColor: "black"
    });
    esriImagery = new OpenLayers.Layer.XYZ("ESRI Satellite", "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}", {
        sphericalMercator: true,
        isBaseLayer: true,
        // numZoomLevels: max_zoom,
        attribution: "Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and others",
        buffer: 3,
        textColor: "white"
    });
    nauticalCharts = new OpenLayers.Layer.ArcGIS93Rest("Nautical Charts", "http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer/exportImage",
        {
            layers: 'null'
        },
        {
            isBaseLayer: true,
            numZoomLevels: 13,
            projection: "EPSG:3857",
            visibility: false,
            textColor: "black"
        }
    );
    // nauticalCharts = new OpenLayers.Layer.TMS("Nautical Charts", ["http://c3429629.r29.cf0.rackcdn.com/stache/NETiles_layer/"],
    //     {
    //         buffer: 1,
    //         'isBaseLayer': true,
    //         'sphericalMercator': true,
    //         getURL: function (bounds) {
    //             var z = map.getZoom();
    //             var url = this.url;
    //             var path = 'blank.png' ;
    //             if ( z <= 13 && z >= 0 ) {
    //                 var res = map.getResolution();
    //                 var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
    //                 var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
    //                 var limit = Math.pow(2, z);
    //                 var path = (z) + "/" + x + "/" + y + ".png";
    //             }
    //             tilepath = url + path;
    //             return url + path;
    //         }
    //     }
    // );

    map.addLayers([esriOcean, openStreetMap, esriStreets, esriTopo, esriImagery, nauticalCharts]);

    map.addControl(new SimpleLayerSwitcher());

    //Scale Bar
    var scaleline = new OpenLayers.Control.ScaleLine({
      maxWidth: 130,
      topOutUnits: "mi",
      topInUnits: "mi",
      bottomOutUnits: "km",
      bottomInUnits: "m",
      geodesic: true
    });
    map.addControl(scaleline);

    map.zoomBox = new OpenLayers.Control.ZoomBox( {
        //enables zooming to a given extent on the map by holding down shift key while dragging the mouse
    });

    map.addControl(map.zoomBox);

    // only allow onetime zooming with box
    map.events.register("zoomend", null, function () {
        if (map.zoomBox.active) {
            app.viewModel.deactivateZoomBox();
        }
        if( map.getZoom() < 5)
        {
            map.zoomTo(5);
        }
        if (map.getZoom() > 13)
        {
            map.zoomTo(13);
        }
        app.viewModel.zoomLevel(map.getZoom());
        /*if ( app.viewModel.activeLayers().length ) {
            $.each(app.viewModel.activeLayers(), function(index, layer) {
                if (layer.name === 'Aids to Navigation') {
                    var zoom = map.getZoom();
                    if (zoom < 10) {
                        layer.legend = layer.legend.substring(0, layer.legend.lastIndexOf('/')+1) + 'legend_1_Level0_9.png'
                    } else if (zoom === 10) {
                        layer.legend = layer.legend.substring(0, layer.legend.lastIndexOf('/')+1) + 'legend_2_Level10.png'
                    } else if (zoom === 11) {
                        layer.legend = layer.legend.substring(0, layer.legend.lastIndexOf('/')+1) + 'legend_3_Level11.png'
                    } else {
                        layer.legend = layer.legend.substring(0, layer.legend.lastIndexOf('/')+1) + 'legend_4_Level12_13.png'
                    }
                }
            });

        }*/
    });

    // map.addControl(new OpenLayers.Control.MousePosition({
    //     element: document.getElementById('pos')
    // }));

    map.events.register("moveend", null, function () {
        // update the url when we move
        app.updateUrl();
    });

    /*
    // callback functions for vector attribution (SelectFeature Control)
    var report = function(e) {
        var layer = e.feature.layer.layerModel;

        if ( layer.attributes.length ) {
            var attrs = layer.attributes,
                title = layer.name,
                text = [];
            app.viewModel.attributeTitle(title);
            for (var i=0; i<attrs.length; i++) {
                if ( e.feature.data[attrs[i].field] ) {
                    text.push({'display': attrs[i].display, 'data': e.feature.data[attrs[i].field]});
                }
            }
            app.viewModel.attributeData(text);
        }
    };
    */
    /*
    var clearout = function(e) {
        //document.getElementById("output").innerHTML = "";
        app.viewModel.attributeTitle(false);
        app.viewModel.attributeData(false);
    };
    */

    app.map = map;

    app.map.attributes = [];
    //app.map.clickOutput = { time: 0, attributes: [] };
    app.map.clickOutput = { time: 0, attributes: {} };

    //UTF Attribution
    app.map.UTFControl = new OpenLayers.Control.UTFGrid({
        //attributes: layer.attributes,
        layers: [],
        //events: {fallThrough: true},
        handlerMode: 'click',
        callback: function(infoLookup, lonlat, xy) {
            app.map.utfGridClickHandling(infoLookup, lonlat, xy);
        }
    });
    map.addControl(app.map.UTFControl);

    app.map.utfGridClickHandling = function(infoLookup, lonlat, xy) {
        var clickAttributes = {};

        for (var idx in infoLookup) {
            $.each(app.viewModel.visibleLayers(), function (layer_index, potential_layer) {
              if (potential_layer.type !== 'Vector') {
                var new_attributes,
                    info = infoLookup[idx];
                //debugger;
                if (info && info.data) {
                    var newmsg = '',
                        hasAllAttributes = true,
                        parentHasAllAttributes = false;
                    // if info.data has all the attributes we're looking for
                    // we'll accept this layer as the attribution layer
                    //if ( ! potential_layer.attributes.length ) {
                    if (potential_layer.attributes.length) {
                        hasAllAttributes = true;
                    } else {
                        hasAllAttributes = false;
                    }
                    //}
                    $.each(potential_layer.attributes, function (attr_index, attr_obj) {
                        if ( !(attr_obj.field in info.data) ) {
                            hasAllAttributes = false;
                        }
                    });
                    if ( !hasAllAttributes && potential_layer.parent) {
                        parentHasAllAttributes = true;
                        if ( ! potential_layer.parent.attributes.length ) {
                            parentHasAllAttributes = false;
                        }
                        $.each(potential_layer.parent.attributes, function (attr_index, attr_obj) {
                            if ( !(attr_obj.field in info.data) ) {
                                parentHasAllAttributes = false;
                            }
                        });
                    }
                    if (hasAllAttributes) {
                        new_attributes = potential_layer.attributes;
                    } else if (parentHasAllAttributes) {
                        new_attributes = potential_layer.parent.attributes;
                    }

                    if (new_attributes) {
                        var attribute_objs = [];
                        $.each(new_attributes, function(index, obj) {
                            if ( potential_layer.compress_attributes ) {
                                var display = obj.display + ': ' + info.data[obj.field];
                                attribute_objs.push({'display': display, 'data': ''});
                            } else {
                                /*** SPECIAL CASE FOR ENDANGERED WHALE DATA ***/
                                var value = info.data[obj.field];
                                if (value === 999999) {
                                    attribute_objs.push({'display': obj.display, 'data': 'No Survey Effort'});
                                } else {
                                    try {
                                        //set the precision and add any necessary commas
                                        value = value.toFixed(obj.precision);
                                        value = app.utils.numberWithCommas(value);
                                    }
                                    catch (e) {
                                        //keep on keeping on
                                    }
                                    attribute_objs.push({'display': obj.display, 'data': value});
                                }
                            }
                        });
                        var title = potential_layer.featureAttributionName,
                            text = attribute_objs;
                        if ( potential_layer.name === 'OCS Lease Blocks' ) {
                            text = app.viewModel.getOCSAttributes(info.data);
                        } else if ( potential_layer.name === 'Sea Turtles' ) {
                            text = app.viewModel.getSeaTurtleAttributes(info.data);
                        } else if ( potential_layer.name === 'Toothed Mammals (All Seasons)' ) {
                            text = app.viewModel.getToothedMammalAttributes(info.data);
                        } else if ( potential_layer.name === 'Wind Speed' ) {
                            text = app.viewModel.getWindSpeedAttributes(info.data);
                        } else if ( potential_layer.name === 'BOEM Wind Planning Areas' ) {
                            text = app.viewModel.getWindPlanningAreaAttributes(info.data);
                        } else if ( potential_layer.name === 'Party & Charter Boat' ) {
                            text = app.viewModel.adjustPartyCharterAttributes(attribute_objs);
                        } else if ( potential_layer.name === 'Port Commodity (Points)' ) {
                            text = app.viewModel.getPortCommodityAttributes(info.data);
                        } else if ( potential_layer.name === 'Port Commodity' ) {
                            text = app.viewModel.getPortCommodityAttributes(info.data);
                        } else if ( potential_layer.name === 'Port Ownership (Points)' ) {
                            text = app.viewModel.getPortOwnershipAttributes(info.data);
                        } else if ( potential_layer.name === 'Port Ownership' ) {
                            text = app.viewModel.getPortOwnershipAttributes(info.data);
                        } else if ( potential_layer.name === 'Maintained Channels') {
                            text = app.viewModel.getChannelAttributes(info.data);
                        } else if ( potential_layer.name === 'Essential Fish Habitats') {
                            text = app.viewModel.getEFHAttributes(info.data);
                        } else if ( title === 'Benthic Habitats (North)' || title === 'Benthic Habitats (South)' ) {
                            title = 'Benthic Habitats';
                        }
                        clickAttributes[title] = [{
                            'name': 'Feature',
                            'id': potential_layer.featureAttributionName + '-0',
                            'attributes': text
                        }];
                        //app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                    }
                }
              }
            });

            $.extend(app.map.clickOutput.attributes, clickAttributes);
            app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);

        }
        app.viewModel.updateMarker(lonlat);
        //app.marker.display(true);

    }; //end utfGridClickHandling

    app.map.events.register(layerModel && "featureclick", null, function(e, test) {
        var layer = e.feature.layer.layerModel || e.feature.layer.scenarioModel;
        if (layer) {
            var text = [],
                title = layer.featureAttributionName;

            if ( layer.scenarioAttributes && layer.scenarioAttributes.length ) {
                var attrs = layer.scenarioAttributes;
                for (var i=0; i<attrs.length; i++) {
                    text.push({'display': attrs[i].title, 'data': attrs[i].data});
                }
            } else if ( layer.attributes.length ) {
                var attrs = layer.attributes;

                for (var i=0; i<attrs.length; i++) {
                    if ( e.feature.data[attrs[i].field] ) {
                        text.push({'display': attrs[i].display, 'data': e.feature.data[attrs[i].field]});
                    }
                }
            }

            // the following delay prevents the #map click-event-attributes-clearing from taking place after this has occurred
            setTimeout( function() {
                if (text.length) {
                    app.map.clickOutput.attributes[layer.featureAttributionName] = [{
                      'name': 'Feature',
                      'id': layer.featureAttributionName + '-0',
                      'attributes':text
                    }];
                    app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                    app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.event.xy));
                }
                // if (app.marker) {
                    // app.marker.display(true);
                // }
            }, 100);

        }

    });//end featureclick event registration

    //mouseover events
    app.map.events.register("featureover", null, function(e, test) {
        var feature = e.feature,
            layerModel = e.feature.layer.layerModel;

        if (layerModel && layerModel.attributeEvent === 'mouseover') {
                if (app.map.popups.length) {

                    if ( feature.layer.getZIndex() >= app.map.currentPopupFeature.layer.getZIndex() ) {
                        app.map.currentPopupFeature.popup.hide();
                        app.map.createPopup(feature);
                        app.map.currentPopupFeature = feature;
                    } else {
                        app.map.createPopup(feature);
                        feature.popup.hide();
                    }

                } else {
                    app.map.createPopup(feature);
                    app.map.currentPopupFeature = feature;
                }
        }

    });

    app.map.addControl(
        new OpenLayers.Control.MousePosition({
            prefix: 'Lat: ',
            separator: ', Long: ',
            numDigits: 3,
            emptyString: '',
            //OL-2 likes to spit out lng THEN lat
            //lets reformat that
            formatOutput: function(lonLat) {
                var digits = parseInt(this.numDigits);
                var newHtml =
                    this.prefix +
                    lonLat.lat.toFixed(digits) +
                    this.separator +
                    lonLat.lon.toFixed(digits) +
                    this.suffix;
                return newHtml;
            },
        })
    );


    //mouseout events
    app.map.events.register("featureout", null, function(e, test) {
        var feature = e.feature,
            layerModel = e.feature.layer.layerModel;

        if (layerModel && layerModel.attributeEvent === 'mouseover') {
            //app.map.destroyPopup(feature);
            app.map.removePopup(feature.popup);
            if (app.map.popups.length && !app.map.anyVisiblePopups()) {
                var hiddenPopup = app.map.popups[app.map.popups.length-1];
                hiddenPopup.show();
                app.map.currentPopupFeature = hiddenPopup.feature;
            }
        }

    });

    app.map.createPopup = function(feature) {
        var mouseoverAttribute = feature.layer.layerModel.mouseoverAttribute,
            attributeValue = mouseoverAttribute ? feature.attributes[mouseoverAttribute] : feature.layer.layerModel.name,
            location = feature.geometry.getBounds().getCenterLonLat();

        if ( ! app.map.getExtent().containsLonLat(location) ) {
            location = app.map.center;
        }
        var popup = new OpenLayers.Popup.FramedCloud(
            "",
            location,
            new OpenLayers.Size(100,100),
            "<div>" + attributeValue + "</div>",
            null,
            false,
            null
        );
        popup.feature = feature;
        feature.popup = popup;
        app.map.addPopup(popup);
    };

    app.map.anyVisiblePopups = function() {
        for (var i=0; i<app.map.popups.length; i+=1) {
            if (app.map.popups[0].visible()) {
                return true;
            }
        }
        return false;
    };

    // app.map.destroyPopup = function(feature) {
    //     // remove tooltip
    //     app.map.removePopup(feature.popup);
    //     //feature.popup.destroy();
    //     //feature.popup=null;
    // }

    app.markers = new OpenLayers.Layer.Markers( "Markers" );
    var size = new OpenLayers.Size(16,25);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    app.markers.icon = new OpenLayers.Icon('/static/visualize/img/red-pin.png', size, offset);
    app.map.addLayer(app.markers);


    //no longer needed?
    //replaced with #map mouseup and move events in app.js?
    //place the marker on click events
    app.map.events.register("click", app.map , function(e){
        //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(e.xy));
        //the following is in place to prevent flash of marker appearing on what is essentially no feature click
        //display is set to true in the featureclick and utfgridclick handlers (when there is actually a hit)
        //app.marker.display(false);

        //the following ensures that the location of the marker is not displaced while waiting for web services
        app.map.clickLocation = app.map.getLonLatFromViewPortPx(e.xy);
    });

    app.map.removeLayerByName = function(layerName) {
        for (var i=0; i<app.map.layers.length; i++) {
            if (app.map.layers[i].name === layerName) {
                app.map.removeLayer(app.map.layers[i]);
                i--;
            }
        }
    };

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

    setTimeout( function() {
        if (app.mafmc) {
            map.removeLayer(openStreetMap);
            map.removeLayer(googleStreet);
            map.removeLayer(googleTerrain);
            map.removeLayer(googleSatellite);
        }
    }, 1000);


    app.menus = {}
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
};

app.addLayerToMap = function(layer) {
    if (!layer.layer) {
        if (layer.utfurl || (layer.parent && layer.parent.utfurl)) {
            app.addUtfLayerToMap(layer);
        } else if (layer.type === 'Vector') {
            app.addVectorLayerToMap(layer);
        } else if (layer.type === 'ArcRest') {
            app.addArcRestLayerToMap(layer);
        } else if (layer.type === 'WMS') {
            app.addWmsLayerToMap(layer);
        } else { //if XYZ with no utfgrid
            app.addXyzLayerToMap(layer);
        }
    }
    app.map.addLayer(layer.layer);
    layer.layer.opacity = layer.opacity();
    layer.layer.setVisibility(true);
};

// add XYZ layer with no utfgrid
app.addXyzLayerToMap = function(layer) {
    var opts = { displayInLayerSwitcher: false };

    // adding layer to the map for the first time
    layer.layer = new OpenLayers.Layer.XYZ(layer.name,
        layer.url,
        $.extend({}, opts,
            {
                sphericalMercator: true,
                isBaseLayer: false //previously set automatically when allOverlays was set to true, must now be set manually
            }
        )
    );
};

app.addWmsLayerToMap = function(layer) {
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
      if (layer.wms_srs != 'EPSG:3857') {
        wms_proxy = true;
        // var time_def_param_key = app.server_constants.time_def_param_key;
        wms_url = app.server_constants.wms_proxy_url;
        layer_params[app.server_constants.wms_proxy_mapfile_field] = app.server_constants.wms_proxy_mapfile
        layer_params[app.server_constants.source_srs_param_key] = layer.srs;
        layer_params[app.server_constants.conn_param_key] =  layer.url;
        layer_params[app.server_constants.layer_name_param_key] = layer.wms_slug;
        if (layer.wms_timing) {
          layer_params.layers = app.server_constants.proxy_time_layer;
          layer_params[app.server_constants.time_param_key] = layer.wms_timing;
          if (layer.wms_time_item) {
            layer_params[app.server_constants.time_item_param_key] = layer.wms_time_item;
          }
        } else {
          layer_params.layers = app.server_constants.proxy_generic_layer;
        }
        layer_params[app.server_constants.format_param_key] = layer.wms_format;
        layer_params[app.server_constants.version_param_key] = layer.wms_version;
        layer_params[app.server_constants.style_param_key] = layer.wms_styles;
      }
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

    layer.layer = new OpenLayers.Layer.WMS(
        layer.name,
        wms_url,
        layer_params
    );
};

app.addArcRestLayerToMap = function(layer) {
    if (layer.url){
      var identifyUrl = layer.url.replace('export', layer.arcgislayers + '/query');
    } else {
      var identifyUrl = '';
    }

    layer.arcIdentifyControl = new OpenLayers.Control.ArcGisRestIdentify(
    {
        eventListeners: {
            arcfeaturequery: function() {
                //if ( ! layer.attributesFromWebServices || layer.utfurl ) {
                if ( layer.utfurl ) { // || layer.name === 'Offshore Wind Compatibility Assessments' ) {
                    return false;
                }
            },
            //the handler for the return click data
            resultarrived : function(responseText) {
                var clickAttributes = {},
                    jsonFormat = new OpenLayers.Format.JSON(),
                    returnJSON = jsonFormat.read(responseText.text);

                //data manager opted to disable via DAI
                if (layer.disable_click) {
                    return false;
                }

                if(returnJSON['features'] && returnJSON['features'].length) {

                    var report_features = []
                    $.each(returnJSON['features'], function(index, feature) {
                        var attributeObjs = [];
                        var attributeList = feature['attributes'];

                        if('fields' in returnJSON) {
                            if (layer.attributes.length) {
                                for (var i=0; i<layer.attributes.length; i+=1) {
                                    if (attributeList[layer.attributes[i].field]) {
                                        var data = attributeList[layer.attributes[i].field],
                                            field_obj = app.utils.getObjectFromList(returnJSON['fields'], 'name', layer.attributes[i].field);
                                        if (field_obj && field_obj.type === 'esriFieldTypeDate') {
                                            data = new Date(data).toDateString();
                                        } else if (app.utils.isNumber(data)) {
                                            data = app.utils.formatNumber(data);
                                        }
                                        if (data && app.utils.trim(data) !== "") {
                                            attributeObjs.push({
                                                'display': layer.attributes[i].display,
                                                'data': data
                                            });
                                        }
                                    }
                                }
                            } else {
                                $.each(returnJSON['fields'], function(fieldNdx, field) {
                                    if (field.name.indexOf('OBJECTID') === -1 && field.name.indexOf('CFR_id') === -1) {
                                        var data = attributeList[field.name]
                                        if (field.type === 'esriFieldTypeDate') {
                                            data = new Date(data).toDateString();
                                        } else if (app.utils.isNumber(data)) {
                                            data = app.utils.formatNumber(data);
                                        } else if (typeof(data) == 'string' && (data.indexOf('http') >= 0 || field.name.toLowerCase() == 'link' )) {
                                            // Make link attributes live!
                                            str_list = data.split('; ');
                                            if (str_list.length == 1) {
                                              str_list = data.split(' ');
                                            }
                                            for (var i=0; i < str_list.length; i++) {
                                              if (str_list[i].indexOf('http') < 0) {
                                                var list_addr = 'http://' + str_list[i];
                                              } else {
                                                var list_addr = str_list[i];
                                              }
                                              link_string = '<a href="' + list_addr + '" target="_blank">' + str_list[i] + '</a>';
                                              str_list[i] = link_string;
                                            }
                                            data = str_list.join(' ');
                                        }
                                        if (data && app.utils.trim(data) !== "") {
                                            attributeObjs.push({
                                                'display': field.alias,
                                                'data': data
                                            });
                                        }
                                    }
                                });
                            }
                        }
                        report_features.push({
                          'name': 'Feature ' + (index+1),
                          'id': layer.featureAttributionName + '-' + index,
                          'attributes': attributeObjs
                        })
                        return;
                    });
                    if ( layer.name === 'Aids to Navigation' ) {
                        app.viewModel.adjustAidsToNavigationAttributes(report_features[0].attributes);
                    }
                }

                if (report_features && report_features.length) {
                    clickAttributes[layer.featureAttributionName] = report_features;
                    $.extend(app.map.clickOutput.attributes, clickAttributes);
                    app.viewModel.aggregatedAttributes(app.map.clickOutput.attributes);
                    //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
                    //the following ensures that the location of the marker has not been displaced while waiting for web services
                    app.viewModel.updateMarker(app.map.clickLocation);
                }
            }
        },
        url : identifyUrl,
        layerid : layer.arcgislayers,
        sr : 3857,
        clickTolerance: 2,
        outFields: '*'
    });
    app.map.addControl(layer.arcIdentifyControl);

    layer.layer = new OpenLayers.Layer.ArcGIS93Rest(
        layer.name,
        layer.url,
        {
            layers: "show:"+layer.arcgislayers,
            srs: 'EPSG:3857',
            transparent: true
        },
        {
            isBaseLayer: false
        }
    );
};

app.addVectorLayerToMap = function(layer) {
    if (layer.annotated) { // such as the canyon labels in the mafmc project
        var styleMap = new OpenLayers.StyleMap( {
            label: "${NAME}",
            fontColor: "#333",
            fontSize: "12px",
            fillColor: layer.color,
            fillOpacity: layer.fillOpacity,
            //strokeDashStyle: "dash",
            //strokeOpacity: 1,
            strokeColor: layer.color,
            strokeOpacity: layer.defaultOpacity,
            //strokeLinecap: "square",
            //http://dev.openlayers.org/apidocs/files/OpenLayers/Feature/Vector-js.html
            //title: 'testing'
            pointRadius: layer.point_radius,
            externalGraphic: layer.graphic,
            graphicWidth: 8,
            graphicHeight: 8,
            graphicOpacity: layer.defaultOpacity
        });
    } else {
        var styleMap = new OpenLayers.StyleMap( {
            fillColor: layer.color,
            fillOpacity: layer.fillOpacity,
            //strokeDashStyle: "dash",
            //strokeOpacity: 1,
            strokeColor: layer.outline_color,
            strokeOpacity: layer.outline_opacity,
            //strokeLinecap: "square",
            //http://dev.openlayers.org/apidocs/files/OpenLayers/Feature/Vector-js.html
            //title: 'testing'
            pointRadius: layer.point_radius,
            externalGraphic: layer.graphic,
            graphicWidth: 8,
            graphicHeight: 8,
            graphicOpacity: layer.defaultOpacity
        });
    }
    if (layer.name === 'Coral Protection Mockups') {
        /*styleMap.styles['default']['defaultStyle']['label'] = '${NAME}';
        styleMap.styles['default']['defaultStyle']['fontColor'] = "red";
        styleMap.styles['default']['defaultStyle']['fontSize'] = "14px";
        styleMap.styles['default']['defaultStyle']['labelAlign'] = "cm";
        styleMap.styles['default']['defaultStyle']['labelOutlineColor'] = "white";
        styleMap.styles['default']['defaultStyle']['labelOutlineWidth'] = 3;*/
    }
    if (layer.lookupField) {
        var mylookup = {};
        $.each(layer.lookupDetails, function(index, details) {
            var fillOp = 0.5;
            //the following are special cases for Shipping Lanes that ensure suitable attribution with proper display
            if (details.value === 'Precautionary Area') {
                fillOp = 0.0;
            } else if (details.value === 'Shipping Safety Fairway') {
                fillOp = 0.0;
            } else if (details.value === 'Traffic Lane') {
                fillOp = 0.0;
            }
            mylookup[details.value] = {
                strokeColor: details.color,
                strokeDashstyle: details.dashstyle,
                fill: details.fill,
                fillColor: details.color,
                fillOpacity: fillOp,
                externalGraphic: details.graphic
            };
            /*special case for Discharge Flow
            if (layer.lookupField === "Flow") {
                mylookup[details.value] = {
                    strokeColor: layer.color,
                    pointRadius: details.value * 5
                };
                console.log(mylookup);
            }*/
        });
        styleMap.addUniqueValueRules("default", layer.lookupField, mylookup);
        //styleMap.addUniqueValueRules("select", layer.lookupField, mylookup);
    }
    layer.layer = new OpenLayers.Layer.Vector(
        layer.name,
        {
            projection: new OpenLayers.Projection('EPSG:3857'),
            displayInLayerSwitcher: false,
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                url: layer.url,
                format: new OpenLayers.Format.GeoJSON()
            }),
            styleMap: styleMap,
            layerModel: layer,
            // set minZoom to 9 for annotated layers, set minZoom to some much smaller zoom level for non-annotated layers
            scales: layer.annotated ? [1000000, 1] : [90000000, 1],
            units: 'm'
        }
    );

};

app.addUtfLayerToMap = function(layer) {
    var opts = { displayInLayerSwitcher: false };
    layer.utfgrid = new OpenLayers.Layer.UTFGrid({
        layerModel: layer,
        url: layer.utfurl ? layer.utfurl : layer.parent.utfurl,
        sphericalMercator: true,
        //events: {fallThrough: true},
        utfgridResolution: 4, // default is 2
        displayInLayerSwitcher: false,
        useJSONP: false
    });

    app.map.addLayer(layer.utfgrid);

    if (layer.type === 'ArcRest') {
        app.addArcRestLayerToMap(layer);
    } else if (layer.type === 'XYZ') {
        //maybe just call app.addXyzLayerToMap(layer)
        app.addXyzLayerToMap(layer);
        /*
        layer.layer = new OpenLayers.Layer.XYZ(
            layer.name,
            layer.url,
            $.extend({}, opts,
                {
                    sphericalMercator: true,
                    isBaseLayer: false //previously set automatically when allOverlays was set to true, must now be set manually
                }
            )
        );
        */
    } else {
        //debugger;
    }
};

app.setLayerVisibility = function(layer, visibility) {
    // if layer is in openlayers, hide/show it
    if (layer.layer) {
        layer.layer.setVisibility(visibility);
    }
};

app.setLayerZIndex = function(layer, index) {
    layer.layer.setZIndex(index);
};


app.reCenterMap = function () {
    app.map.setCenter(new OpenLayers.LonLat(app.state.x, app.state.y).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), 7);
};
