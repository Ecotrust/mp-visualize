function layerModel(options, parent) {
    var self = this,
        $descriptionTemp;

    // properties
    self.id = options.id || null;
    self.name = options.name || null;
    self.featureAttributionName = self.name;
    self.order = options.order;
    self.url = options.url || null;
    self.data_url = options.data_url || null;
    self.arcgislayers = options.arcgis_layers || 0;
    self.wms_slug = options.wms_slug || null;
    self.wms_version = options.wms_version || null;
    self.wms_format = options.wms_format || null;
    self.wms_srs = options.wms_srs || null;
    self.wms_styles = options.wms_styles || null;
    self.wms_timing = options.wms_timing || null;
    self.wms_time_item = options.wms_time_item || null;
    self.wms_additional = options.wms_additional || null;
    self.type = options.type || null
    self.utfurl = options.utfurl || false;
    self.legend = options.legend || false;
    self.legendVisibility = ko.observable(false);
    self.legendTitle = options.legend_title || false;
    self.legendSubTitle = options.legend_subtitle || false;
    self.themes = ko.observableArray();
    self.attributes = options.attributes ? options.attributes.attributes : [];
    self.compress_attributes = options.attributes ? options.attributes.compress_attributes : false;
    self.attributeEvent = options.attributes ? options.attributes.event : [];
    self.mouseoverAttribute = options.attributes ? options.attributes.mouseover_attribute : false;
    self.lookupField = options.lookups ? options.lookups.field : null;
    self.lookupDetails = options.lookups ? options.lookups.details : [];
    self.color = options.color || "#ee9900";
    self.outline_color = options.outline_color || self.color;
    self.fillOpacity = options.fill_opacity || 0.0;
    self.query_by_point = options.query_by_point || false;
    self.disable_click = options.disable_arcgis_attributes || false;
    self.description = ko.observable();

    if ( options.opacity === 0 ) {
        self.defaultOpacity = options.opacity;
    } else {
        self.defaultOpacity = options.opacity || 0.5;
    }
    self.opacity = ko.observable(self.defaultOpacity);
    self.outline_opacity = options.outline_opacity || self.defaultOpacity;
    self.point_radius = options.point_radius || 2;
    self.graphic = options.graphic || null;
    self.annotated = options.annotated || false;

    self.isDisabled = ko.observable(false);
    if (options.is_disabled) {
        self.isDisabled(options.is_disabled);
    }
    self.disabledMessage = ko.observable(false);
    if (options.disabled_message) {
        self.disabledMessage(options.disabled_message);
    }
    if (self.annotated && app.viewModel.zoomLevel() < 9) {
        self.isDisabled(true);
        self.disabledMessage(options.disabled_message);
    }

    //on-the-fly session layers
    self.wmsSession = ko.observable(false);
    if (options.wmsSession) {
        self.wmsSession(options.wmsSession)
    }

    // mdat/marine life layers
    self.isMDAT = options.isMDAT || false;
    self.parentMDATDirectory = options.parentDirectory || null;

    // VTR/CAS life layers
    self.isVTR = options.isVTR || false;
    self.dateRangeDirectory = options.dateRangeDirectory || null;

    //tied to the layer that's a companion of another layer
    self.companionLayers = options.companion_layers || false;
    //has companion layer(s)
    self.hasCompanion = options.has_companion || false;

    self.is_multilayer_parent = options.is_multilayer_parent || false;
    self.is_multilayer = ko.observable((options.is_multilayer && !options.is_multilayer_parent) || false);
    self.is_visible_multilayer = ko.observable(false);

    self.associated_multilayers = options.associated_multilayers || [];
    self.dimensions = options.dimensions || [];
    self.multilayerValueLookup = {};
    self.activeMultilayer = false;
    self.multilayerSliderState = [];

    self.searchQueryable = options.search_query || false;

    app.viewModel.zoomLevel.subscribe( function() {
        if (self.annotated && app.viewModel.zoomLevel() < 9) {
            self.isDisabled(true);
            self.disabledMessage(options.disabled_message);
            $('.annotated.disabled').popover({
                delay: {'show': 500},
                trigger: 'hover'//,
                //template: '<div class="popover layer-popover"><div class="arrow"></div><div class="popover-inner layer-tooltip"><div class="popover-content"><p></p></div></div></div>'
            });
        } else if (self.annotated && app.viewModel.zoomLevel() >= 9) {
            self.isDisabled(false);
            self.disabledMessage(false);
            $('.annotated').popover('destroy');
        }
    });

    //these are necessary to prevent knockout errors when offering non-designs in Active panel
    self.sharedBy = ko.observable(false);
    self.sharedWith = ko.observable(false);
    self.selectedGroups = ko.observableArray();
    self.shared = ko.observable(false);

    if (self.featureAttributionName === 'OCS Lease Blocks') {
        self.featureAttributionName = 'OCS Lease Blocks';
    } else if (self.featureAttributionName === 'Party & Charter Boat') {
        self.featureAttributionName = 'Party & Charter Boat Trips';
    } else if (self.featureAttributionName === 'Benthic Habitats (North)' ) {
        self.featureAttributionName = 'Benthic Habitats';
    } else if (self.featureAttributionName === 'Benthic Habitats (South)' ) {
        self.featureAttributionName = 'Benthic Habitats';
    }

    getArcGISJSONLegend = function(self, protocol) {
      if (self.url.indexOf('?') < 0) {
        var url = self.url.replace('/export', '/legend/?f=pjson');
      } else {
        var url = self.url.split('?').join('&').replace('/export', '/legend/?f=pjson');
      }
      if (protocol == "https:") {
        url = url.replace('http:', 'https:');
      }
      $.ajax({
          dataType: "json",
          url: url,
          type: 'GET',
          success: function(data) {
              if (data['layers']) {
                  $.each(data['layers'], function(i, layerobj) {
                      if (parseInt(layerobj['layerId'], 10) === parseInt(self.arcgislayers, 10)) {
                          self.legend = {'elements': []};
                          $.each(layerobj['legend'], function(j, legendobj) {
                              var swatchURL = self.url.replace('/export', '/'+self.arcgislayers+'/images/'+legendobj['url']),
                                  label = legendobj['label'];
                              if (j < 1 && label === "") {
                                  label = layerobj['layerName'];
                              }
                              self.legend['elements'].push({'swatch': swatchURL, 'label': label});
                              //console.log(self.legend);
                          });
                      }
                  });
                  //reset visibility (to reset activeLegendLayers)
                  var visible = self.visible();
                  self.visible(false);
                  self.visible(visible);
              } else {
                  //debugger;
              }
          }
      });
    }

    //legends for actual WMS LAYERS
    if (!self.legend && self.url && self.type=='WMS' && self.wms_slug && self.wms_version) {
        self.legend = self.url + 'SERVICE=WMS&VERSION=' +
                      self.wms_version + '&layer=' +
                      self.wms_slug +
                      "&REQUEST=GetLegendGraphic&FORMAT=image/png"
    }

    // set target blank for all links
    if (options.description) {
        $descriptionTemp = $("<div/>", {
            html: options.description
        });
        $descriptionTemp.find('a').each(function() {
            $(this).attr('target', '_blank');
        });
        self.description($descriptionTemp.html());
    } else {
        self.description(null);
    }

    // set overview text for Learn More option
    if (options.overview) {
        $overviewTemp = $("<div/>", {
            html: options.overview
        });
        $overviewTemp.find('a').each(function() {
            $(this).attr('target', '_blank');
        });
        self.overview = $overviewTemp.html();
    } else if (parent && parent.overview) {
        self.overview = parent.overview;
    } else if (self.description()) {
        self.overview = self.description();
    } else if (parent && parent.description()) {
        self.overview = parent.description();
    } else {
        self.overview = null;
    }

    getArcGISJSONDescription = function(self, protocol) {
      var url = self.url.replace('/export', '/'+self.arcgislayers) + '?f=pjson';
      if (protocol == "https:") {
        url = url.replace('http:', 'https:');
      }
      $.ajax({
          dataType: "jsonp",
          url: url,
          type: 'GET',
          success: function(data) {
            if (data['description']) {
              if (!self.overview) {
                self.overview = data['description'];
              }
              // RDH 09-06-2018
              // I added the below code, but cannot find any proof that the Mid-A team
              // WANTS auto-pulling of description if not provided explicitly.
              // This logic would also have to be applied to the data-catalog as well.
              // if (!self.description()) {
              //   self.description(data['description']);
              // }
            }
          }
      });
    }

    // set data source and data notes text
    self.data_source = options.data_source || null;
    if (! self.data_source && parent && parent.data_source) {
        self.data_source = parent.data_source;
    }
    self.data_notes = options.data_notes || null;
    if (! self.data_notes && parent && parent.data_notes) {
        self.data_notes = parent.data_notes;
    }

    // set download links
    self.kml = options.kml || null;
    self.data_download = options.data_download || null;
    self.learn_more = options.learn_more || null;
    self.metadata = options.metadata || null;
    self.source = options.source || null;
    self.tiles = options.tiles || null;

    // opacity
    self.opacity.subscribe(function(newOpacity) {
        if (self.layer.CLASS_NAME === "OpenLayers.Layer.Vector") {
            self.layer.styleMap.styles['default'].defaultStyle.strokeOpacity = newOpacity;
            self.layer.styleMap.styles['default'].defaultStyle.graphicOpacity = newOpacity;
            //fill is currently turned off for many of the vector layers
            //the following should not override the zeroed out fill opacity
            //however we do still need to account for shipping lanes (in which styling is handled via lookup)
            if (self.fillOpacity > 0) {
                var newFillOpacity = self.fillOpacity - (self.defaultOpacity - newOpacity);
                self.layer.styleMap.styles['default'].defaultStyle.fillOpacity = newFillOpacity;
            }
            self.layer.redraw();
        } else {
            self.layer.setOpacity(newOpacity);
        }
        if (self.activeMultilayer) {
          self.activeMultilayer.opacity(newOpacity);
        }
    });

    // is description active
    self.infoActive = ko.observable(false);

    // is the layer a checkbox layer
    self.isCheckBoxLayer = ko.observable(false);
    if (self.type === 'checkbox') {
        self.isCheckBoxLayer(true);
    }

    // is the layer in the active panel?
    self.active = ko.observable(false);
    // is the layer visible?
    self.visible = ko.observable(false);

    self.activeSublayer = ko.observable(false);
    self.visibleSublayer = ko.observable(false);

    self.subLayers = [];

    // save a ref to the parent, if it exists
    if (parent) {
        self.parent = parent;
        self.fullName = self.parent.name + " (" + self.name + ")";
        if ( ! self.legendTitle ) {
            self.legendTitle = self.parent.legendTitle;
        }
        if ( ! self.legendSubTitle ) {
            self.legendSubTitle = self.parent.legendSubTitle;
        }
    } else {
        self.fullName = self.name;
    }


    self.toggleLegendVisibility = function() {
        var layer = this;
        layer.legendVisibility(!layer.legendVisibility());
    };

    self.hasVisibleSublayers = function() {
        if ( !self.subLayers ) {
            return false;
        }
        var visibleSubLayers = false;
        $.each(self.subLayers, function(i, sublayer) {
            if (sublayer.visible()) {
                visibleSubLayers = true;
            }
        });
        return visibleSubLayers;
    };

    self.deactivateLayer = function(is_companion) {
        var layer = this;

        if (typeof is_companion == 'undefined' || is_companion == false) {
          //de-activate companion layer should happen prior to base
          if (layer.hasCompanion) {
            self.deactivateCompanion();
          }
        }
        //deactivate layer
        self.deactivateBaseLayer();

        //remove related utfgrid layer
        if (layer.utfgrid) {
            self.deactivateUtfGridLayer();
        }
        //remove parent layer
        if (layer.parent) {
            self.deactivateParentLayer();
        }
        //remove sublayer
        if (layer.activeSublayer()) {
            self.deactivateSublayer();
        }

        //de-activate arcIdentifyControl (if applicable)
        if (layer.arcIdentifyControl) {
            layer.arcIdentifyControl.deactivate();
        }

        if (layer.is_multilayer_parent && layer.dimensions.length > 0){
          self.deactivateMultiLayers();
        }

        layer.layer = null;

    };

    // called from deactivateLayer
    self.deactivateBaseLayer = function() {
        var layer = this;
        // remove from active layers
        app.viewModel.activeLayers.remove(layer);

        //remove the key/value pair from aggregatedAttributes
        app.viewModel.removeFromAggregatedAttributes(layer.name);

        layer.active(false);
        layer.visible(false);

        app.setLayerVisibility(layer, false);
        layer.opacity(layer.defaultOpacity);

        if ($.inArray(layer.layer, app.map.layers) !== -1) {
            app.map.removeLayer(layer.layer);
        }
    };

    // called from deactivateLayer
    self.deactivateUtfGridLayer = function() {
        var layer = this;
        //NEED TO CHECK FOR PARENT LAYER HERE TOO...?
        //the following removes this layers utfgrid from the utfcontrol and prevents continued utf attribution on this layer
        app.map.UTFControl.layers.splice($.inArray(layer.utfgrid, app.map.UTFControl.layers), 1);
        app.map.removeLayer(layer.utfgrid);
    };

    // called from deactivateLayer
    self.deactivateParentLayer = function() {
        var layer = this;
        if (layer.parent && layer.parent.isCheckBoxLayer()) { // if layer has a parent and that layer is a checkbox layer
            // see if there are any remaining active sublayers in this checkbox layer
            var stillActive = false;
            $.each(layer.parent.subLayers, function(i, sublayer) {
                if ( sublayer.active() ) {
                    stillActive = true;
                }
            });
            // if there are no remaining active sublayers, then deactivate parent layer
            if (!stillActive) {
                layer.parent.active(false);
                layer.parent.activeSublayer(false);
                layer.parent.visible(false);
                layer.parent.visibleSublayer(false);
            }
            //check to see if any sublayers are still visible
            if (!layer.parent.hasVisibleSublayers()) {
                layer.parent.visible(false);
            }
        } else if (layer.parent) { // if layer has a parent
            // turn off the parent shell layer
            layer.parent.active(false);
            layer.parent.activeSublayer(false);
            layer.parent.visible(false);
            layer.parent.visibleSublayer(false);
        }
    };

    // called from deactivateLayer
    self.deactivateSublayer = function() {
        var layer = this;
        if ($.inArray(layer.activeSublayer().layer, app.map.layers) !== -1) {
            app.map.removeLayer(layer.activeSublayer().layer);
        }
        layer.activeSublayer().deactivateLayer();
        layer.activeSublayer(false);
        layer.visibleSublayer(false);
    };

    self.deactivateMultiLayers = function() {
      var layer = this;
      var multilayers = self.getMultilayerIds(layer.associated_multilayers, []);
      for (var i = 0; i < multilayers.length; i++) {
        mlayer = app.viewModel.getLayerById(multilayers[i]);
        if (mlayer) {
          mlayer.deactivateLayer();
        }
      }
    }

    self.reorderMultilayers = function() {

      // thanks JSPerf via digiguru @ https://stackoverflow.com/a/7180095/706797
      Array.prototype.move = function(from, to) {
          this.splice(to, 0, this.splice(from, 1)[0]);
      };

      // Get list of active layers minus 'multilayers'
      var visibleLayers = [];
      for (var i=0; i < app.viewModel.activeLayers().length; i++) {
        layer = app.viewModel.activeLayers()[i];
        if (!layer.is_multilayer()) {
          visibleLayers.push(layer);
        }
      }
      // Get index of self in this list
      var toIndex = visibleLayers.indexOf(self);
      var fromIndex = app.viewModel.activeLayers().indexOf(self);
      // For self and then each multilayer, move to that index.
      app.viewModel.activeLayers().move(fromIndex, toIndex);

      var multilayers = self.getMultilayerIds(layer.associated_multilayers, []);
      for (var i=0; i<multilayers.length; i++) {
        var multilayer = multilayers[i];
        fromIndex = app.viewModel.activeLayers().indexOf(multilayer);
        app.viewModel.activeLayers().move(fromIndex, toIndex);
      }
    }

    //deactivate all layers within a queryable mdat directory
    self.deactivateMDATDirectory = function() {
        var layerDir = this,
            layersArray = app.viewModel.activeLayers().slice(); //deep copy

        if (layerDir.visible()) {
            $.each(layersArray, function(i, l) {
                if (l.parentMDATDirectory && l.parentMDATDirectory.id == layerDir.id) {
                    l.deactivateBaseLayer();
                    if (l.companion.length > 0) {
                        l.deactivateCompanion();
                    }
                }
            });
            layerDir.visible(false);
            layerDir.showSublayers(false);
            return false;
        }
    };

    self.deactivateCompanion = function() {
        var layer = this,
            mdatDir = layer.parentMDATDirectory;
        //if queryable layers - deactivate companions
        if (mdatDir && mdatDir.searchQueryable) {
            $.each(layer.companion, function(i, ly) {
                ly.deactivateBaseLayer();
            })
        } else {
            var activeCompanionLayers = $.grep(app.viewModel.activeLayers(), function(c) {
                if (c.companionLayers) {
                  relatedCompanionLayers = $.grep(c.companionLayers, function(parentLayer) {
                    return parentLayer.id == layer.id;
                  })
                  return (relatedCompanionLayers.length) > 0;
                }
                return false
            });

            //is the companion layer still active?
            if (activeCompanionLayers.length == 0) {
                layer.deactivateBaseLayer();
                return false;

            //are there more than one layers active?
            } else if (app.viewModel.activeLayers().length > 1) {
                var companionArray = [];
                //find layers that have companions
                $.each(app.viewModel.activeLayers(), function(i,lyr) {
                    // do not include current layer
                    if (lyr.hasCompanion && lyr != layer) {
                        //ignore queryable MDATs
                        if (mdatDir && mdatDir.searchQueryable) {
                            companionArray;
                        } else {
                            companionArray.push(lyr.id)
                        }
                    }
                });

                //Get IDs of all active layers that aren't the current layer
                var activeLayers = app.viewModel.activeLayers();
                var activeLayerIds = [];
                for (var i = 0; i < activeLayers.length; i++) {
                  if (activeLayers[i] != layer) {
                    activeLayerIds.push(activeLayers[i]);
                  }
                }
                // for each companion layer to this current layer
                for (var i = 0; i < activeCompanionLayers.length; i++){
                  var companionLayer = activeCompanionLayers[i];
                  // if only 1 parent layer, then it's this layer
                  if (companionLayer.companionLayers.length == 1) {
                    companionLayer.deactivateLayer(true);
                  } else {
                    var companionLayerActivelyShared = false;
                    for (var j = 0; j < companionLayer.companionLayers.length; j++) {
                      if (activeLayerIds.indexOf(companionLayer.companionLayers[j].id) >= 0){
                        companionLayerActivelyShared = true;
                      }
                    }
                    if (!companionLayerActivelyShared) {
                      companionLayer.deactivateLayer(true);
                    }
                  }
                }
            // if no other layer is active - it's the companion layer, so let's remove it
            } else if (app.viewModel.activeLayers().length == 1) {
                app.viewModel.activeLayers()[0].deactivateBaseLayer();
            }
        }

    };

    // layer tracking Google Analytics
    self.trackLayer = function(action) {
        ga('send', 'event', 'Layers Activated', action);
    };

    self.activateLayer = function(is_companion) {
        var layer = this;

        // if legend is not provided, try using legend from web services
        if ( !self.legend && self.url && (self.arcgislayers !== -1) ) {
          try {
            getArcGISJSONLegend(self, window.location.protocol);
          } catch (err) {
            if (window.location.protocol == "http:") {
              console.log(err);
            } else {
              getArcGISJSONLegend(self, "http:");
            }
          }

        }

        if (!layer.active() && layer.type !== 'placeholder' && !layer.isDisabled()) {

            self.activateBaseLayer();

            // save reference in parent layer
            if (layer.parent) {
                self.activateParentLayer();
            }

            //add utfgrid if applicable
            if (layer.utfgrid) {
                self.activateUtfGridLayer();
            }

            //activate arcIdentifyControl (if applicable)
            if (layer.arcIdentifyControl) {
                layer.arcIdentifyControl.activate();
            }

            //activate marine life layers
            if (layer.isMDAT) {
                self.parentMDATDirectory.visible(true);
            }

            if (layer.isVTR) {
                self.visible(true);
            }

            if (typeof is_companion == "undefined" || is_companion == false) {
              //activate companion layers
              if (layer.hasCompanion) {
                if (layer.parentMDATDirectory) {
                  if (!layer.parentMDATDirectory.searchQueryable) {
                    self.activateCompanionLayer()
                  }
                } else {
                  self.activateCompanionLayer();
                }
              }
            }

            //activate multilayer groups
            if (layer.is_multilayer_parent && layer.dimensions.length > 0){
              self.activateMultiLayers();
              self.buildMultilayerValueLookup();
            }

            self.trackLayer(layer.name);
        }
    };

    // called from activateLayer
    self.activateBaseLayer = function() {
        var layer = this;

        app.addLayerToMap(layer);

        //now that we no longer use the selectfeature control we can simply do the following
        //if (app.map.getLayersByName('Canyon Labels').length > 0) {
        if (app.viewModel.activeLayers().length > 0 && app.viewModel.activeLayers()[0].name === 'Canyon Labels') {
            app.viewModel.activeLayers.splice(1, 0, layer);
        } else {
            app.viewModel.activeLayers.unshift(layer);
        }

        // set the active flag
        layer.active(true);
        layer.visible(true);
    };

    // called from activateLayer
    self.activateParentLayer = function() {
        var layer = this;

        if (layer.parent.type === 'radio' && layer.parent.activeSublayer()) {
            // only allow one sublayer on at a time
            layer.parent.activeSublayer().deactivateLayer();
        }
        layer.parent.active(true);
        layer.parent.activeSublayer(layer);
        layer.parent.visible(true);
        layer.parent.visibleSublayer(layer);
    };

    // called from activateLayer
    self.activateUtfGridLayer = function() {
        var layer = this;

        app.map.UTFControl.layers.unshift(layer.utfgrid);
    };

    // bound to click handler for layer visibility switching in Active panel
    self.toggleVisible = function() {
        var layer = this;

        if (layer.visible()) { //make invisible
            self.setInvisible(layer);
        } else { //make visible
            self.setVisible(layer);
        }

        if (layer.is_multilayer_parent && layer.dimensions.length > 0){
          var multilayers = self.getMultilayerIds(layer.associated_multilayers, []);
          for (var i = 0; i < multilayers.length; i++) {
            var mlayer = app.viewModel.getLayerById(multilayers[i]);
            if (mlayer) {
              if (layer.visible()) {
                mlayer.setVisible(mlayer);
              } else {
                mlayer.setInvisible(mlayer);
              }
            }
          }
        }

        app.updateUrl();

    };

    self.setVisible = function() {
        var layer = this;

        layer.visible(true);
        if (layer.parent) {
            layer.parent.visible(true);
        }
        app.setLayerVisibility(layer, true);

        //add utfgrid if applicable
        if (layer.utfgrid && app.map.UTFControl.layers.indexOf(layer.utfgrid) === -1) {
            app.map.UTFControl.layers.splice($.inArray(this, app.viewModel.activeLayers()), 0, layer.utfgrid);
        }
    };

    self.setInvisible = function() {
        var layer = this;

        layer.visible(false);
        if (layer.parent) {
            // if layer.parent is not a checkbox, set parent to invisible
            if (layer.parent.type !== 'checkbox') {
                layer.parent.visible(false);
            } else { //otherwise layer.parent is checkbox
                //check to see if any sublayers are still visible
                if (!layer.parent.hasVisibleSublayers()) {
                    layer.parent.visible(false);
                }
            }
        }
        app.setLayerVisibility(layer, false);

        app.viewModel.removeFromAggregatedAttributes(layer.name);

        if ($.isEmptyObject(app.viewModel.visibleLayers())) {
            app.viewModel.closeAttribution();
        }

        //remove related utfgrid layer
        if (layer.utfgrid) {
            //the following removes this layers utfgrid from the utfcontrol and prevents continued utf attribution on this layer
            app.map.UTFControl.layers.splice($.inArray(this.utfgrid, app.map.UTFControl.layers), 1);
        }
    };

    self.showSublayers = ko.observable(false);

    self.activateCompanionLayer = function() {
        var layer = this;
        //get 'hidden' companion theme
        var companion = $.grep(app.viewModel.themes(), function(n, i){
            return n.slug_name === 'companion';
        });

        if (companion.length > 0) {
            layer.companion = [];
            $.each(companion[0].layers(), function(i, l) {
                if (l.companionLayers.length > 0) {
                    var companionLayer = $.grep(l.companionLayers, function(k) {
                        return k.id == layer.id
                    })
                    if (companionLayer.length > 0) {
                        l.activateLayer(true); // prevent companion infinite loop
                        layer.companion.push(l);
                    }
                }
            });
        }
    }

    self.getMultilayerIds = function(object, id_list) {
      var keys = Object.keys(object);
      for (var i = 0; i < keys.length; i++){
        key = keys[i];
        value = object[key];
        if (typeof(value) == "number") {
          id_list.push(value);
        } else if (typeof(value) == "object") {
          id_list.concat(self.getMultilayerIds(value, id_list));
        }
      }
      return id_list;
    };

    self.activateMultiLayers = function() {
        var layer = this;
        multilayers = self.getMultilayerIds(layer.associated_multilayers, []);
        for (var i = 0; i < multilayers.length; i++) {
          mlayer = app.viewModel.getLayerById(multilayers[i]);
          if (mlayer) {
            mlayer.is_multilayer(true);
            mlayer.activateLayer();
            mlayer.opacity(0);
          }
        }
    };

    self.multilayerSliderChange = function(event, ui) {
      // If this isn't the first creation
      if (Object.keys(self.multilayerValueLookup).length == self.dimensions.length) {
        var sliderValues = [];
        for (var i = 0; i < self.dimensions.length; i++) {
          var dimension = self.dimensions[i].label;
          try {
            var sliderIndex = $('#' + self.id + '_' + dimension + '_multilayerslider').slider('value');
            self.multilayerSliderState[i] = sliderIndex;
            sliderValues.push(self.multilayerValueLookup[dimension][sliderIndex].value.toString());
          } catch(err) {
            if (self.multilayerSliderState.length > i) {
              sliderValues.push(self.multilayerValueLookup[dimension][self.multilayerSliderState[i]].value.toString());
            } else {
              sliderValues.push(self.multilayerValueLookup[dimension][0].value.toString());
            }
          }
        }
        self.toggleMultilayer(sliderValues);
      }
    };

    self.multilayerAnimateToggle = function(checkbox, slider) {
      var intr = setInterval(function() {
        if (!checkbox.checked) {
          clearInterval(intr);
          return;
        } else {
          try {
            var max = slider.slider('option', 'max');
            var value = slider.slider('value');
            var step = slider.slider('option', 'step');
            var min = slider.slider('option', 'min');
            if (value < max && (value + step) <= max ) {
              slider.slider('value', value + step);
            } else {
              slider.slider('value', min);
            }
          } catch(err) {
            return;
          }
        }
      }, 1000);
    };

    self.buildMultilayerValueLookup = function() {
      for (var i = 0; i < self.dimensions.length; i++) {
        dimension = self.dimensions[i];
        self.multilayerValueLookup[dimension.label] = dimension.nodes;
        if (self.multilayerSliderState.length > 0) {
          self.addSlider(dimension, self.multilayerSliderState[i]);
        } else {
          self.addSlider(dimension, 0);
        }
      }
    };

    self.drawSlider = function() {
      //
      // Add labels to slider whose values
      // are specified by min, max and whose
      // step is set to 1
      //

      // Get the options for this slider
      var opt = {
        min: 0,
        max: self.multilayerValueLookup[dimension.label].length-1,
        step: 1,
        range: 'min'
      }

      // Get the number of possible values
      var vals = opt.max - opt.min;

      // clean out old labels before adding new
      $( "#" + self.id + "_" + dimension.label + "_multilayerslider" ).children('label').remove()
      // Space out values
      for (var i = 0; i <= vals; i++) {

        var el = $('<label>'+self.multilayerValueLookup[dimension.label][i].label+'</label>');
        if (vals != 0) {
          var label_width = 100/vals;
          var label_left = label_width*i-(label_width/2);
          el.css('width', label_width + '%');
          el.css('left', label_left + '%');
        }

        $( "#" + self.id + "_" + dimension.label + "_multilayerslider" ).append(el);

      }
    };

    self.addSlider = function(dimension, value) {
      $( "#" + self.id + "_" + dimension.label + "_multilayerslider" ).slider({
        create: self.multilayerSliderChange,
        change: self.multilayerSliderChange,
        value: value,
        min: 0,
        max: self.multilayerValueLookup[dimension.label].length-1,
        step: 1
      })
      .each(
        function() {
          self.drawSlider();
        }
      );

      if (dimension.animated) {
        if (!$._data( $( "#" + self.id + "_animate_multilayerslider" ).get(0), 'events')) {
          $( "#" + self.id + "_animate_multilayerslider" ).change(function(evt) {
            var slider = $( "#" + self.id + "_" + dimension.label + "_multilayerslider" );
            self.multilayerAnimateToggle(this, slider);
          });
        }
      }
    };

    self.toggleMultilayer = function(values) {
      // IE Object.assign fix via Andres Ilich: https://stackoverflow.com/a/39021339
      if (typeof Object.assign != 'function') {
        Object.assign = function(target) {
          'use strict';
          if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
          }

          target = Object(target);
          for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }
          }
          return target;
        };
      }
      multilayerObject = Object.assign({},self.associated_multilayers);
      //One value for each dimension: use this to ID the layer ID for the given dimensions
      for (var i = 0; i < values.length; i++) {
        multilayerObject = multilayerObject[values[i]];
      }
      newMultiLayer = app.viewModel.getLayerById(multilayerObject);
      if (newMultiLayer) {
        if (self.activeMultilayer) {
          self.activeMultilayer.is_visible_multilayer(false);
          self.activeMultilayer.opacity(0);
        }
        self.activeMultilayer = newMultiLayer;
        self.activeMultilayer.opacity(self.opacity());
        self.activeMultilayer.is_visible_multilayer(true);
      }
    };

    self.ajaxMDAT = function(self, event) {
        if (self.showSublayers() === true) {
            self.showSublayers(false);
            return false;
        }

        var layer = this,
            $mdatSpinner = $('#mdat-load'),
            $parentDirs = $(event.target).parents("ul.unstyled"),
            $layerText = $('.mdat-input.search-box');

        //marine-life-library theme?
        if (layer.themes()[0].slug_name === 'marine-life-library') {

            $parentDirs.hide();
            $mdatSpinner.css("display", "block");

            layer.serviceLayers = [];
            layer.mdat_param = layer.url+'?f=pjson';
            //give pseudo sublayer for toggling
            layer.subLayers = [""]

            var deferred = $.ajax({
                type: 'GET',
                dataType: 'jsonp',
                url: layer.mdat_param
            });

            deferred.done(function(data) {
                $.each(data.layers, function(i, val) {
                    //we only want the actual layers
                    if (val.subLayerIds === null) {
                        val.parentDirectory = layer;
                        layer.serviceLayers.push(val);
                    }
                })

                $mdatSpinner.hide();
                $parentDirs.show();
                self.toggleActive();
                if (layer.showSublayers()) {
                    $layerText.val('');
                    //focus() instantiates typeahead search in models.js
                    $('.mdat-input').focus();
                }
            })
        }
    }

    // array of VTR/CAS date ranges
    self.dateRanges = ko.observableArray();

    self.ajaxVTR = function(self, event) {
        if (self.showSublayers() === true) {
            self.showSublayers(false);
            return false;
        }

        self.showSublayers(true);

        var layer = this,
            $vtrSpinner = $('#vtr-load'),
            $parentDirs = $(event.target).parents("ul.unstyled");

        //communities at sea theme?
        if (layer.themes()[0].slug_name === 'vtr') {
            layer.dateRanges([]);
            $parentDirs.hide();
            $vtrSpinner.css("display", "block");
            layer.gearURL = layer.url+'?f=pjson';
            //give pseudo sublayer for toggling
            layer.subLayers = [""];
            layer.isVTR = true;

            var deferred = $.ajax({
                type: 'GET',
                dataType: 'jsonp',
                url: layer.gearURL
            });

            //get date-range directories
            deferred.done(function(data) {
                $.each(data.services, function(i, val) {
                    val.parentDirectory = layer;
                    val.showVTRSearch = ko.observable(false);
                    val.searchVTRPort = ko.observable();
                    val.path = val.name;
                    //we only want the second part of the path as the name
                    val.name = val.name.split('/')[1].replace('_', ' - ');
                    layer.dateRanges.push(val);
                })

                $vtrSpinner.hide();
                $parentDirs.show();
            })
        }
    }

    // array of VTR/CAS ports
    self.ports = ko.observableArray();

    self.searchVTRPort = function(self, event) {
        if (self.showVTRSearch()) {
            self.showVTRSearch(false);
            return false;
        }

        var layer = this,
            $vtrSpinner = $('#vtr-load'),
            $parentDirs = $(event.target).parents("ul.unstyled"),
            $layerText = $('.port-input.search-box');

            $parentDirs.hide();
            $vtrSpinner.css("display", "block");

            layer.url = replaceVTRPath(layer);
            layer.portsPath = layer.url+'/MapServer?f=pjson';
            layer.serviceLayers = [];
            //give pseudo sublayer for toggling
            layer.subLayers = [""]

            var deferred = $.ajax({
                type: 'GET',
                dataType: 'jsonp',
                url: layer.portsPath
            });

            //get date-range directories
            deferred.done(function(data) {
                $.each(data.layers, function(i, port) {
                    port.dateRangeDirectory = layer;
                    layer.serviceLayers.push(port);
                })

                $vtrSpinner.hide();
                $parentDirs.show();
                //set layer to be queryable
                app.viewModel.activeLayer(layer);
                self.showVTRSearch(true);
                $layerText.val('');
                $('.port-input').focus();
            })

    }

    function replaceVTRPath(lyr) {
        var path = lyr.parentDirectory.url;
        //find the last '/' in the url path
        var urlLocale = path.lastIndexOf('/');
        var sub = path.substring(urlLocale + 1);
        //replace the substring with the actual path
        var newPath = path.replace(sub, lyr.path);
        return newPath
    }

    // bound to click handler for layer switching
    self.toggleActive = function(self, event) {
        var activeLayer = app.viewModel.activeLayer();
        var activeParentLayer = app.viewModel.activeParentLayer();
        var layer = this;

        layer.is_multilayer(false);

        //are the active and current layers the same
        if (layer !== activeLayer && typeof activeLayer !== 'undefined') {
            // are these CAS/VTR layers?
            if (activeLayer.dateRangeDirectory && typeof activeLayer.parentDirectory == 'Function') {
                activeLayer.parentDirectory.showSublayers(false);
            }
            //is sublayer already active
            else if (activeLayer && typeof activeLayer.showSublayers == 'Function' ) {
                if (activeLayer && activeLayer.showSublayers()) {
                    //if radio sublayer
                    if (!activeLayer.isCheckBoxLayer()) {
                        activeLayer.showSublayers(false);
                    }
                }
            //check if a parent layer is active
            //checkbox sublayer has been clicked prior to opening another sublayer
            } else if (activeParentLayer && layer.parent !== activeParentLayer) {
                app.viewModel.activeParentLayer().showSublayers(false);
            }
        }

        // save a ref to the active layer for editing,etc
        app.viewModel.activeLayer(layer);

        //handle possible dropdown/sublayer behavior
        if (layer.subLayers.length) {
            app.viewModel.activeParentLayer(layer);
            if ( app.embeddedMap ) { // if data viewer is mobile app
                $('.carousel').carousel('prev');
                $('#mobile-data-right-button').show();
                $('#mobile-map-right-button').hide();
            }
            if (!layer.showSublayers()) {
                //show drop-down menu
                layer.showSublayers(true);
            } else {
                //hide drop-down menu
                layer.showSublayers(false);
            }
            return;
        }

        // start saving restore state again and remove restore state message from map view
        app.saveStateMode = true;
        app.viewModel.error(null);
        //app.viewModel.unloadedDesigns = [];

        if (layer.active()) { // if layer is active
            layer.deactivateLayer();
        } else { // otherwise layer is not currently active
            layer.activateLayer();
        }

        //check if mdat/marine-life-library still has activeLayers
        if (layer.isMDAT) {
            var parentDirArray = [];

            if (app.viewModel.activeLayers().length > 0) {
               parentDirArray = $.grep(app.viewModel.activeLayers(), function(lyr) {
                   return layer.parentMDATDirectory === lyr.parentMDATDirectory;
               });
            }

            if (parentDirArray.length == 0) {
                layer.parentMDATDirectory.visible(false);
            }
        }
    };

    self.raiseLayer = function(layer, event) {
        var current = app.viewModel.activeLayers.indexOf(layer);
        if (current === 0) {
            // already at top
            return;
        }
        $(event.target).closest('tr').fadeOut('fast', function() {
            app.viewModel.activeLayers.remove(layer);
            app.viewModel.activeLayers.splice(current - 1, 0, layer);
        });
    };

    self.lowerLayer = function(layer, event) {
        var current = app.viewModel.activeLayers.indexOf(layer);
        if (current === app.viewModel.activeLayers().length) {
            // already at top
            return;
        }
        $(event.target).closest('tr').fadeOut('fast', function() {
            app.viewModel.activeLayers.remove(layer);
            app.viewModel.activeLayers.splice(current + 1, 0, layer);
        });
    };

    self.isTopLayer = function(layer) {
        return app.viewModel.activeLayers.indexOf(layer) === 0;
    };

    self.isBottomLayer = function(layer) {
        return app.viewModel.activeLayers.indexOf(layer) === app.viewModel.activeLayers().length - 1;
    };

    self.showingLegendDetails = ko.observable(true);
    self.toggleLegendDetails = function() {
        var legendID = '#' + app.viewModel.convertToSlug(self.name) + '-legend-content';
        if ( self.showingLegendDetails() ) {
            self.showingLegendDetails(false);
            $(legendID).css('display', 'none');
            //$(legendID).collapse('hide');
            //$(legendID).slideUp(200);
            //setTimeout( function() { $(legendID).css('display', 'none'); }, 300 );
        } else {
            self.showingLegendDetails(true);
            $(legendID).css('display', 'block');
            //$(legendID).collapse('show');
            //$(legendID).slideDown(200);
        }
    };

    self.showingLayerAttribution = ko.observable(true);
    self.toggleLayerAttribution = function() {
        var layerID = '#' + app.viewModel.convertToSlug(self.featureAttributionName);
        if ( self.showingLayerAttribution() ) {
            self.showingLayerAttribution(false);
            $(layerID).css('display', 'none');
        } else {
            self.showingLayerAttribution(true);
            $(layerID).css('display', 'block');
        }
    };
    self.toggleFeatureAttribution = function(target_id) {
        var layerID = '#' + app.viewModel.convertToSlug(target_id.id);
        if ( $(layerID).is(':visible') ) {
            $(layerID).css('display', 'none');
        } else {
            $(layerID).css('display', 'block');
        }
    };

    // display descriptive text below the map
    self.toggleDescription = function(layer) {
        // if no description is provided, try using the web services description
        if ( (!self.overview || !self.description()) && self.url && (self.arcgislayers !== -1) ) {
          try {
            getArcGISJSONDescription(self, window.location.protocol);
          } catch (err) {
            if (window.location.protocol == "http:") {
              console.log(err);
            } else {
              getArcGISJSONDescription(self, "http:");
            }
          }
        }
        if ( ! layer.infoActive() ) {
            self.showDescription(layer);
        } else {
            self.hideDescription(layer);
        }
    };

    self.showDescription = function(layer) {
        self.infoActive(true);
    };

    self.hideDescription = function(layer) {
        self.infoActive(false);
    };

    self.showTooltip = function(layer, event) {
        var layerActual;
        $('#layer-popover').hide();
        if (layer.activeSublayer() && layer.activeSublayer().description()) {
            layerActual = layer.activeSublayer();
        } else {
            layerActual = layer;
        }
        if (layerActual.description()) {
            app.viewModel.layerToolTipText(layerActual.description());
            $('#layer-popover').show().position({
                "my": "right middle",
                "at": "left middle",
                "of": $(event.target).closest(".btn-group")
            });
        }
    };

    // remove the layer dropdrown menu
    self.closeMenu = function(layer, event) {
        $(event.target).closest('.btn-group').removeClass('open');
        layer.showSublayers(false);
    };

    return self;
} // end layerModel

function themeModel(options) {
    var self = this;
    self.name = options.display_name;
    self.id = options.id;
    self.description = ko.observable(options.description);
    self.learn_link = options.learn_link;
    self.is_visible = options.is_visible;
    self.slug_name = options.name;

    // array of layers
    self.layers = ko.observableArray();

    //theme tracking Google Analytics
    self.trackTheme = function(action) {
        ga('send', 'event', 'Themes Activated', action);
    };

    //add to open themes
    self.setOpenTheme = function() {
        var theme = this;

        // ensure data tab is activated
        $('#dataTab').tab('show');

        if (self.isOpenTheme(theme)) {
            //app.viewModel.activeTheme(null);
            app.viewModel.openThemes.remove(theme);
        } else {
            app.viewModel.openThemes.push(theme);
            self.trackTheme(theme.name);
        }
    };

    //is in openThemes
    self.isOpenTheme = function() {
        var theme = this;
        if (app.viewModel.openThemes.indexOf(theme) !== -1) {
            return true;
        }
        return false;
    };

    //display theme text below the map
    self.setActiveTheme = function() {
        var theme = this;
        app.viewModel.activeTheme(theme);
        app.viewModel.activeThemeName(self.name);
        app.viewModel.themeText(theme.description());
    };

    // is active theme
    self.isActiveTheme = function() {
        var theme = this;
        if (app.viewModel.activeTheme() == theme) {
            return true;
        }
        return false;
    };

    self.hideTooltip = function(theme, event) {
        $('.layer-popover').hide();
    };

    //mdat marine lifes theme
    self.isMarineLife = function() {
        var theme = this;
        // we don't know what the display name for
        // marine life mdat layers are always going to be called
        // so let's keep the slug name === 'marine-life-library'
        if (theme.slug_name === 'marine-life-library') {
            return true;
        }
        return false;
    };

    //C@S - VTR theme
    self.isVTR = function() {
        var theme = this;
        // we don't know what the display name for
        // C@S layers are always going to be called
        // so let's keep the slug name === 'vtr'
        if (theme.slug_name === 'vtr') {
            return true;
        }
        return false;
    };

    //hidden 'companion' layer theme
    self.isCompanionTheme = function() {
        var theme = this;
        if (theme.slug_name === 'companion') {
            return true;
        }
        return false;
    };

    return self;
} // end of themeModel

function mapLinksModel() {
    var self = this;

    self.cancel = function() {
        $('#map-links-popover').hide();
    };

    self.getURL = function() {
        if (window.location.hostname == "localhost") {
          return window.location.protocol + '//portal.midatlanticocean.org' + app.viewModel.currentURL();
        } else {
          return window.location.origin + app.viewModel.currentURL();
        }
    };

    self.shrinkURL = ko.observable();
    self.shrinkURL.subscribe( function() {
        if (self.shrinkURL()) {
            self.useShortURL();
        } else {
            self.useLongURL();
        }
    });

    self.useLongURL = function() {
        $('#short-url')[0].value = self.getURL();
    };

    self.useShortURL = function() {
        var bitly_login = "p97dev",
            bitly_api_key = 'R_27f2b2cc886e49fb9f35c37b7b633749',
            long_url = self.getURL();

        $.getJSON(
            "https://api-ssl.bitly.com/v3/shorten?callback=?",
            {
                "format": "json",
                "apiKey": bitly_api_key,
                "login": bitly_login,
                "longUrl": long_url
            },
            function(response)
            {
                $('#short-url')[0].value = response.data.url;
            }
        );
    };

    self.getPortalURL = function() {
        var urlOrigin = window.location.origin,
            urlHash = window.location.hash;
        return urlOrigin + '/visualize/' + urlHash;
    };

    self.setIFrameHTML = function() {
        $('#iframe-html')[0].value = self.getIFrameHTML();
    };

    self.getIFrameHTML = function(bookmarkState) {
        var urlOrigin = window.location.origin,
            urlHash = window.location.hash;

        if ( bookmarkState ) {
            //urlHash = '#'+$.param(bookmarkState);
            urlHash = '#' + bookmarkState;
        }
        if ( !urlOrigin ) {
            urlOrigin = 'http://' + window.location.host;
        }
        var embedURL = urlOrigin + '/embed/map/' + urlHash;
        //console.log(embedURL);
        return '<iframe width="600" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"' +
                                     'src="' + embedURL + '">' + '</iframe>';
        //$('#iframe-html')[0].value = '<iframe width="600" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"' +
        //                             'src="' + embedURL + '">' + '</iframe>' + '<br />';
    };

    self.openIFrameExample = function(info) {
        var windowName = "newMapWindow",
            windowSize = "width=650, height=550";
            mapWindow = window.open('', windowName, windowSize);
        var urlOrigin = window.location.origin;
        if ( !urlOrigin ) {
            urlOrigin = 'http://' + window.location.host;
        }
        var header = '<a href="/visualize"><img src="'+urlOrigin+'/media/marco/img/marco-logo_planner.jpg" style="border: 0px;"/></a>';
        var iframeID = '';
        if (info === 'bookmark') {
            iframeID = '#bookmark-iframe-html';
        } else {
            iframeID = '#iframe-html';
        }
        mapWindow.document.write('<html><body>' + $(iframeID)[0].value + '</body></html>');
        mapWindow.document.title = "Your MARCO Map!";
        mapWindow.document.close();

    };

    return self;
} // end of mapLinks Model


function ExportGeometry() {
    this.dialog = $('#export-geometry');
}
ExportGeometry.prototype.showDialog = function(object) {
    console.log("Object =", object);

    // The dialog borrows "sharingLayer" to display the object
    app.viewModel.scenarios.sharingLayer(object);
    this.dialog.modal('show');
}
ExportGeometry.prototype.closeDialog = function() {
    this.dialog.modal('hide');
}


function viewModel() {
    var self = this;

    this.exportGeometry = new ExportGeometry();

    // list of (func, unlessTarget) for $(doc).mouseDown
    self._outsideClicks = [];

    // list of active layermodels
    self.activeLayers = ko.observableArray();

    self.visibleLegendLayers = ko.computed(function() {
      return $.map(self.activeLayers(), function(layer) {
          if (layer.visible()) {
              return layer;
          }
      });
    });

    // list of visible layermodels in same order as activeLayers
    self.visibleLayers = ko.computed(function() {
        return $.map(self.activeLayers(), function(layer) {
            if (layer.visible() && (!layer.hasOwnProperty('is_multilayer') || !layer.is_multilayer())) {
                return layer;
            }
        });
    });

    self.visibleLayers.subscribe( function() {
        self.updateAttributeLayers();
    });

    // Legends relied on 'visibleLayers' to determine what to show.
    // Multilayers are left out of 'visibleLayers' so that they don't appear
    // in the Active tab, but we DO want them in the Legend tab (if showing).
    self.visibleLegendLayers = ko.computed(function() {
      return $.map(self.activeLayers(), function(layer) {
          if (layer.visible()) {
              return layer;
          }
      });
    });

    self.attributeLayers = ko.observable();

    self.featureAttribution = ko.observable(true);
    self.enableFeatureAttribution = function() {
        self.aggregatedAttributes(false);
        self.featureAttribution(true);
    };
    self.disableFeatureAttribution = function() {
        self.featureAttribution(false);
        app.markers.clearMarkers();
    };

    self.showFeatureAttribution = ko.observable(false);

    self.featureAttribution.subscribe( function() {
        self.showFeatureAttribution( self.featureAttribution() && !($.isEmptyObject(self.aggregatedAttributes())) );
    });

    self.updateAttributeLayers = function() {
        var attributeLayersList = [];
        if (self.scenarios && self.scenarios.scenarioFormModel && self.scenarios.scenarioFormModel.isLeaseblockLayerVisible()) {
            attributeLayersList.push(self.scenarios.leaseblockLayer().layerModel);
        }

        $.each(self.visibleLayers(), function(index, layer) {
            // special case for Benthic habitats
            // make sure it doesn't exist already so it doesn't produce
            // two attribute outputs when both layers are active
            var ignoreDup = layer.featureAttributionName == 'Benthic Habitats' &&
                         app.utils.getObjectFromList(attributeLayersList, 'featureAttributionName', 'Benthic Habitats');

            if (!ignoreDup) {
               attributeLayersList.push(layer);
            }
        });
        self.attributeLayers(attributeLayersList);
    };

    // boolean flag determining whether or not to show layer panel
    self.showLayers = ko.observable(true);

    self.showLayersText = ko.computed(function() {
        if (self.showLayers()) return "Hide Layers";
        else return "Show Layers";
    });

    // toggle layer panel visibility
    self.toggleLayers = function() {
        self.showLayers(!self.showLayers());
        app.map.render('map');
        if (self.showLayers()) {
            app.map.render('map'); //doing this again seems to prevent the vector wandering effect
        }
        app.updateUrl();
        //if toggling layers during default pageguide, then correct step 4 position
        //self.correctTourPosition();
        //throws client-side error in pageguide.js for some reason...
    };

    // reference to open themes in accordion
    self.openThemes = ko.observableArray();

    self.openThemes.subscribe( function() {
        app.updateUrl();
    });

    self.getOpenThemeIDs = function() {
        return $.map(self.openThemes(), function(theme) {
            return theme.id;
        });
    };

    // reference to active theme model/name for display text
    self.activeTheme = ko.observable();
    self.activeThemeName = ko.observable();

    // list of theme models
    self.themes = ko.observableArray();
    self.hiddenThemes = ko.observableArray();

    // last clicked layer for editing, etc
    self.activeLayer = ko.observable();
    self.activeParentLayer = ko.observable();

    // determines visibility of description overlay
    self.showDescription = ko.observable();
    // determines visibility of expanded description overlay
    self.showOverview = ko.observable();

    // theme text currently on display
    self.themeText = ko.observable();

    // index for filter autocomplete and lookups
    self.layerIndex = {};
    self.layerSearchIndex = {};

    self.bookmarks = new bookmarksModel();
    self.isBookmarksOpen = ko.observable(false);
    self.bookmarkEmail = ko.observable();
    self.toggleBookmarksOpen = function(force) {
        $('#designsTab').tab('show');

        if (force == 'open') {
            self.isBookmarksOpen(true);
        }
        else if (force == 'close') {
            self.isBookmarksOpen(false);
        }
        else {
            self.isBookmarksOpen(!self.isBookmarksOpen());
        }

        if (self.isBookmarksOpen()) {
            app.viewModel.bookmarks.getBookmarks();
        }
    }

    self.scenarios = new scenariosModel();
    self.scenarios.reports = new reportsModel();

    self.mapLinks = new mapLinksModel();

    // text for tooltip popup
    self.layerToolTipText = ko.observable();

    // descriptive text below the map
    self.activeInfoLayer = ko.observable(false);
    self.activeInfoSublayer = ko.observable(false);
    self.activeInfoSelector = ko.observable(false);
    self.activeInfoLayer.subscribe( function() {
        if ( self.activeInfoLayer() && self.activeInfoLayer().subLayers && self.activeInfoLayer().subLayers.length > 0 ) {
            self.activeInfoSelector(true);
        } else {
            self.activeInfoSelector(false);
        }
    });


    // attribute data
    self.aggregatedAttributes = ko.observable(false);
    self.aggregatedAttributesWidth = ko.observable('280px');
    self.aggregatedAttributes.subscribe( function() {
        self.updateAggregatedAttributesOverlayWidthAndScrollbar();
        self.showFeatureAttribution( self.featureAttribution() && !($.isEmptyObject(self.aggregatedAttributes())) );
    });
    self.removeFromAggregatedAttributes = function(layerName) {
        delete app.viewModel.aggregatedAttributes()[layerName];
        //if there are no more attributes left to display, then remove the overlay altogether
        if ($.isEmptyObject(self.aggregatedAttributes())) {
            self.closeAttribution();
        } else {
            //because the subscription on aggregatedAttributes is not triggered by this delete process
            self.updateAggregatedAttributesOverlayWidthAndScrollbar();
        }
    };
    self.updateAggregatedAttributesOverlayWidthAndScrollbar = function() {
        setTimeout( function() {
            // var overlayWidth = (document.getElementById('aggregated-attribute-overlay-test').clientWidth+50),
            //     width = overlayWidth < 380 ? overlayWidth : 380;
            //console.log('setting overlay width to ' + width);
            self.aggregatedAttributesWidth(280 + 'px');
        }, 500);
    };

    // title for print view
    self.mapTitle = ko.observable();

    self.closeAttribution = function() {
        self.aggregatedAttributes(false);
        app.markers.clearMarkers();
    };

    self.updateMarker = function(lonlat) {
        //at some point this function is being called without an appropriate lonlat object...
        if (lonlat.lon && lonlat.lat) {
            app.markers.clearMarkers();
            app.marker = new OpenLayers.Marker(lonlat, app.markers.icon);
            app.marker.map = app.map;
            //app.marker.display(true);
            if (app.marker && !$.isEmptyObject(self.aggregatedAttributes()) && self.featureAttribution()) {
                app.markers.addMarker(app.marker);
                app.map.setLayerIndex(app.markers, 99);
            }
        }
    };

    self.zoomLevel = ko.observable(false);


    // minimize data panel
    self.minimized = false;
    self.minimizeLayerSwitcher = function() {
        if ( !self.minimized ) {
            $('#mafmc-layer-switcher').animate( {height: '55px'}, 400 );
            $('#mafmc-tab-content').hide();
            $('#mafmc-tabs').hide();
            $('#mafmc-active-content').hide();
            $('#mafmc-layer-list').hide();
        } else {
            $('#mafmc-layer-switcher').animate( {height: '350px'}, 400 );
            setTimeout( function() {
                $('#mafmc-tabs').show();
                $('#mafmc-active-content').show();
                $('#mafmc-layer-list').show();
                $('#mafmc-tab-content').show();
            }, 200);
        }
        self.minimized = !self.minimized;
    };

    // hide tours for smaller screens
    self.hideTours = ko.observable(false);

    // set the error type
    // can be one of:
    //  restoreState
    self.error = ko.observable();
    self.clearError = function() {
        self.error(null);
    };

    self.showLogo = ko.observable(true);
    self.hideLogo = function() {
        self.showLogo(false);
    };
    self.showZoomControls = ko.observable(true);
    self.hideZoomControls = function() {
        self.showZoomControls(false);
    };
    self.showZoomControls.subscribe(function (newVal) {
        if (newVal === false) {
            $('.olControlZoom').css('display', 'none');
        } else {
            $('.olControlZoom').css('display', '');
        }
    });

    // show the map?
    self.showMapPanel = ko.observable(true);

    //show/hide the list of basemaps
    self.showBasemaps = function(self, event) {
        var $layerSwitcher = $('#SimpleLayerSwitcher_29'),
            $button = $('#basemaps'); //$(event.target).closest('.btn');
        if ($layerSwitcher.is(":visible")) {
            $layerSwitcher.hide();
        } else {
            $layerSwitcher.show();
        }
    };
    self.showMAFMCBasemaps = function(self) {
        var $layerSwitcher = $('#SimpleLayerSwitcher_29');
        $layerSwitcher.css({ "bottom": "42px", "right": "12px", "width": "138px" });
        setTimeout( function() {
            $layerSwitcher.slideDown(150);
        }, 250);
    };

    // zoom with box
    self.zoomBoxIn = function (self, event) {
        var $button = $(event.target).closest('.btn');
        self.zoomBox($button);
    };
    self.zoomBoxOut = function (self, event) {
        var $button = $(event.target).closest('.btn');
        self.zoomBox($button, true);
    };
    self.zoomBox = function  ($button, out) {
        // out is a boolean to specify whether we are zooming in or out
        // true: zoom out
        // not present/false zoom in
        if ($button.hasClass('active')) {
            self.deactivateZoomBox();
        } else {
            $button.addClass('active');
            $button.siblings('.btn-zoom').removeClass('active');
            if (out) {
                app.map.zoomBox.out = true;
            } else {
                app.map.zoomBox.out = false;
            }
            app.map.zoomBox.activate();
            $('#map').addClass('zoomBox');

        }
    };
    self.deactivateZoomBox = function ($button) {
        var $button = $button || $('.btn-zoom');
        app.map.zoomBox.deactivate();
        $button.removeClass('active');
        $('#map').removeClass('zoomBox');
    };

    // is the legend panel visible?
    self.showLegend = ko.observable(false);

    self.activeLegendLayers = ko.computed(function() {
        var layers = $.map(self.visibleLegendLayers(), function(layer) {
            if ((layer.legend || layer.legendTitle) && (!layer.is_multilayer() || layer.is_visible_multilayer())) {
                return layer;
            }
        });

        // remove any layers with duplicate legend titles
        var seen = {};
        for (i = 0; i < layers.length; i++) {
            var title = layers[i].legendTitle ? layers[i].legendTitle : layers[i].name;
            if (seen[title]) {
                layers.splice(i, 1);
                i--;
            } else {
                seen[title] = true;
            }
        }
        return layers;
    });

    self.legendButtonText = ko.computed(function() {
        if (self.showLegend()) return "Hide Legend";
        else return "Show Legend";
    });

    // is the legend panel visible?
    self.showEmbeddedLegend = ko.observable(false);

    // toggle embedded legend (on embedded maps)
    self.toggleEmbeddedLegend = function() {
        self.showEmbeddedLegend( !self.showEmbeddedLegend() );
        var legendScrollpane = $('#embedded-legend').data('jsp');
        if (legendScrollpane === undefined) {
            $('#embedded-legend').jScrollPane();
        } else {
            legendScrollpane.reinitialise();
        }
    };

    // toggle legend panel visibility
    self.toggleLegend = function() {
        self.showLegend(!self.showLegend());
        if (!self.showLegend()) {
            app.map.render('map');
        } else {
            $("#legend-popover").show();
        }
    };

    // determine whether app is offering legends
    self.hasActiveLegends = ko.computed(function() {
        var hasLegends = false;
        $.each(self.visibleLegendLayers(), function(index, layer) {
            if (layer.legend || layer.legendTitle) {
                hasLegends = true;
            }
        });
        return hasLegends;
    });

    // close error-overlay
    self.closeAlert = function(self, event) {
        app.viewModel.error(null);
    };

    // self.learnMoreLink = function() {
    //     if (self.learn_more) {
    //         return
    //     }
    // };

    self.activeKmlLink = function() {
        if ( self.activeInfoSublayer() ) {
            return self.activeInfoSublayer().kml;
        } else if (self.activeInfoLayer() ) {
            return self.activeInfoLayer().kml;
        } else {
            return false;
        }
    };

    self.activeDataLink = function() {
        //activeInfoLayer().data_download
        if ( self.activeInfoSublayer() ) {
            return self.activeInfoSublayer().data_download;
        } else if (self.activeInfoLayer() ) {
            return self.activeInfoLayer().data_download;
        } else {
            return false;
        }
    };

    self.activeMetadataLink = function() {
        //activeInfoLayer().metadata
        if ( self.activeInfoSublayer() ) {
            return self.activeInfoSublayer().metadata;
        } else if (self.activeInfoLayer() ) {
            return self.activeInfoLayer().metadata;
        } else {
            return false;
        }
    };

    self.activeSourceLink = function() {
        //activeInfoLayer().source
        if ( self.activeInfoSublayer() ) {
            return self.activeInfoSublayer().source;
        } else if (self.activeInfoLayer() ) {
            return self.activeInfoLayer().source;
        } else {
            return false;
        }
    };

    self.activeTilesLink = function() {
        //activeInfoLayer().source
        if ( self.activeInfoSublayer() ) {
            return self.activeInfoSublayer().tiles;
        } else if (self.activeInfoLayer() ) {
            return self.activeInfoLayer().tiles;
        } else {
            return false;
        }
    };

    //assigned in app.updateUrl (in state.js)
    self.currentURL = ko.observable();


    // show bookmark stuff
    self.addBookmarksDialogVisible = ko.observable(false);
    self.showBookmarks = function(self, event) {
        self.bookmarks.duplicateBookmark(false);
        self.bookmarks.newBookmarkName(null);
        self.bookmarks.newBookmarkDescription(null);
        self.addBookmarksDialogVisible(true);
        // scenario forms will hide anything with the "step" class, so show
        // it explicitly here.
        $('#addBookmarkForm .step').show();
    };
    self.hideBookmarks = function() {
        self.addBookmarksDialogVisible(false);
    }

    /** Create a new bookmark from the bookmark form */
    self.addBookmark = function(form) {
        var name = $(form).find('#new_bookmark_name').val();
        var description = $(form).find('#new_bookmark_description').val();
        if (name.length == 0) {
            return false;
        }
        //if a bookmark name exists, break out
        var match = $.grep(self.bookmarks.bookmarksList(), function(bkm) {
            return bkm.name.indexOf(name) > -1
        });
        if (match.length > 0) {
            //display duplication text
            self.bookmarks.duplicateBookmark(true);
            $('.dupe-bookmark').effect("highlight", {}, 1000);
            return false;
        }

        self.bookmarks.addBookmark(name, description);
        self.hideBookmarks();
        self.bookmarks.newBookmarkName(null);
        self.bookmarks.newBookmarkDescription(null);
    }

    self.showMapLinks = function() {
        app.updateUrl();
        self.mapLinks.shrinkURL(true);
        $('#short-url').text = self.mapLinks.getURL();
        self.mapLinks.setIFrameHTML();
        $('#map-links-modal').modal()
    };

    self.toggleLinearMeasurement = function() {
      if ($('#linear-measurement i').hasClass('fa-ruler-vertical')) {
        self.startLinearMeasurement();
      } else {
        self.clearLinearMeasurement();
      }
    }

    self.handleLinearMeasurements = function(event) {
        var geometry = event.geometry;
        var units = event.units;
        var order = event.order;
        var measure = event.measure;
        var element = document.getElementById('measurement-output');
        var out = "";
        if (measure < 19) {
          var to_fixed_digits = 2;
        } else if (measure > 187 ) {
          var to_fixed_digits = 0;
        } else {
          var to_fixed_digits = 1;
        }
        if(order == 1) {
            out += "measure: " + measure.toFixed(to_fixed_digits) + " " + units;
            if (units == "km") {
              out += "; " + (measure/1.609344).toFixed(to_fixed_digits) + " mi" + "; " + (measure/1.852).toFixed(to_fixed_digits) + " N mi";
            } else if (units == "m") {
              out += "; " + (measure/1609.344).toFixed(3) + " mi" + "; " + (measure/1852).toFixed(3) + " N mi";
            }
        } else {
            out += "measure: " + measure.toFixed(to_fixed_digits) + " " + units + "<sup>2</" + "sup>";
        }
        element.innerHTML = out;
    }

    self.createLinearControl = function() {
      // yanked from http://dev.openlayers.org/examples/measure.html
      var sketchSymbolizers = {
          "Line": {
              strokeWidth: 3,
              strokeOpacity: 1,
              strokeDashstyle: "solid"
          }
      };
      var style = new OpenLayers.Style();
      style.addRules([
          new OpenLayers.Rule({symbolizer: sketchSymbolizers})
      ]);
      var styleMap = new OpenLayers.StyleMap({"default": style});

      var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
      renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

      app.map.linearMeasurementControl = new OpenLayers.Control.Measure(
          OpenLayers.Handler.Path, {
              persist: true,
              handlerOptions: {
                  layerOptions: {
                      renderers: renderer,
                      styleMap: styleMap
                  }
              }
          }
      );

      app.map.linearMeasurementControl.events.on({
        'measure': self.handleLinearMeasurements,
        'measurepartial': self.handleLinearMeasurements
      });
      app.map.linearMeasurementControl.geodesic = true;
      app.map.linearMeasurementControl.setImmediate(true);
      app.map.addControl(app.map.linearMeasurementControl);

    }

    self.startLinearMeasurement = function() {
      if (!app.map.linearMeasurementControl) {
        self.createLinearControl();
      }
      // Activate drawing (linestring)
      app.map.linearMeasurementControl.activate();
      $('#measurement-display').show();
      // change $('#linear-measurement-button') to work as cancel/clear
      $('#linear-measurement i').removeClass('fa-ruler-vertical');
      $('#linear-measurement i').addClass('fa-times');
    }

    self.clearLinearMeasurement = function() {
      $('#measurement-display').hide();
      app.map.linearMeasurementControl.deactivate();
      $('#linear-measurement i').removeClass('fa-times');
      $('#linear-measurement i').addClass('fa-ruler-vertical');
    }

    /* marine-life-library, not databased MDAT layers */
    self.activateMDATLayer = function(layer) {
        var activeMDATQueryLayers = $.grep(app.viewModel.activeLayers(), function(mdatLyr) {
            return (mdatLyr.name === layer.name && mdatLyr.url === layer.url);
        });

        //if this layer is already active, don't create a duplicate layer object
        if (activeMDATQueryLayers.length > 0) {
            return false;
        }

        var mdatObj = {
            type: 'ArcRest',
            name: layer.name,
            isMDAT: true,
            parentDirectory: layer.parentDirectory,
            url: layer.url+'/export',
            arcgis_layers: layer.id
        };

        var mdatLayer = new layerModel(mdatObj),
            avianAbundance = '/MDAT/Avian_Abundance',
            avianOccurrence = '/MDAT/Avian_Occurrence';

        //if the MDAT Query is an AvianOccurence or AvianAbundance service,
        //activate its companion
        if (layer.url.indexOf(avianAbundance) > -1 || layer.url.indexOf(avianOccurrence) > -1) {
            activateAvianQueryCompanion(mdatLayer);
            mdatLayer['hasCompanion'] = true;
        }

        mdatLayer.activateLayer();
    }

    function activateAvianQueryCompanion(lyr) {
        /*
            NOTE:
            - this is a completely hardcoded hack to accomodate a late feature request
            - functionality is dependent on both the name on MDAT's end and
            - the specific layer IDs tied to the database on the main Portal site
        */
        var companionLyr = {};

        if (lyr.name.split(' ').includes('annual') ) {
            companionLyr = self.getLayerById(488);
        } else if (lyr.name.split(' ').includes('spring')) {
            companionLyr = self.getLayerById(489);
        } else if (lyr.name.split(' ').includes('winter')) {
            companionLyr = self.getLayerById(492);
        } else if (lyr.name.split(' ').includes('fall')) {
            companionLyr = self.getLayerById(491);
        } else if (lyr.name.split(' ').includes('summer')) {
            companionLyr = self.getLayerById(490);
        }

        if (companionLyr.hasOwnProperty('id')) {
            //activate companion layer
            companionLyr.activateLayer();
            //create key-value for deactivation logic
            lyr.companion =[companionLyr];
        }
    }

    self.activateVTRLayer = function(layer) {
        var activeVTRQueryLayers = $.grep(app.viewModel.activeLayers(), function(vtrLyr) {
            return (vtrLyr.name === layer.name && vtrLyr.url === layer.url);
        });

        //if this layer is already active, don't create a duplicate layer object
        if (activeVTRQueryLayers.length > 0) {
            return false;
        }

        var vtrObj = {
            type: 'ArcRest',
            name: layer.name,
            isVTR: true,
            dateRangeDirectory: layer.dateRangeDirectory,
            url: layer.url+'/MapServer/export',
            arcgis_layers: layer.id
        };

        var vtrLayer = new layerModel(vtrObj);
        vtrLayer.activateLayer();

    };

    /* session based WMS layers */
    self.submitWMSSession = function() {
        $('.wmsForm').each(function (index, value) {
            //store object options
            var lyrObj = new Object();
            lyrObj.type = 'ArcRest';
            lyrObj.wmsSession = true;

            $(this).find(':input').each(function() {
                var inputField = ($(this).attr("name"));
                var value = $(this).val();

                if (inputField === 'name') {
                    lyrObj.name = value;
                } else if (inputField === 'url') {
                    lyrObj.url = value;
                } else if (inputField === 'layerId' && value.length > 0) {
                    lyrObj.arcgis_layers = value;
                }
            })
            //add options to layer
            var wmsLayer = new layerModel(lyrObj);
            wmsLayer.activateLayer();
        });
        $('#map-wms-modal').modal('hide');
    };

    self.selectedLayer = ko.observable();

    self.showOpacity = function(layer, event) {
        var $button = $(event.target).closest('a'),
            $popover = $('#opacity-popover');

        self.selectedLayer(layer);

        if ($button.hasClass('active')) {
            self.hideOpacity();
        } else {
            $popover.show().position({
                "my": "center top",
                "at": "center bottom",
                "of": $button,
                "offset": "0px 10px"
            });
            $button.addClass('active');
        }

        self.onClickOutside($popover.get(0), self.hideOpacity);
    };

    /* Call callback() once the next time there's a click that happens "outside"
       the specified container. (A click that is not in a child of the
       container).
     */
    self.onClickOutside = function(container, callback) {
        self._outsideClicks.push({'container': container,
                                  'callback': callback});
    }

    self.hideOpacity = function(self, event) {
        $('#opacity-popover').hide();
        $('.opacity-button.active').removeClass('active');
        app.updateUrl();
    };
    self.hideTooltip = function() {
        $('#layer-popover').hide();
    };


    // show coords info in pointer
    self.showPointerInfo = ko.observable(false);
    self.togglePointerInfo = function() {
        self.showPointerInfo(!self.showPointerInfo());
    };

    // get layer by id
    self.getLayerById = function(id) {
        for (var x=0; x<self.themes().length; x++) {
            var layer_list = $.grep(self.themes()[x].layers(), function(layer) {
                return layer.id === id;
            });
            //find parent layers by ID
            if (layer_list.length > 0) {
                return layer_list[0];
            } else {
                var subLayerArray = [];
                $.each(self.themes()[x].layers(), function(i, l) {
                    if (l.subLayers.length > 0) {
                       subLayerArray.push.apply(subLayerArray, l.subLayers);
                    }
                })
                //find sublayers by ID
                if (subLayerArray.length > 0) {
                    var sublayer_list = $.grep(subLayerArray, function(layer) {
                        return layer.id === id;
                    });
                    if (sublayer_list.length > 0) {
                        return sublayer_list[0];
                    }
                }
            }
        }
        return false;
    };

    self.getLayerBySlug = function(slug) {
        for (var x=0; x<self.themes().length; x++) {
            var layer_list = $.grep(self.themes()[x].layers(), function(layer) {
                return self.convertToSlug(layer.name) === slug;
            });
            if (layer_list.length > 0) {
                return layer_list[0];
            }
        }
        for (var x=0; x<self.themes().length; x++) {
            for (var y=0; y<self.themes()[x].layers().length; y++) {
                var sublayer_list = $.grep(self.themes()[x].layers()[y].subLayers, function(sublayer) {
                    return self.convertToSlug(sublayer.name) === slug;
                });
                if (sublayer_list.length > 0) {
                    return sublayer_list[0];
                }
            }
        }
        return false;
    };

    // handle the search form
    self.searchTerm = ko.observable();
    self.searchTermInput = ko.observable();
    self.clearSearch = function() {
        self.searchTermInput(undefined);
    }
    self.layerSearch = function() {
        var found = self.layerSearchIndex[self.searchTerm()];
        if (!found) {
            console.log("Did not find search term", self.searchTerm())
            return false;
        }
        //self.activeTheme(theme);
        if (self.openThemes.indexOf(found.theme) === -1) {
            self.openThemes.push(found.theme);
        }
        found.layer.activateLayer();
        self.searchTerm($('.typeahead .active').text());
    };
    self.keySearch = function(_, event) {
        // Capture user input before it gets wiped
        self.searchTermInput($("#data-search-input").val());

        if (event.which === 13) {
            self.searchTerm($('.typeahead .active').text());
            self.layerSearch();
        }
        $('ul.typeahead').on('click', 'li', function () {
            self.searchTerm($('.typeahead .active').text());
            self.layerSearch();
            //search($(this).text());
        });
        // Activate the "Active" tab if not already
        // beware naming confusion
        if (! $("ul#myTab li[data-tab='active']").hasClass('active')) {
            $('#activeTab').tab('show');
        }
    };

    // do this stuff when the active layers change
    self.activeLayers.subscribe(function() {
        // initial index
        var index = 300;
        app.state.activeLayers = [];

        // Pull multilayer children ids out of parent.associated_multilayers
        var getMultilayerChildren = function(object, child_ids) {
          var keys = Object.keys(object);
          for (var x=0; x < keys.length; x++) {
            var key = keys[x];
            if (typeof object[key] == "object") {
              var new_ids = getMultilayerChildren(object[key],[]);
              child_ids = child_ids.concat(new_ids);
            } else {
              //assuming typeof is number
              child_ids.push(object[key]);
            }
          }
          return child_ids;
        }

        var multilayer_children = {};
        var multilayer_parents = {};

        //self.showLegend(false);
        $.each(self.activeLayers(), function(i, layer) {
            // set the zindex on the openlayers layer
            // layers at the beginning of activeLayers
            // are above those that are at the end
            // also save the layer state
            app.setLayerZIndex(layer, index);

            if (layer.hasOwnProperty('is_multilayer') && layer.is_multilayer()) {
              multilayer_children[layer.id.toString()] = layer;
            }

            // multilayer sliders need to be redrawn after dragging to reorder
            if (layer.is_multilayer_parent) {
              multilayer_parents[index.toString()] = layer;
            }
            index--;
        });
        for (var i = 0; i < Object.keys(multilayer_parents).length; i++) {
          var index_str = Object.keys(multilayer_parents)[i];
          var parent = multilayer_parents[index_str];
          var index = parseInt(index_str);
          var children_ids = getMultilayerChildren(parent.associated_multilayers, []);
          for (var j = 0; j < children_ids.length; j++) {
            var child_id = children_ids[j].toString();
            if (multilayer_children.hasOwnProperty(child_id)) {
              var child = multilayer_children[child_id];
              app.setLayerZIndex(child, index);
            }
          }
        }

        // re-ordering map layers by z value
        app.map.layers.sort(function(a, b) {
            return a.getZIndex() - b.getZIndex();
        });

        // update the url hash
        app.updateUrl();

        $.each(self.activeLayers(), function(i, layer) {
          if (layer.is_multilayer_parent) {
            if ($('#'+ layer.id + '_' + layer.dimensions[0].label + '_multilayerslider').length == 0 || $('#'+ layer.id + '_' + layer.dimensions[0].label + '_multilayerslider').html() == "") {
              try {
                setTimeout(function() {
                  layer.buildMultilayerValueLookup();
                }, 30)
              }
              catch (err) {
                console.log('pass: ' + layer );
              }
            }
          }
        });

    });

    self.deactivateAllLayers = function() {
        //$.each(self.activeLayers(), function (index, layer) {
        var numActiveLayers = self.activeLayers().length;
        for (var i=0; i < numActiveLayers; i++) {
            self.activeLayers()[0].deactivateLayer();
        }
    };

    self.closeAllThemes = function() {
        var numOpenThemes = self.openThemes().length;
        for (var i=0; i< numOpenThemes; i++) {
            self.openThemes.remove(self.openThemes()[0]);
        }
    };

    self.outsideSubLayer = function(event, elm) {
        var viewModel = app.viewModel;
        if ($(elm).length) {
            //check if mouse click is in the same element, don't close if it is
            if (!$(elm).is(event.target) && $(elm).has(event.target).length === 0) {
                if (viewModel.activeParentLayer()) {
                    viewModel.activeParentLayer().showSublayers(false);
                } else {
                    viewModel.activeLayer().showSublayers(false);
                }

            }
        }
    };

    /* DESIGNS */

    self.showCreateButton = ko.observable(true);

    /* Wind Design */
    self.showWindDesignWizard = ko.observable(false);
    self.windDesignStep1 = ko.observable(false);
    self.windDesignStep2 = ko.observable(false);
    self.windDesignStep3 = ko.observable(false);

    self.startWindDesignWizard = function() {
        self.showCreateButton(false);
        self.showWindDesignWizard(true);
        self.showWindDesignStep1();
    };

    self.showWindDesignStep1 = function() {
        self.windDesignStep1(true);
        $('#wind-design-breadcrumb-step-1').addClass('active');
        self.windDesignStep2(false);
        $('#wind-design-breadcrumb-step-2').removeClass('active');
        self.windDesignStep3(false);
        $('#wind-design-breadcrumb-step-3').removeClass('active');
    };

    self.showWindDesignStep2 = function() {
        self.windDesignStep1(false);
        $('#wind-design-breadcrumb-step-1').removeClass('active');
        self.windDesignStep2(true);
        $('#wind-design-breadcrumb-step-2').addClass('active');
        self.windDesignStep3(false);
        $('#wind-design-breadcrumb-step-3').removeClass('active');
    };

    self.showWindDesignStep3 = function() {
        self.windDesignStep1(false);
        $('#wind-design-breadcrumb-step-1').removeClass('active');
        self.windDesignStep2(false);
        $('#wind-design-breadcrumb-step-2').removeClass('active');
        self.windDesignStep3(true);
        $('#wind-design-breadcrumb-step-3').addClass('active');
    };
    /* END Wind Design */

    self.startDefaultTour = function() {
        if ( $.pageguide('isOpen') ) { // activated when 'tour' is clicked
            // close the pageguide
            app.pageguide.togglingTours = true;
            $.pageguide('close');
        } else {
            //save state
            app.pageguide.state = app.getState();
            app.saveStateMode = false;
        }

        //show the data layers panel
        app.viewModel.showLayers(true);

        //ensure pageguide is managing the default guide
        $.pageguide(defaultGuide, defaultGuideOverrides);

        //adding delay to ensure the message will load
        setTimeout( function() { $.pageguide('open'); }, 700 );
        //$('#help-tab').click();

        app.pageguide.togglingTours = false;
    };

    self.stepTwoOfBasicTour = function() {
        $('.pageguide-fwd')[0].click();
    };

    self.startDataTour = function() {
        //ensure the pageguide is closed
        if ( $.pageguide('isOpen') ) { // activated when 'tour' is clicked
            // close the pageguide
            app.pageguide.togglingTours = true;
            $.pageguide('close');
        } else {
            //save state
            app.pageguide.state = app.getState();
            app.saveStateMode = false;
        }

        //show the data layers panel
        app.viewModel.showLayers(true);

        //switch pageguide from default guide to data guide
        $.pageguide(dataGuide, dataGuideOverrides);

        //show the data tab, close all themes and deactivate all layers, and open the Admin theme
        app.viewModel.closeAllThemes();
        app.viewModel.deactivateAllLayers();
        app.viewModel.themes()[0].setOpenTheme();
        app.setMapPosition(-73, 38.5, 7);
        $('#dataTab').tab('show');

        //start the tour
        setTimeout( function() { $.pageguide('open'); }, 700 );

        app.pageguide.togglingTours = false;
    };

    self.startActiveTour = function() {
        //ensure the pageguide is closed
        if ( $.pageguide('isOpen') ) { // activated when 'tour' is clicked
            // close the pageguide
            app.pageguide.togglingTours = true;
            $.pageguide('close');
        } else {
            //save state
            app.pageguide.state = app.getState();
            app.saveStateMode = false;
        }

        //show the data layers panel
        app.viewModel.showLayers(true);

        //switch pageguide from default guide to active guide
        $.pageguide(activeGuide, activeGuideOverrides);

        //show the active tab, close all themes and deactivate all layers, activate a couple layers
        //app.viewModel.closeAllThemes();
        app.viewModel.deactivateAllLayers();
        //activate desired layers
        for (var i=0; i < app.viewModel.themes()[0].layers().length; i++) {
            if ( app.viewModel.themes()[0].layers()[i].name === 'OCS Lease Blocks' ) { //might be more robust if indexOf were used
                app.viewModel.themes()[0].layers()[i].activateLayer();
            }
        }
        for (var i=0; i < app.viewModel.themes()[2].layers().length; i++) {
            if ( app.viewModel.themes()[2].layers()[i].name === 'Benthic Habitats (South)' ) {
                app.viewModel.themes()[2].layers()[i].activateLayer();
            }
        }
        app.setMapPosition(-75, 37.6, 8);
        $('#activeTab').tab('show');

        //start the tour
        setTimeout( function() { $.pageguide('open'); }, 700 );

        app.pageguide.togglingTours = false;
    };

    self.startDesignsTour = function() {
        if ( $.pageguide('isOpen') ) { // activated when 'tour' is clicked
            // close the pageguide
            app.pageguide.togglingTours = true;
            $.pageguide('close');
        } else {
            //save state
            app.pageguide.state = app.getState();
            app.saveStateMode = false;
        }

        //show the designs panel
        $('#designsTab').tab('show');

        //ensure pageguide is managing the default guide
        $.pageguide(designsGuide, designsGuideOverrides);

        //adding delay to ensure the message will load
        setTimeout( function() { $.pageguide('open'); }, 700 );

        app.pageguide.togglingTours = false;
    };


    //if toggling legend or layers panel during default pageguide, then correct step 4 position
    self.correctTourPosition = function() {
        // if ( $.pageguide('isOpen') ) {
        //     if ($.pageguide().guide().id === 'default-guide') {
        //         $.pageguide('showStep', $.pageguide().guide().steps.length-1);
        //     }
        // }
    };

    self.showMapAttribution = function() {
        $('.olControlScaleBar').show();
        $('.olControlAttribution').show();
    };
    self.hideMapAttribution = function() {
        $('.olControlScaleBar').hide();
        $('.olControlAttribution').hide();
    };

    self.convertToSlug = function(orig) {
        return orig
            .toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-');
    };

    self.getWindPlanningAreaAttributes = function (data) {
        attrs = [];
        if ('INFO' in data) {
            var state = data.INFO,
                first = state.indexOf("Call"),
                second = state.indexOf("WEA"),
                third = state.indexOf("RFI");
            /*if (first !== -1) {
                state = state.slice(0, first);
            } else if (second !== -1) {
                state = state.slice(0, second);
            } else if (third !== -1) {
                state = state.slice(0, third);
            }*/
            attrs.push({'display': '', 'data': state});
        }
        return attrs;
    };

    self.getSeaTurtleAttributes = function (data) {
        attrs = [];
        if ('ST_LK_NUM' in data && data['ST_LK_NUM']) {
            //attrs.push({'display': 'Sightings', 'data': data['ST_LK_NUM']});
            if (data['ST_LK_NUM'] === 99) {
                attrs.push({'display': 'Insufficient Data available for this area', 'data': ''});
            } else {
                attrs.push({'display': 'Above Average Sightings for the following species:', 'data': ''});
            }
        } else {
            attrs.push({'display': 'Sightings were in the normal range for all species', 'data': ''});
        }

        if ('ST_LK_NUM' in data && data['ST_LK_NUM'] ) {
            var season, species, sighting;
            if ('GREEN_LK' in data && data['GREEN_LK']) {
                season = data['GREEN_LK'];
                species = 'Green Sea Turtle';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
            if ('LEATH_LK' in data && data['LEATH_LK']) {
                season = data['LEATH_LK'];
                species = 'Leatherback Sea Turtle';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
            if ('LOGG_LK' in data && data['LOGG_LK']) {
                season = data['LOGG_LK'];
                species = 'Loggerhead Sea Turtle';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
        }
        return attrs;
    };

    var getEFHData = function(keys) {
        var output = [];
        if (keys.indexOf('X') !== -1) {
            output.push('Life stage data not developed');
        } else {
            if (keys.indexOf('E') !== -1) {
                output.push('Eggs');
            }
            if (keys.indexOf('L') !== -1) {
                output.push('Larvae');
            }
            if (keys.indexOf('J') !== -1) {
                output.push('Juveniles');
            }
            if (keys.indexOf('A') !== -1) {
                output.push('Adults');
            }
        }
        return output.join(', ');
    };

    self.getEFHAttributes = function (data) {
        attrs = [];

        if ('American_P' in data && data['American_P']) {
            output = getEFHData(data['American_P']);
            attrs.push({'display': 'American Plaice', 'data': output});
        }
        if ('Atlantic_C' in data && data['Atlantic_C']) {
            output = getEFHData(data['Atlantic_C']);
            attrs.push({'display': 'Atlantic Cod', 'data': output});
        }
        if ('Atlantic_1' in data && data['Atlantic_1']) {
            output = getEFHData(data['Atlantic_1']);
            attrs.push({'display': 'Atlantic Halibut', 'data': output});
        }
        if ('Atlantic_H' in data && data['Atlantic_H']) {
            output = getEFHData(data['Atlantic_H']);
            attrs.push({'display': 'Atlantic Herring', 'data': output});
        }
        if ('Atlantic_S' in data && data['Atlantic_S']) {
            output = getEFHData(data['Atlantic_S']);
            attrs.push({'display': 'Atlantic Sea Scallop', 'data': output});
        }
        if ('Atlantic_W' in data && data['Atlantic_W']) {
            output = getEFHData(data['Atlantic_W']);
            attrs.push({'display': 'Atlantic Wolffish', 'data': output});
        }
        if ('Barndoor_S' in data && data['Barndoor_S']) {
            output = getEFHData(data['Barndoor_S']);
            attrs.push({'display': 'Barndoor Skate', 'data': output});
        }
        if ('Black_Sea_' in data && data['Black_Sea_']) {
            output = getEFHData(data['Black_Sea_']);
            attrs.push({'display': 'Black Sea Bass', 'data': output});
        }
        if ('Bluefish' in data && data['Bluefish']) {
            output = getEFHData(data['Bluefish']);
            attrs.push({'display': 'Bluefish', 'data': output});
        }
        if ('Butterfish' in data && data['Butterfish']) {
            output = getEFHData(data['Butterfish']);
            attrs.push({'display': 'Butterfish', 'data': output});
        }
        if ('Clearnose_' in data && data['Clearnose_']) {
            output = getEFHData(data['Clearnose_']);
            attrs.push({'display': 'Clearnose Skate', 'data': output});
        }
        if ('Haddock' in data && data['Haddock']) {
            output = getEFHData(data['Haddock']);
            attrs.push({'display': 'Haddock', 'data': output});
        }
        if ('Little_Ska' in data && data['Little_Ska']) {
            output = getEFHData(data['Little_Ska']);
            attrs.push({'display': 'Little Skate', 'data': output});
        }
        if ('Longfin_In' in data && data['Longfin_In']) {
            output = getEFHData(data['Longfin_In']);
            attrs.push({'display': 'Longfin Inshore Squid', 'data': output});
        }
        if ('Mackerel' in data && data['Mackerel']) {
            output = getEFHData(data['Mackerel']);
            attrs.push({'display': 'Mackerel', 'data': output});
        }
        if ('Monkfish' in data && data['Monkfish']) {
            output = getEFHData(data['Monkfish']);
            attrs.push({'display': 'Monkfish', 'data': output});
        }
        if ('Northern_S' in data && data['Northern_S']) {
            output = getEFHData(data['Northern_S']);
            attrs.push({'display': 'Northern Shortfin Squid', 'data': output});
        }
        if ('Ocean_Pout' in data && data['Ocean_Pout']) {
            output = getEFHData(data['Ocean_Pout']);
            attrs.push({'display': 'Ocean Pout', 'data': output});
        }
        if ('Offshore_H' in data && data['Offshore_H']) {
            output = getEFHData(data['Offshore_H']);
            attrs.push({'display': 'Offshore Hake', 'data': output});
        }
        if ('Pollock' in data && data['Pollock']) {
            output = getEFHData(data['Pollock']);
            attrs.push({'display': 'Pollock', 'data': output});
        }
        if ('Quahog' in data && data['Quahog']) {
            output = getEFHData(data['Quahog']);
            attrs.push({'display': 'Quahog', 'data': output});
        }
        if ('Red_Crab' in data && data['Red_Crab']) {
            output = getEFHData(data['Red_Crab']);
            attrs.push({'display': 'Red Crab', 'data': output});
        }
        if ('Red_Hake' in data && data['Red_Hake']) {
            output = getEFHData(data['Red_Hake']);
            attrs.push({'display': 'Red Hake', 'data': output});
        }
        if ('Redfish' in data && data['Redfish']) {
            output = getEFHData(data['Redfish']);
            attrs.push({'display': 'Redfish', 'data': output});
        }
        if ('Rosette_Sk' in data && data['Rosette_Sk']) {
            output = getEFHData(data['Rosette_Sk']);
            attrs.push({'display': 'Rosette Skate', 'data': output});
        }
        if ('Scup' in data && data['Scup']) {
            output = getEFHData(data['Scup']);
            attrs.push({'display': 'Scup', 'data': output});
        }
        if ('Silver_Hak' in data && data['Silver_Hak']) {
            output = getEFHData(data['Silver_Hak']);
            attrs.push({'display': 'Silver Hake', 'data': output});
        }
        if ('Smooth_Ska' in data && data['Smooth_Ska']) {
            output = getEFHData(data['Smooth_Ska']);
            attrs.push({'display': 'Smooth Skate', 'data': output});
        }
        if ('Spiny_Dogf' in data && data['Spiny_Dogf']) {
            output = getEFHData(data['Spiny_Dogf']);
            attrs.push({'display': 'Spiny Dogfish', 'data': output});
        }
        if ('Summer_Flo' in data && data['Summer_Flo']) {
            output = getEFHData(data['Summer_Flo']);
            attrs.push({'display': 'Summer Flounder', 'data': output});
        }
        if ('Surfclam' in data && data['Surfclam']) {
            output = getEFHData(data['Surfclam']);
            attrs.push({'display': 'Surfclam', 'data': output});
        }
        if ('Thorny_Ska' in data && data['Thorny_Ska']) {
            output = getEFHData(data['Thorny_Ska']);
            attrs.push({'display': 'Thorny Skate', 'data': output});
        }
        if ('Tilefish' in data && data['Tilefish']) {
            output = getEFHData(data['Tilefish']);
            attrs.push({'display': 'Tilefish', 'data': output});
        }
        if ('Witch_Flou' in data && data['Witch_Flou']) {
            output = getEFHData(data['Witch_Flou']);
            attrs.push({'display': 'Witch Flounder', 'data': output});
        }
        if ('White_Hake' in data && data['White_Hake']) {
            output = getEFHData(data['White_Hake']);
            attrs.push({'display': 'White Hake', 'data': output});
        }
        if ('Windowpane' in data && data['Windowpane']) {
            output = getEFHData(data['Windowpane']);
            attrs.push({'display': 'Windowpane', 'data': output});
        }
        if ('Winter_Flo' in data && data['Winter_Flo']) {
            output = getEFHData(data['Winter_Flo']);
            attrs.push({'display': 'Winter Flounder', 'data': output});
        }
        if ('Winter_Ska' in data && data['Winter_Ska']) {
            output = getEFHData(data['Winter_Ska']);
            attrs.push({'display': 'Winter Skate', 'data': output});
        }
        if ('Yellowtail' in data && data['Yellowtail']) {
            output = getEFHData(data['Yellowtail']);
            attrs.push({'display': 'Yellowtail', 'data': output});
        }
        if ('Species_Co' in data && data['Species_Co']) {
            attrs.unshift({'display': '', 'data': data['Species_Co'] + ' Overlapping Essential Fish Habitats'});
        }
        return attrs;
    };

    self.getToothedMammalAttributes = function (data) {
        attrs = [];
        if ('TOO_LK_NUM' in data && data['TOO_LK_NUM']) {
            if (data['TOO_LK_NUM'] === 99) {
                attrs.push({'display': 'Insufficient Data available for this area', 'data': ''});
            } else {
                attrs.push({'display': 'Above Average Sightings for the following species:', 'data': ''});
            }
        } else {
            attrs.push({'display': 'Sightings were in the normal range for all species', 'data': ''});
        }
        if ('TOO_LK_NUM' in data && data['TOO_LK_NUM'] ) {
            var season, species, sighting;
            if ('SPERM_LK' in data && data['SPERM_LK']) {
                season = data['SPERM_LK'];
                species = 'Sperm Whale';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
            if ('BND_LK' in data && data['BND_LK']) {
                season = data['BND_LK'];
                species = 'Bottlenose Dolphin';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
            if ('STRIP_LK' in data && data['STRIP_LK']) {
                season = data['STRIP_LK'];
                species = 'Striped Dolphin';
                sighting = species + ' (' + season + ') ';
                attrs.push({'display': '', 'data': sighting});
            }
        }
        return attrs;
    };

    self.getWindSpeedAttributes = function (data) {
        attrs = [];
        if ('SPEED_90' in data) {
            var min_speed = (parseFloat(data['SPEED_90'])-0.125).toPrecision(3),
                max_speed = (parseFloat(data['SPEED_90'])+0.125).toPrecision(3);
            attrs.push({'display': 'Estimated Avg Wind Speed', 'data': min_speed + ' to ' + max_speed + ' m/s'});
        }
        return attrs;
    };

    self.adjustPartyCharterAttributes = function (attrs) {
        for (var x=0; x<attrs.length; x=x+1) {
            attrs[x].display = 'Total Trips (2000-2009)';
        }
        return attrs;
    };

    self.isSelectedLeaseBlock = function(name) {
        if (name === "OCS Lease Blocks") {
            return true;
        }
        if (self.scenarios &&
            self.scenarios.selectionFormModel &&
            self.scenarios.selectionFormModel.selectedLeaseBlockLayer &&
            self.scenarios.selectionFormModel.selectedLeaseBlocksLayerName === name) {
            return true;
        }
        if (self.scenarios &&
            self.scenarios.scenarioFormModel &&
            self.scenarios.scenarioLeaseBlocksLayerName === name) {
            return true;
        }
        return false;
    };


    self.getChannelAttributes = function (data) {
        attrs = [];
        if ('location' in data) {
            attrs.push({'display': '', 'data': data['location']});
        }
        if ('minimumDep' in data) {
            var meters = data['minimumDep'],
                feet =  new Number(meters * 3.28084).toPrecision(2);
            attrs.push({'display': 'Minimum Depth', 'data': feet + ' feet'}); // + meters + ' meters)'});
        }
        return attrs;
    };

    self.getPortOwnershipAttributes = function (data) {
        attrs = [];
        if ('Ownership' in data) {
            attrs.push({'display': '', 'data': data['Ownership']});
        }
        return attrs;
    };

    self.getPortCommodityAttributes = function (data) {
        attrs = [];
        if ('Commodity_' in data) {
            var commodity = 'Unknown';
            switch (data['Commodity_']) {
                case 0:
                    commodity = 'Not applicable';
                    break;
                case 10:
                    commodity = 'Coal';
                    break;
                case 20:
                    commodity = 'Petroleum & petroleum products';
                    break;
                case 30:
                    commodity = 'Chemicals & related products';
                    break;
                case 40:
                    commodity = 'Crude materials, inedible, except fuels';
                    break;
                case 50:
                    commodity = 'Primary manufactured goods';
                    break;
                case 60:
                    commodity = 'Food & farm products';
                    break;
                case 70:
                    commodity = 'All manufactured equipment and machinery';
                    break;
                case 80:
                    commodity = 'Waste material; garbage, landfill, sewage sludge & waste water';
                    break;
                case 91:
                    commodity = 'Multi-commodities';
                    break;
                case 99:
                    commodity = 'Unknown';
                    break;
            }
            attrs.push({'display': '', 'data': commodity});
        }
        return attrs;
    };

    self.getOCSAttributes = function (data) {
        attrs = [];
        if ('BLOCK_LAB' in data) {
            attrs.push({'display': 'OCS Block Number', 'data': data['BLOCK_LAB']});
        } else if ('PROT_NUMB' in data) {
            var blockLab = data['PROT_NUMB'].substring(data['PROT_NUMB'].indexOf('_')+1);
            attrs.push({'display': 'OCS Block Number', 'data': blockLab});
        }
        if ('PROT_NUMBE' in data) {
            attrs.push({'display': 'Protraction Number', 'data': data['PROT_NUMBE']});
        }else if ('PROT_NUMB' in data) {
            var protNumbe = data['PROT_NUMB'].substring(0,data['PROT_NUMB'].indexOf('_'));
            attrs.push({'display': 'Protraction Number', 'data': protNumbe});
        }
        if ('PROT_NUMB' in data) {
            if (self.scenarios &&
                self.scenarios.selectionFormModel &&
                self.scenarios.selectionFormModel.IE &&
                self.scenarios.selectionFormModel.selectingLeaseBlocks()) {
                var blockID = data['PROT_NUMB'],
                    index = self.scenarios.selectionFormModel.selectedLeaseBlocks.indexOf(blockID);
                if ( index === -1) {
                    //add that lease block to the list of selected leaseblocks
                    self.scenarios.selectionFormModel.selectedLeaseBlocks.push(blockID);
                } else {
                    //remove that lease block from the list of selected leaseblocks
                    self.scenarios.selectionFormModel.selectedLeaseBlocks.splice(index, 1);
                }
            }
        }

        //Wind Speed
        if ('WINDREV_MI' in data && 'WINDREV_MA' in data) {
            if ( data['WINDREV_MI'] ) {
                var min_speed = data['WINDREV_MI'].toFixed(3),
                    max_speed = data['WINDREV_MA'].toFixed(3),
                    min_range = (parseFloat(min_speed)-.125).toPrecision(3),
                    max_range = (parseFloat(max_speed)+.125).toPrecision(3);
                /*if ( min_speed === max_speed ) {
                    attrs.push({'display': 'Estimated Avg Wind Speed (m/s)', 'data': speed});
                } else {
                    var speed = (min_speed-.125) + ' to ' + (max_speed+.125);
                    attrs.push({'display': 'Estimated Avg Wind Speed (m/s)', 'data': speed});
                }*/
                attrs.push({'display': 'Estimated Avg Wind Speed', 'data': min_range + ' to ' + max_range + ' m/s'});
            } else {
                attrs.push({'display': 'Estimated Avg Wind Speed', 'data': 'Unknown'});
            }
        }

        //Distance to Coastal Substation
        if ('SUBSTAMIN' in data && 'SUBSTMAX' in data) {
            if (data['SUBSTAMIN'] !== 0 && data['SUBSTMAX'] !== 0) {
                attrs.push({'display': 'Distance to Coastal Substation', 'data': data['SUBSTAMIN'].toFixed(0) + ' to ' + data['SUBSTMAX'].toFixed(0) + ' miles'});
            } else {
                attrs.push({'display': 'Distance to Coastal Substation Unknown', 'data': null});
            }
        }

        //Distance to AWC Hubs
        if ('AWCMI_MIN' in data && 'AWCMI_MAX' in data) {
            attrs.push({'display': 'Distance to Proposed AWC Hub', 'data': data['AWCMI_MIN'].toFixed(0) + ' to ' + data['AWCMI_MAX'].toFixed(0) + ' miles'});
        }

        //Wind Planning Areas
        if ('WEA2' in data && data['WEA2'] !== 0) {
            var weaName = data['WEA2_NAME'],
                stateName = weaName.substring(0, weaName.indexOf(' '));
            if (stateName === 'New') {
                stateName = 'New Jersey';
            } else if (stateName === 'Rhode') {
                stateName = 'Rhode Island / Massachusetts';
            }
            //if ( data['WEA2_NAME'].replace(/\s+/g, '') !== "" ) {
            //TAKING THIS OUT TEMPORARILY UNTIL WE HAVE UPDATED THE DATA SUMMARY FOR WPAS AND LEASE AREAS
            //attrs.push({'display': 'Within the ' + stateName + ' WPA', 'data': null});
            //}
        }

        //Distance to Shipping Lanes
        if ('TRAFFCMIN' in data && 'TRAFFCMAX' in data) {
            attrs.push({'display': 'Distance to Ship Routing Measures', 'data': data['TRAFFCMIN'].toFixed(0) + ' to ' + data['TRAFFCMAX'].toFixed(0) + ' miles'});
        }

        //Distance to Shore
        if ('MI_MIN' in data && 'MI_MAX' in data) {
            attrs.push({'display': 'Distance to Shore', 'data': data['MI_MIN'].toFixed(0) + ' to ' + data['MI_MAX'].toFixed(0) + ' miles'});
        }

        //Depth Range
        if ('DEPTHM_MIN' in data && 'DEPTHM_MAX' in data) {
            if ( data['DEPTHM_MIN'] ) {
                //convert depth values to positive feet values (from negative meter values)
                var max_depth = (-data['DEPTHM_MAX']).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    min_depth = (-data['DEPTHM_MIN']).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                attrs.push({'display': 'Depth Range', 'data': max_depth + ' to ' + min_depth + ' meters'});
            } else {
                attrs.push({'display': 'Depth Range', 'data': 'Unknown'});
            }
        }

        //Seabed Form
        if ('PCT_TOTAL' in data) {
            if (data['PCT_TOTAL'] < 99.9) {
                attrs.push({'display': 'Seabed Form', 'data': 'Unknown'});
            } else {
                attrs.push({'display': 'Seabed Form', 'data': ''});
                if ('PCTDEPRESS' in data && Math.round(data['PCTDEPRESS']) > 0) {
                    attrs.push({'tab': true, 'display': 'Depression (' + Math.round(data['PCTDEPRESS']) + '%)', 'data': ''});
                }
                if ('PCTHIGHFLA' in data && Math.round(data['PCTHIGHFLA']) > 0) {
                    attrs.push({'tab': true, 'display': 'High Flat (' + Math.round(data['PCTHIGHFLA']) + '%)', 'data': ''});
                }
                if ('PCTHIGHSLO' in data && Math.round(data['PCTHIGHSLO']) > 0) {
                    attrs.push({'tab': true, 'display': 'High Slope (' + Math.round(data['PCTHIGHSLO']) + '%)', 'data': ''});
                }
                if ('PCTLOWSLOP' in data && Math.round(data['PCTLOWSLOP']) > 0) {
                    attrs.push({'tab': true, 'display': 'Low Slope (' + Math.round(data['PCTLOWSLOP']) + '%)', 'data': ''});
                }
                if ('PCTMIDFLAT' in data && Math.round(data['PCTMIDFLAT']) > 0) {
                    attrs.push({'tab': true, 'display': 'Mid Flat (' + Math.round(data['PCTMIDFLAT']) + '%)', 'data': ''});
                }
                if ('PCTSIDESLO' in data && Math.round(data['PCTSIDESLO']) > 0) {
                    attrs.push({'tab': true, 'display': 'Side Slope (' + Math.round(data['PCTSIDESLO']) + '%)', 'data': ''});
                }
                if ('PCTSTEEP' in data && Math.round(data['PCTSTEEP']) > 0) {
                    attrs.push({'tab': true, 'display': 'Steep (' + Math.round(data['PCTSTEEP']) + '%)', 'data': ''});
                }
            }
        }

        //Coral Count
        var coralCount = 0,
            laceCount = 0,
            blackCount = 0,
            softCount = 0,
            gorgoCount = 0,
            hardCount = 0;
        if ('FREQ_LACE' in data) {
            laceCount = data['FREQ_LACE'];
            coralCount += laceCount;
        }
        if ('FREQ_BLACK' in data) {
            blackCount = data['FREQ_BLACK'];
            coralCount += blackCount;
        }
        if ('FREQ_SOFT' in data) {
            softCount = data['FREQ_SOFT'];
            coralCount += softCount;
        }
        if ('FREQ_GORGO' in data) {
            gorgoCount = data['FREQ_GORGO'];
            coralCount += gorgoCount;
        }
        if ('FREQ_HARD' in data) {
            hardCount = data['FREQ_HARD'];
            coralCount += hardCount;
        }
        if (coralCount > 0) {
            attrs.push({'display': 'Identified Corals', 'data': coralCount});
            if (laceCount > 0) {
                attrs.push({'tab': true, 'display': 'Lace Corals (' + laceCount + ')', 'data': ''});
            }
            if (blackCount > 0) {
                attrs.push({'tab': true, 'display': 'Black/Thorny Corals (' + blackCount + ')', 'data': ''});
            }
            if (softCount > 0) {
                attrs.push({'tab': true, 'display': 'Soft Corals (' + softCount + ')', 'data': ''});
            }
            if (gorgoCount > 0) {
                attrs.push({'tab': true, 'display': 'Gorgonian Corals (' + gorgoCount + ')', 'data': ''});
            }
            if (hardCount > 0) {
                attrs.push({'tab': true, 'display': 'Hard Corals (' + hardCount + ')', 'data': ''});
            }
        }
        if ('FREQ_PENS' in data && data['FREQ_PENS'] > 0) {
            var seaPenCount = data['FREQ_PENS'];
            attrs.push({'display': 'Sea Pens Identified', 'data': seaPenCount});
        }

        //Shipwrecks
        if ('BOEMSHPDEN' in data) {
            attrs.push({'display': 'Number of Shipwrecks', 'data': data['BOEMSHPDEN']});
        }

        //Distance to Discharge Point Locations
        if ('DISCHMEAN' in data) {
            attrs.push({'display': 'Avg Distance to Offshore Discharge', 'data': data['DISCHMEAN'].toFixed(1) + ' miles'});
        }
        if ('DFLOWMEAN' in data) {
            attrs.push({'display': 'Avg Distance to Flow-Only Offshore Discharge', 'data': data['DFLOWMEAN'].toFixed(1) + ' miles'});
        }

        //Dredge Disposal Locations
        if ('DREDGE_LOC' in data) {
            if (data['DREDGE_LOC'] > 0) {
                attrs.push({'display': 'Contains a Dredge Disposal Location', 'data': ''});
            } else {
                attrs.push({'display': 'Does not contain a Dredge Disposal Location', 'data': ''});
            }
        }

        //Unexploded Ordinances
        if ('UXO' in data) {
            if (data['UXO'] === 0) {
                attrs.push({'display': 'No known Unexploded Ordnances', 'data': ''});
            } else {
                attrs.push({'display': 'Known to contain Unexploded Ordnance(s)', 'data': ''});
            }
        }

        //Traffic Density (High/Moderate/Low)
        if ('PCTALL_LO' in data && data['PCTALL_LO'] !== 999) {
            attrs.push({'display': 'Ship Traffic Density (All Vessels)', 'data': ''});
            if (data['PCTALL_LO'] > 0) {
                attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTALL_LO'] + '%'});
            }
            if (data['PCTALL_ME'] > 0) {
                attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTALL_ME'] + '%'});
            }
            if (data['PCTALL_HI'] > 0) {
                attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTALL_HI'] + '%'});
            }
        }
        if ('PCTCAR_LO' in data && data['PCTCAR_LO'] !== 999) {
            attrs.push({'display': 'Ship Traffic Density (Cargo Vessels)', 'data': ''});
            if (data['PCTCAR_LO'] > 0) {
                attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTCAR_LO'] + '%'});
            }
            if (data['PCTCAR_ME'] > 0) {
                attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTCAR_ME'] + '%'});
            }
            if (data['PCTCAR_HI'] > 0) {
                attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTCAR_HI'] + '%'});
            }
        }
        if ('PCTPAS_LO' in data && data['PCTPAS_LO'] !== 999) {
            attrs.push({'display': 'Ship Traffic Density (Passenger Vessels)', 'data': ''});
            if (data['PCTPAS_LO'] > 0) {
                attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTPAS_LO'] + '%'});
            }
            if (data['PCTPAS_ME'] > 0) {
                attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTPAS_ME'] + '%'});
            }
            if (data['PCTPAS_HI'] > 0) {
                attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTPAS_HI'] + '%'});
            }
        }
        if ('PCTTAN_LO' in data && data['PCTTAN_LO'] !== 999) {
            attrs.push({'display': 'Ship Traffic Density (Tanker Vessels)', 'data': ''});
            if (data['PCTTAN_LO'] > 0) {
                attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTTAN_LO'] + '%'});
            }
            if (data['PCTTAN_ME'] > 0) {
                attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTTAN_ME'] + '%'});
            }
            if (data['PCTTAN_HI'] > 0) {
                attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTTAN_HI'] + '%'});
            }
        }
        if ('PCTTUG_LO' in data && data['PCTTUG_LO'] !== 999) {
            attrs.push({'display': 'Ship Traffic Density (Tug/Tow Vessels)', 'data': ''});
            if (data['PCTTUG_LO'] > 0) {
                attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTTUG_LO'] + '%'});
            }
            if (data['PCTTUG_ME'] > 0) {
                attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTTUG_ME'] + '%'});
            }
            if (data['PCTTUG_HI'] > 0) {
                attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTTUG_HI'] + '%'});
            }
        }
        // if ('AIS7_MEAN' in data) {
        //     if ( data['AIS7_MEAN'] < 1 ) {
        //         var rank = 'Low';
        //     } else {
        //         var rank = 'High';
        //     }
        //     attrs.push({'display': 'Commercial Ship Traffic Density', 'data': rank });
        // }

        return attrs;
    };

    self.adjustAidsToNavigationAttributes = function (attrObj) {
        aidType = _.find(attrObj, function(obj) { return obj["display"] === 'Aid Type'; });
        if ( aidType["data"] === "PA" ) {
            aidType["data"] = "PA (Position Approximate)";
        } else if (aidType["data"] === "PD" ) {
            aidType["data"] = "PD (Position Doubtful)";
        } else if (aidType["data"] === "FD" ) {
            aidType["data"] = "FD (Undocumented)";
        }
    }

    return self;
} //end viewModel

app.viewModel = new viewModel();
