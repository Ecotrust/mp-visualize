function layerModel(options, parent) {
    var self = this,
        $descriptionTemp;

    // properties
    self.fullyLoaded = false;

    self.legendVisibility = ko.observable(false);
    self.themes = ko.observableArray();
    self.description = ko.observable();

    self.isDisabled = ko.observable(false);
    self.disabledMessage = ko.observable(false);

    self.loadStatus = ko.observable(false);

    //on-the-fly session layers
    self.wmsSession = ko.observable(false);

    self.is_visible_multilayer = ko.observable(false);

    //these are necessary to prevent knockout errors when offering non-designs in Active panel
    self.sharedBy = ko.observable(false);
    self.sharedWith = ko.observable(false);
    self.selectedGroups = ko.observableArray();
    self.shared = ko.observable(false);

    // is description active
    self.infoActive = ko.observable(false);

    // is the layer in the active panel?
    self.active = ko.observable(false);
    // is the layer visible?
    self.visible = ko.observable(false);

    self.activeSublayer = ko.observable(false);
    self.visibleSublayer = ko.observable(false);

    // is the layer a checkbox layer
    self.isCheckBoxLayer = ko.observable(false);

    self.data_url = ko.observable(options.data_url || null);
    self.kml = ko.observable(options.kml || null);
    self.data_download = ko.observable(options.data_download || null);
    self.metadata = ko.observable(options.metadata || null);
    self.source = ko.observable(options.source || null);
    self.hasInfo = ko.observable(false);

    self.minZoom = 0;
    self.maxZoom = 24;

    // if layer is loaded from hash, preserve opacity, etc...
    self.override_defaults = ko.observable(null);

    self.setOptions = function(options, parent) {

      self.id = options.id || null;
      self.name = options.name || null;
      self.featureAttributionName = self.name;
      self.order = options.order;
      self.type = options.type || null
      self.url = options.url || null;
      if (self.url && ["ArcRest",].indexOf(self.type) >= 0 && self.url.toLowerCase().indexOf("/export") == -1) {
        let url_split =  self.url.split('?');
        let export_flag = '/export';
        if (url_split[0][url_split[0].length-1] == "/") {
          export_flag = 'export';
        }
        url_split[0] = url_split[0] + export_flag;
        self.url = url_split.join('?');
      }
      self.data_url(options.data_url || null);
      self.arcgislayers = options.arcgis_layers || 0;
      self.wms_slug = options.wms_slug || null;
      self.wms_version = options.wms_version || null;
      self.wms_format = options.wms_format || null;
      self.wms_srs = options.wms_srs || null;
      self.wms_styles = options.wms_styles || null;
      self.wms_timing = options.wms_timing || null;
      self.wms_time_item = options.wms_time_item || null;
      self.wms_additional = options.wms_additional || null;
      self.wms_info = options.wms_info || false;
      self.wms_info_format = options.wms_info_format || null;
      self.utfurl = options.utfurl || false;
      self.legend = options.legend || false;

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

      self.legendTitle = options.legend_title || false;
      self.legendSubTitle = options.legend_subtitle || false;
      if (options.hasOwnProperty('show_legend') && options.show_legend == false) {
        self.show_legend = false;
      } else {
        self.show_legend = true;
      }

      self.label_field = options.label_field || false;
      self.attributes = options.attributes ? options.attributes.attributes : [];
      self.compress_attributes = options.attributes ? options.attributes.compress_attributes : false;
      self.preserved_format_attributes = options.attributes ? options.attributes.preserved_format_attributes : [];
      self.attributeEvent = options.attributes ? options.attributes.event : [];
      self.mouseoverAttribute = options.attributes ? options.attributes.mouseover_attribute : false;
      self.lookupField = options.lookups ? options.lookups.field : null;
      self.lookupDetails = options.lookups ? options.lookups.details : [];
      self.minZoom = options.minZoom || 0;
      self.maxZoom = options.maxZoom || 24;
      self.custom_style = options.custom_style || null;
      if (self.custom_style == null || self.custom_style.length == 0) {
        self.color = options.color || "#ee9900";
      } else {
        self.color = 'custom:' + self.custom_style;
      }
      self.override_color = options.color || false;
      self.outline_color = options.outline_color || self.color;
      self.override_outline = options.outline_color || false;
      self.fillOpacity = options.fill_opacity || 0.0;
      self.proxy_url = options.proxy_url || false;
      if (self.proxy_url) {
        // RDH 2022-06-07: Proxies are hard.
        //  * we include the layer_id to provide security -- does the requested URL domain match the layer's domain in the DB?
        //  * We encode the URL -- this means we also need to re-write all logic that parses the URL (like legend, export, and query)
        //  * finally, we add proxy_params=true -- this gives us a nice pattern to break on (anything appended is assumed to be meant for 'url')
        self.url = "/visualize/proxy?layer_id=" + self.id + "&url=" + encodeURIComponent(self.url) + "%3F&proxy_params=true";
        if (self.type == "XYZ" || self.type == "VectorTile") {
          // RDH 2022-06-07: Proxies get harder
          //  XYZ templates are interpreted client-side by OpenLayers, so they CAN'T be encoded, or OL will never recognize them.
          //  This block restores them back to an un-encoded format.
          let templates = ["{x}", "{X}","{y}","{Y}","{z}","{Z}"];
          for (var i = 0; i < templates.length; i++) {
            let encoded_template = encodeURIComponent(templates[i]);
            if (self.url.indexOf(encoded_template) >= 0) {
              self.url = self.url.split(encoded_template).join(templates[i]);
            }
          }
        }
      }
      self.query_by_point = options.query_by_point || false;
      self.disable_click = options.disable_arcgis_attributes || false;

      if (!self.hasOwnProperty('opacity')) {
        if ( !options.opacity === 0 ) {
          self.defaultOpacity = options.opacity;
        } else {
          self.defaultOpacity = options.opacity || 0.5;
        }
        self.opacity = ko.observable(self.defaultOpacity);
      } else {
        if (options.hasOwnProperty('opacity') && options.opacity != undefined && options.opacity != null) {
          self.opacity(options.opacity);
        }
      }
      self.outline_opacity = options.outline_opacity || self.defaultOpacity;
      self.outline_width = options.outline_width || 1;  // This was removed in one branch (RDH: 2020-08-25)
      self.override_outline_width = options.outline_width || false;
      self.point_radius = options.point_radius || 5;
      self.graphic = options.graphic || null;
      self.graphic_scale = options.graphic_scale || null;  // This was removed in one branch (RDH: 2020-08-25)
      self.annotated = options.annotated || false;

      if (options.is_disabled) {
        self.isDisabled(options.is_disabled);
      }
      if (options.disabled_message) {
        self.disabledMessage(options.disabled_message);
      }
      if (self.annotated && app.viewModel.zoomLevel() < 9) {
        self.isDisabled(true);
        self.disabledMessage(options.disabled_message);
      }

      if (options.wmsSession) {
        self.wmsSession(options.wmsSession)
      }

      // mdat/marine life layers
      self.isMDAT = options.isMDAT || false;
      self.parentMDATDirectory = options.parentDirectory || null;

      // VTR/CAS life layers
      self.isVTR = options.isVTR || false;
      self.dateRangeDirectory = options.dateRangeDirectory || null;
      self.isDrawingModel = options.isDrawingModel || false;
      self.isSelectionModel = options.isSelectionModel || false;

      //tied to the layer that's a companion of another layer
      self.companionLayers = options.companion_layers || false;
      //has companion layer(s)
      self.hasCompanion = options.has_companion || false;

      self.is_multilayer_parent = ko.observable(options.is_multilayer_parent || false);
      self.is_multilayer = ko.observable((options.is_multilayer && !options.is_multilayer_parent) || false);

      self.associated_multilayers = options.associated_multilayers || [];
      self.dimensions = options.dimensions || [];
      self.multilayerValueLookup = {};
      self.activeMultilayer = false;
      self.multilayerSliderState = [];

      self.searchQueryable = options.search_query || false;

      if (self.featureAttributionName === 'OCS Lease Blocks') {
        self.featureAttributionName = 'OCS Lease Blocks';
      } else if (self.featureAttributionName === 'Party & Charter Boat') {
        self.featureAttributionName = 'Party & Charter Boat Trips';
      } else if (self.featureAttributionName === 'Benthic Habitats (North)' ) {
        self.featureAttributionName = 'Benthic Habitats';
      } else if (self.featureAttributionName === 'Benthic Habitats (South)' ) {
        self.featureAttributionName = 'Benthic Habitats';
      }

      //legends for actual WMS LAYERS
      if (!self.legend && self.url && self.type=='WMS' && self.wms_slug && self.wms_version) {
        if (self.url.indexOf('?') < 0) {
          self.url = self.url + '?';
        }
        self.legend = self.url + 'SERVICE=WMS&VERSION=' +
        self.wms_version + '&layer=' +
        self.wms_slug +
        "&REQUEST=GetLegendGraphic&FORMAT=image/png&SLD_VERSION=1.1.0"
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
      self.kml(options.kml || null);
      self.data_download(options.data_download || null);
      self.learn_more = options.learn_more || null;
      self.metadata(options.metadata || null);
      self.source(options.source || null);
      self.tiles = options.tiles || null;

      if (options.description || options.kml || options.data_download || options.metadata || options.source) {
          self.hasInfo(true);
      }

      if (self.type === 'checkbox') {
        self.isCheckBoxLayer(true);
      }

      self.has_sublayers = options.has_sublayers || false;
      self.subLayers = [];
      if (options.subLayers) {
        for (var i = 0; i < options.subLayers.length; i++) {
          var new_sublayer = app.viewModel.getOrCreateLayer(options.subLayers[i], self, 'return', null)
          self.subLayers.push(new_sublayer);
        }
      }

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

      // opacity
      self.opacity.subscribe(function(newOpacity) {
        // RDH 20191105 - this came in as a string - ol6 chokes on string passed to layer.setOpacity
        newOpacity = parseFloat(newOpacity);
        if (self.hasOwnProperty('layer')) {
          if (self.layer.CLASS_NAME && self.layer.CLASS_NAME === "OpenLayers.Layer.Vector") {
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
        }
        if (self.hasOwnProperty('activeMultilayer')) {
          if (self.activeMultilayer) {
            self.activeMultilayer.opacity(newOpacity);
          }
        }
      });
    }

    self.setOptions(options, parent);

    self.isUserGenerated = ko.computed(function() {
      if (self.id && typeof(self.id) == "string") {
        return (self.id.indexOf('visualize_userlayer_') == 0 || self.id.indexOf('drawing_aoi_') == 0);
      }
      return false;
    });

    self.isVisibleAtZoom = ko.pureComputed(function() {
      if (self.hasOwnProperty('minZoom') && self.hasOwnProperty('maxZoom')){
        if (self.minZoom || self.maxZoom) {
          if (self.minZoom > app.map.zoom() || self.maxZoom < app.map.zoom()) {
            return false;
          }
        }
      }
      return true;
    })


    getArcGISJSONLegend = function(self, protocol) {
      let legend_url = self.url;
      let export_flag = "/export";
      let path_separator = "/";
      let query_string_start = "?";
      let query_string_assignment = "=";
      let query_string_separator = "&";
      let protocol_separator = ":";
      if (self.proxy_url) {
        export_flag = "%2Fexport";
        path_separator = "%2F";
        query_string_start = "%3F";
        query_string_assignment = "%3D";
        query_string_separator = "%26";
        protocol_separator = "%3A";
      }
      // Append /export if it doesn't exist
      if (legend_url.toLowerCase().indexOf(export_flag.toLowerCase()) < 0) {
        var url_split = legend_url.split(query_string_start);
        if (url_split[0][url_split[0].length-1] == path_separator) {
          url_split[0] = url_split[0] + "export";
        } else {
          url_split[0] = url_split[0] + export_flag;
        }
        legend_url = url_split.join(query_string_start);
      }
      
      let legend_url_suffix = path_separator+'legend'+path_separator+query_string_start+'f'+query_string_assignment+'pjson';
      
      // Remove tile templating if using ArcGIS TileServer
      let tile_template = path_separator+['tile','{z}','{y}','{x}'].join(path_separator);
      if (legend_url.toLowerCase().indexOf(tile_template) >= 0) {
        legend_url = legend_url.split(tile_template).join('');
      }

      if (legend_url.indexOf(query_string_start) < 0) {
        var url = legend_url.replace(export_flag, legend_url_suffix);
      } else {
        var url = legend_url.split(query_string_start).join(query_string_separator).replace(export_flag, legend_url_suffix);
      }
      if (protocol == "https"+protocol_separator) {
        url = url.replace('http'+protocol_separator, 'https'+protocol_separator);
      }
      $.ajax({
          dataType: "json",
          url: url,
          type: 'GET',
          crossDomain: true,
          success: function(data) {
              // append '/export' if missing:
              //    RDH 2020-09-17: I'm not sure why self.url wasn't already modified earlier in this function, but this step is necessary
              //        as the '/export' seems to get dropped (a timeout may also have fixed the problem, but this is more absolute).
              let export_flag = "/export";
              if (self.proxy_url) {
                export_flag = "%2Fexport";
              }
              if (legend_url.toLowerCase().indexOf(export_flag.toLowerCase()) < 0) {
                  var url_split = legend_url.split(query_string_start);
                  if (url_split[0][url_split[0].length-1] == path_separator) {
                    url_split[0] = url_split[0] + "export";
                  } else {
                    url_split[0] = url_split[0] + export_flag;
                  }
                  legend_url = url_split.join(query_string_start);
              }

              if (data['layers']) {
                  if (typeof(self.arcgislayers) == "number") {
                      var requested_layers = [self.arcgislayers.toString()];
                  } else if (typeof(self.arcgislayers) == "object") {
                    var requested_layers = [];
                    for (var i = 0; i < self.arcgislayers.length; i++) {
                      requested_layers.push(self.arcgislayers[i].toString());
                    }
                  } else if (typeof(self.arcgislayers) == "string"){
                      var requested_layers = self.arcgislayers.replace(/ /g,'').split(',');
                  } else {
                    // punt
                    var requested_layers = self.arcgislayers;
                  }

                  // Prime layer with empty legend
                  self.legend = {'elements': []};

                  $.each(data['layers'], function(i, layerobj) {
                      for (var i=0; i< requested_layers.length; i++) {
                        var arc_layer = requested_layers[i];
                        if (parseInt(layerobj['layerId'], 10) === parseInt(arc_layer, 10)) {
                            $.each(layerobj['legend'], function(j, legendobj) {
                              var swatchId = '';
                              if (legendobj.hasOwnProperty('url')) {
                                swatchId = legendobj['url'];
                              } else if (legendobj.hasOwnProperty('imageData')) {
                                swatchId = legendobj['imageData'];
                              }
                              var swatchURL = legend_url.replace(export_flag, path_separator+arc_layer+path_separator+'images'+path_separator+swatchId),
                                label = legendobj['label'];
                              if (j < 1 && label === "") {
                                  label = layerobj['layerName'];
                              }
                              self.legend['elements'].push({'swatch': swatchURL, 'label': label});
                            });
                        }
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

    getArcGISJSONDescription = function(self, protocol) {
      let export_flag = "/export";
      let path_separator = "/";
      let protocol_separator = ":";
      let query_string_start = "?";
      let query_string_assignment = "=";
      if (self.proxy_url) {
        export_flag = "%2Fexport";
        path_separator = "%2F";
        protocol_separator = "%3A";
        query_string_start = "%3F";
        query_string_assignment = "%3D";
      }
      var url = self.url.replace(export_flag, path_separator+self.arcgislayers) + query_string_start + 'f' + query_string_assignment + 'pjson';
      if (protocol == "https"+protocol_separator) {
        url = url.replace('http'+protocol_separator, 'https'+protocol_separator);
      }
      $.ajax({
          dataType: "jsonp",
          url: url,
          type: 'GET',
          crossDomain: true,
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

    getArcGISFeatureServerLegend = function(self, protocol) {
      let request_url = self.url + self.arcgislayers;
      if (self.proxy_url) {
        let url_split = self.url.split(encodeURIComponent('?'));
        url_split[0] = url_split[0] + self.arcgislayers;
        request_url = url_split.join(encodeURIComponent('?'));
      }
      if (request_url.indexOf('?') == -1) {
        request_url = request_url + '?f=json';
      } else {
        request_url = request_url + '&f=json';
      }


      $.ajax({
        dataType: "jsonp",
        url: request_url,
        crossDomain: true,
        'success': function(response){
          interpretArcGISFeatureServerLegend(self, response);
        }
      });
    }

    interpretArcGISFeatureServerLegend = function(self, json) {
      self.legend = {'elements': []};
      if (json['drawingInfo']['renderer'].hasOwnProperty('uniqueValueInfos')){
        // list of unique values (esriSFS case)
        legend_items = json['drawingInfo']['renderer']['uniqueValueInfos'];
      } else if (json['drawingInfo']['renderer'].hasOwnProperty('symbol')) {
        // only 1 item (esriPMS case)
        legend_items = [json['drawingInfo']['renderer']];
      } else {
        legend_items = [];
      }

      $.each(legend_items, function(j, legendobj) {
          var type = 'swatch';
          var color = 'transparent';
          var outline_color = 'rgba(0,0,0,255)';
          // TODO: Support outline_style
          var outline_style = 'solid';
          var outline_width = '0.4';
          var label = legendobj['label'];
          if (j < 1 && label === "") {
              label = layerobj['layerName'];
          }
          if (legendobj.symbol.type == "esriPMS"){
            img_style = `fill-opacity="0" stroke="none" ` +
            `stroke-opacity="0" stroke-width="1" stroke-linecap="butt" ` +
            `stroke-linejoin="miter" stroke-miterlimit="4" x="-10" y="-10" ` +
            `width="20" height="20" preserveAspectRatio="none" ` +
            `src="data:${legendobj.symbol.contentType};base64,` +
            `${legendobj.symbol.imageData}" ` +
            `transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,10.00000000)"`;
            type = 'point_image';
            viz = `<image ${img_style} class="legend-${type}"></image>`;

          } else if (legendobj.symbol.type == "esriSFS"){
            color = 'rgba(' + legendobj.symbol.color.join(',') + ')';
            outline_color = 'rgba(' + legendobj.symbol.outline.color.join(',') + ')';
            outline_width = legendobj.symbol.outline.width;
            style = `border: ${outline_width}px ${outline_style} ${outline_color}; background-color: ${color}`;
            viz = `<div class="legend-${type}" style="${style}"></div>`;
          } else if (legendobj.symbol.type == "esriSLS"){
            color = 'rgba(' + legendobj.symbol.color.join(',') + ')';
            type = 'line';
            style = `border-top: ${legendobj.symbol.width}px ${outline_style} ${color};`;
            viz = `<div class="legend-${type}" style="${style}"></div>`;
          }
          self.legend['elements'].push({
            'type': type,
            'viz': viz,
            'label': label
          });
      });
      app.viewModel.activeLayers.notifySubscribers();

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

        layer.loadStatus(false);
        if (layer.hasOwnProperty('parent') && layer.parent) {
          layer.parent.loadStatus(false);
        }

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

        if (layer.hasOwnProperty('scenarioModel')) {
          layer.scenarioModel.active(false);
          layer.scenarioModel.visible(false);
        }

        //de-activate arcIdentifyControl (if applicable)
        if (layer.arcIdentifyControl) {
            layer.arcIdentifyControl.deactivate();
        }

        if (layer instanceof layerModel && layer.is_multilayer_parent() && layer.dimensions.length > 0){
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
        if (app.wrapper.controls.hasOwnProperty('UTFControl')){
          app.wrapper.controls.UTFControl.layers.splice($.inArray(layer.utfgrid, app.wrapper.controls.UTFControl.layers), 1);
          app.map.removeLayer(layer.utfgrid);
        }
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

    // override_defaults set to true if layer loaded from hash/bookmark where
    //    and opacity can be applied
    self.activateLayer = function(is_companion, override_defaults, callbackOverride) {
        var layer = this;
        if (override_defaults) {
          layer.override_defaults(true);
        }

        if (layer instanceof layerModel) {
          if (layer.fullyLoaded || layer.isMDAT || layer.isVTR || layer.wmsSession()) {
            if (!layer.hasOwnProperty('url') || !layer.url || layer.url.length < 1 || layer.hasOwnProperty('type') && layer.type == 'placeholder') {
              layer.loadStatus(false);
            }

            // if legend is not provided, try using legend from web services
            if ( !self.legend && self.url && (self.arcgislayers !== -1) ) {
              setTimeout(function() {
                if ( self.url.indexOf('FeatureServer') >= 0) {
                  try {
                    getArcGISFeatureServerLegend(self, window.location.profotol);
                  } catch (err) {
                    if (window.location.protocol == "http:") {
                      console.log(err);
                    } else {
                      getArcGISFeatureServerLegend(self, "http:");
                    }
                  }
                } else {
                  try {
                    // On Macs the legend seems to get overwritten w/o this timeout.
                    getArcGISJSONLegend(self, window.location.protocol);
                  } catch (err) {
                    if (window.location.protocol == "http:") {
                      console.log(err);
                    } else {
                      getArcGISJSONLegend(self, "http:");
                    }
                  }
                }
              }, 1000);
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
              if (layer.isMDAT && self.hasOwnProperty('parentMDATDirectory') && self.parentMDATDirectory) {
                self.parentMDATDirectory.visible(true);
              }

              if (layer.isVTR || layer.wmsSession()) {
                self.visible(true);
              }

              if (typeof is_companion == "undefined" || is_companion == false || is_companion != "nocompanion") {
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
              if (layer instanceof layerModel && layer.is_multilayer_parent() && layer.dimensions.length > 0){
                self.activateMultiLayers();
                self.buildMultilayerValueLookup();
              }

              self.trackLayer(layer.name);
            }
          } else {
            if (callbackOverride){
              layer.getFullLayerRecord(callbackOverride, is_companion);
            } else {
              layer.getFullLayerRecord('activateLayer', is_companion);
            }
            layer.visible(true);
          }
        } else {
          app.viewModel.getOrCreateLayer(layer, null, 'activateLayer', is_companion);
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

        if (!app.wrapper.controls.hasOwnProperty('UTFControl')) {
          app.wrapper.controls.addUTFControl();
        }
        if (app.wrapper.controls.hasOwnProperty('activateUTFGridLayer')) {
          app.wrapper.controls.activateUTFGridLayer(layer.utfgrid);
        } else {
          console.log('no function defined to activateUTFGrid layer for ' + app.map_tech);
        }
    };

    // bound to click handler for layer visibility switching in Active panel
    self.toggleVisible = function() {
        var layer = this;

        if (layer.visible()) { //make invisible
            self.setInvisible(layer);
        } else { //make visible
            self.setVisible(layer);
        }

        if (layer instanceof layerModel && layer.is_multilayer_parent() && layer.dimensions.length > 0){
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
        if (layer.utfgrid && app.wrapper.controls.hasOwnProperty('UTFControl') && app.wrapper.controls.UTFControl.layers.indexOf(layer.utfgrid) === -1) {
            app.wrapper.controls.UTFControl.layers.splice($.inArray(this, app.viewModel.activeLayers()), 0, layer.utfgrid);
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
        if (layer.utfgrid && app.wrapper.controls.hasOwnProperty('UTFControl')) {
            //the following removes this layers utfgrid from the utfcontrol and prevents continued utf attribution on this layer
            app.wrapper.controls.UTFControl.layers.splice($.inArray(this.utfgrid, app.wrapper.controls.UTFControl.layers), 1);
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
        if (layer.hasCompanion && (!layer.hasOwnProperty('companion') || layer.companion.length < 1)) {
          layer.companion = [];
          for (var i = 0; i < layer.companionLayers.length; i++) {
            var companion_description = layer.companionLayers[i];
            var companion_layer = app.viewModel.getOrCreateLayer(companion_description, null, "return", null);
            layer.companion.push(companion_layer);
            if (!companion_layer.active()) {
              app.viewModel.getOrCreateLayer(companion_description, null, "activateLayer", null);
            }
          }
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

        layer.multilayers = self.getMultilayerIds(layer.associated_multilayers, []);
        app.viewModel.trackMultilayerLoad(layer, true, null);

        for (var i = 0; i < layer.multilayers.length; i++) {
          var mlayer = app.viewModel.getLayerById(layer.multilayers[i]);
          if (!mlayer) {
            mlayer = app.viewModel.getOrCreateLayer({id: layer.multilayers[i]}, layer, 'return', null);
          }
          if (mlayer) {
            mlayer.is_multilayer(true);
            if (mlayer.fullyLoaded){
              mlayer.activateLayer();
              mlayer.opacity(0);
            } else {
              mlayer.getFullLayerRecord('multilayer', layer);
            }
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
      } else {
        // There is a bug where the slider stops working and the layer stays put
          //Somehow multilayerValueLookup is getting set to {}. I don't know how/why
          // but this takes care of the problem - RDH 2019-12-20
        if (Object.keys(self.multilayerValueLookup).length == 0) {
          self.buildMultilayerValueLookup();
        }
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
      self.dimensionLookup = {};
      for (var i = 0; i < self.dimensions.length; i++) {
        dimension = self.dimensions[i];
        self.multilayerValueLookup[dimension.label] = dimension.nodes;
        self.dimensionLookup[dimension.label] = dimension;
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
          if (self.dimensionLookup[dimension.label].hasOwnProperty('angle_labels') && self.dimensionLookup[dimension.label].angle_labels) {
            var label_left = label_width*i;
          } else {
            var label_left = label_width*i-(label_width/2);
            el.css('width', label_width + '%');
          }
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

      if (dimension.angle_labels) {
        slider_table = $( "#" + self.id + "_" + dimension.label + "_slider-table" );
        slider_table.addClass('angled');
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
      if (!self.fullyLoaded) {
        self.getFullLayerRecord('ajaxMDAT', event);
      } else {

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
                crossDomain: true,
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
                app.viewModel.activeLayer(layer);
                if (layer.showSublayers()) {
                    $layerText.val('');
                    //focus() instantiates typeahead search in models.js
                    $('.mdat-input').focus();
                }
            })
        }
      }
    }

    // array of VTR/CAS date ranges
    self.dateRanges = ko.observableArray();

    self.ajaxVTR = function(self, event) {

      if (!self.fullyLoaded) {
        self.getFullLayerRecord('ajaxVTR', event);
      } else {

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
                crossDomain: true,
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
                crossDomain: true,
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

    self.performAction = function(callbackType, evt) {
      var layer = this;
      if (callbackType == 'toggleDescription') {
        layer.toggleDescription(layer);
      } else if (callbackType == 'toggleActive') {
        layer.finishToggleActive(layer, evt);
        layer.activateLayer();
      } else if (callbackType == 'ajaxVTR') {
        layer.ajaxVTR(layer, evt);
      } else if (callbackType == 'ajaxMDAT') {
        layer.ajaxMDAT(layer, evt);
      } else if (callbackType == 'activateLayer') {
        layer.activateLayer();
      } else if (callbackType == 'updateHashStateLayers') {
        if (layer.fullyLoaded){
          app.updateHashStateLayers(layer.id, layer, null)
        } else {
          layer.getFullLayerRecord(callbackType, evt);
        }
      } else if (callbackType == 'addLayerToMap') {
        app.addLayerToMap(layer);
      } else if (callbackType == 'multilayer') {
        layer.activateLayer();
        layer.opacity(0);
        app.viewModel.trackMultilayerLoad(evt, false, layer.id.toString());
      } else if (callbackType == 'layerSearch') {
        app.viewModel.layerSearch();
      }
    }

    self.getFullLayerRecord = function(callbackType, evt) {
      var layer = this;
      if (layer.isMDAT || layer.isVTR || layer.isDrawingModel || layer.isSelectionModel || layer.hasOwnProperty('wmsSession') && layer.wmsSession()) {
        layer.fullyLoaded = true;
        if (app.map.hasOwnProperty('zoom')){
          app.map.zoom.valueHasMutated();
        }
        layer.performAction(callbackType, evt);
      } else {

        $.ajax({
          url: '/data_manager/get_layer_details/' + layer.id,
          crossDomain: true,
          success: function(data) {
            if (data.hasOwnProperty('name')) {
              layer.name = data.name;
              app.viewModel.layerIndex[layer.id.toString()] = layer;
            }
            var parent = null;
            if (data.parent){
              parent = app.viewModel.getOrCreateLayer(data.parent, null, 'return', null);
            }
            if (layer.override_defaults()) {
              // don't wipe out good data with defaults (info from hash such as opacity and visible):
              if (layer.hasOwnProperty('opacity') && layer.opacity()) {
                data.opacity = layer.opacity();
              }
            }

            layer.setOptions(data, parent);
            layer.fullyLoaded = true;
            if (app.map.hasOwnProperty('zoom')){
              app.map.zoom.valueHasMutated();
            }
            layer.performAction(callbackType, evt);
            app.viewModel.layerIndex[layer.id.toString()] = layer;

            if (!data.hasOwnProperty('url') || !data.url || !data.url.length > 0 || data.hasOwnProperty('type') && data.type == 'placeholder') {
              layer.loadStatus(false);
            }

          },
          error: function(data) {
            console.log('Failed to pull full layer record for ' + layer.name);
          }

        });
      }

    };

    // bound to click handler for layer switching
    self.toggleActive = function(self, event) {
        var layer = this;

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

        if (layer.active()) { // if layer is active
            layer.deactivateLayer();

            if (layer.hasOwnProperty('scenarioModel') && event) {
              layer.scenarioModel.deactivateLayer(self, false);
            }
        } else { // otherwise layer is not currently active
            layer.activateLayer(false, layer.is_companion, 'toggleActive');
        }

        if (layer.fullyLoaded) {
          self.finishToggleActive(self, event);
        }

        // save a ref to the active layer for editing,etc
        app.viewModel.activeLayer(layer);

        // start saving restore state again and remove restore state message from map view
        app.saveStateMode = true;
        app.viewModel.error(null);

    };

    self.finishToggleActive = function(self, event) {
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

      // start saving restore state again and remove restore state message from map view
      app.saveStateMode = true;
      app.viewModel.error(null);
      //app.viewModel.unloadedDesigns = [];

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
        if (!layer.fullyLoaded) {
          layer.getFullLayerRecord('toggleDescription', null);
        } else {
          // if no description is provided, try using the web services description
          if ( self.type == "ArcRest" && (!self.overview || !self.description()) && self.url && (self.arcgislayers !== -1) ) {
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

    self.showSlider = function(layer, e) {
      $('#activeTab').trigger('click');
      $('#myTab li[data-tab="active"]').trigger('click');
    };

    self.getDataExtent = function(layer, event) {
      if (app.wrapper.layer_functions.hasOwnProperty('getLayerExtent')) {
        return app.wrapper.layer_functions.getLayerExtent(self);
      } else {
        console.log('function "app.wrapper.layer_functions.getLayerExtent" not defined for layer for ' + app.map_tech);
      }
    }

    return self;
} // end layerModel

function themeModel(options) {
    var self = this;
    self.name = options.display_name;
    self.id = options.id;
    self.is_visible = options.is_visible;
    self.slug_name = options.name;

    // array of layers
    self.layers = ko.observableArray();

    //theme tracking Google Analytics
    self.trackTheme = function(action) {
        ga('send', 'event', 'Themes Activated', action);
    };

    //Get Theme's layers if not done yet
    self.getLayers = function() {
      var theme = this;
      $.ajax({
        url: '/data_manager/get_layers_for_theme/' + theme.id,
        crossDomain: true,
        success: function(data) {
          layer_objects = [];
          for (var i = 0; i < data.layers.length; i++) {
            new_layer = app.viewModel.getOrCreateLayer(data.layers[i], null, 'return', null);
            new_layer.themes.push(theme);
            layer_objects.push(new_layer);
            if (!new_layer.fullyLoaded) {
              new_layer.getFullLayerRecord(null, null);
            }
          }
          theme.layers(layer_objects);
        },
        error: function(data) {
          console.log('error getting layers for Theme "' + theme.name + '".');
        }
      })
    }

    //add to open themes
    self.setOpenTheme = function() {
        var theme = this;

        if (self.isOpenTheme(theme)) {
          app.viewModel.openThemes.remove(theme);
        } else {
          app.viewModel.openThemes.push(theme);
          self.trackTheme(theme.name);
        }

        // ensure data tab is activated
          //RDH 2019-10-11: Why?
        // $('#dataTab').tab('show');
        if (theme.layers().length == 1 && theme.layers()[0].id == null || theme.layers().length == 0) {
          theme.getLayers();
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
    // The dialog borrows "sharingLayer" to display the object
    app.viewModel.scenarios.sharingLayer(object);
    this.dialog.modal('show');
}
ExportGeometry.prototype.closeDialog = function() {
    this.dialog.modal('hide');
}

function AlertModal() {
  this.dialog = $('#alert-modal');
}
AlertModal.prototype.showDialog = function(title, content){
  app.viewModel.alert.title(title);
  app.viewModel.alert.content(content);
  this.dialog.modal('show');
}
AlertModal.prototype.closeDialog = function() {
  app.viewModel.alert.title(null);
  app.viewModel.alert.content(null);
  this.dialog.modal('hide');
}

function viewModel() {
    var self = this;

    this.exportGeometry = new ExportGeometry();
    this.alert = new AlertModal();
    this.alert.title = ko.observable('');
    this.alert.content = ko.observable('');

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

    self.userContentVisible = ko.observable(false);

    self.updateUserContentWarning = function() {
      var visible_layers = self.visibleLayers();
      var user_content_found = false;
      for (var i = 0; i < visible_layers.length; i++) {
        if (typeof visible_layers[i].id == "string" && 
          (
            visible_layers[i].id.indexOf('visualize_userlayer_') >= 0 ||
            visible_layers[i].id.indexOf('drawing_aoi_') >= 0
          )
        ) {
          user_content_found = true;
          break;
        }
      }
      self.userContentVisible(user_content_found);
    }

    self.visibleLayers.subscribe( function() {
        self.updateAttributeLayers();
        self.updateUserContentWarning();
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
        if (app.markers.hasOwnProperty('clearMarkers')){
          app.markers.clearMarkers();
        }
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

    try {
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
    } catch(err) {
      console.log(err);
    }

    try {
      self.userLayers = new userLayersModel();
      self.isUserLayersOpen = ko.observable(false);
      // self.userLayerEmail = ko.observable();
      self.toggleUserLayersOpen = function(force) {
        $('#designsTab').tab('show');

        if (force == 'open') {
          self.isUserLayersOpen(true);
        }
        else if (force == 'close') {
          self.isUserLayersOpen(false);
        }
        else {
          self.isUserLayersOpen(!self.isUserLayersOpen());
        }

        if (self.isUserLayersOpen()) {
          app.viewModel.userLayers.getUserLayers();
        }
      }
    } catch(err) {
      console.log(err);
    }

    try {
      self.scenarios = new scenariosModel();
      self.scenarios.reports = new reportsModel();
    } catch(err) {
      console.log(err);
    }


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
    self.aggregatedAttributesWidth = ko.observable('30vw');
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
            self.aggregatedAttributesWidth('30vw');
        }, 500);
    };

    // title for print view
    self.mapTitle = ko.observable();

    self.closeAttribution = function() {
        self.aggregatedAttributes(false);
        if (app.wrapper.map.hasOwnProperty('clearMarkers')){
          app.wrapper.map.clearMarkers();
        }
    };

    self.updateMarker = function(lonlat_orig) {
        //at some point this function is being called without an appropriate lonlat object...
        if (lonlat_orig.hasOwnProperty('lon') && lonlat_orig.hasOwnProperty('lat')) {
          var lonlat = lonlat_orig;
        } else if (lonlat_orig.hasOwnProperty('length') && lonlat_orig.length == 2) {
          var lonlat = {
            lon: lonlat_orig[0],
            lat: lonlat_orig[1]
          }
        }
        if (lonlat && lonlat.hasOwnProperty('lon') && lonlat.hasOwnProperty('lat')) {
            app.wrapper.map.clearMarkers();
            app.wrapper.map.addMarker(lonlat.lon, lonlat.lat);
        } else {
          app.wrapper.map.clearMarkers();
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
      app.wrapper.map.showBasemaps(self, event);
    };
    self.showMAFMCBasemaps = function(self) {
        var $layerSwitcher = $('#SimpleLayerSwitcher');
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
            if ((layer.legend || layer.legendTitle) && (!layer.is_multilayer() || layer.is_visible_multilayer()) && layer.show_legend) {
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


    self.hideUserLayersForm = function() {
        app.viewModel.userLayers.getUserLayers()
        self.userLayers.userLayerForm(false);
        self.scenarios.userLayerForm(false);
    }

    /** Create a new userlayer from the userlayer form */
    self.addUserLayer = function(form) {
        var name = $(form).find('#new_user_layer_name').val();
        var description = $(form).find('#new_user_layer_description').val();
        if (name.length == 0) {
            return false;
        }
        //if a user layer name exists, break out
        var match = $.grep(self.userLayers.userLayersList(), function(bkm) {
            return bkm.name.indexOf(name) > -1
        });
        if (match.length > 0) {
            //display duplication text
            self.userLayers.duplicateUserLayer(true);
            $('.dupe-userlayer').effect("highlight", {}, 1000);
            return false;
        }

        var layer_type = $(form).find('#new_user_layer_type').val();
        var url = $(form).find('#new_user_layer_url').val();
        var arcgis_layers = $(form).find('#new_user_layer_arcgis_layers').val();
        var wms_slug = $(form).find('#new_user_layer_wms_slug').val();
        var wms_srs = $(form).find('#new_user_layer_wms_srs').val();
        var wms_params = $(form).find('#new_user_layer_wms_params').val();
        var wms_version = $(form).find('#new_user_layer_wms_version').val();
        var wms_format = $(form).find('#new_user_layer_wms_format').val();
        var wms_styles = $(form).find('#new_user_layer_wms_styles').val();

        self.userLayers.addUserLayer(name, description, url, layer_type, arcgis_layers, wms_slug, wms_srs, wms_params, wms_version, wms_format, wms_styles);
        self.hideUserLayersForm();
        self.userLayers.newUserLayerName(null);
        self.userLayers.newUserLayerDescription(null);
    }

    self.showMapLinks = function() {
        app.updateUrl();
        self.mapLinks.shrinkURL(true);
        $('#short-url').text = self.mapLinks.getURL();
        self.mapLinks.setIFrameHTML();
        $('#map-links-modal').modal()
    };

    self.startNewDrawing = function() {
      $('#designsTab').click();
      if ($('#drawings-header').is(":visible") && $('#drawings-header').find('a.create-new-button').is(":visible") && !app.viewModel.scenarios.loadingDrawingForm()) {
        app.viewModel.scenarios.createPolygonDesign();
      }
    }

    self.startNewLayerImport = function() {
      $('#designsTab').click();
      if ($('#user-layers-header').is(":visible") && $('#user-layers-header').find('a.create-new-button').is(":visible") && !app.viewModel.userLayers.loadingUserLayerForm()) {
        app.viewModel.userLayers.createUserLayer();
      }
    }

    self.toggleLinearMeasurement = function() {
      if (!app.map.measurementLayer) {
        app.addMeasurementLayerToMap();
      }

      if (app.wrapper.controls.hasOwnProperty('startLinearMeasurement')) {
        if ($('#linear-measurement i').hasClass('fa-ruler-vertical')) {
          app.wrapper.controls.startLinearMeasurement();
        } else {
          app.wrapper.controls.clearLinearMeasurement();
        }
      } else {
        window.alert('No linear measurement controls defined for current mapping framework.');
      }
    }

    self.toggleAreaMeasurement = function() {
      if (!app.map.measurementLayer) {
        app.addMeasurementLayerToMap();
      }

      if (app.wrapper.controls.hasOwnProperty('startAreaMeasurement')) {
        if ($('#area-measurement i').hasClass('fa-ruler-combined')) {
          app.wrapper.controls.startAreaMeasurement();
        } else {
          app.wrapper.controls.clearAreaMeasurement();
        }
      } else {
        window.alert('No area measurement controls defined for current mapping framework.');
      }
    }

    self.clearMeasurementTool = function() {
      if(app.wrapper.controls.clearMeasurementTool) {
        app.wrapper.controls.clearMeasurementTool();
      }
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

        let export_flag = "/export";
        if (layer.proxy_url) {
          export_flag = "%2Fexport";
        }

        var mdatObj = {
            type: 'ArcRest',
            name: layer.name,
            isMDAT: true,
            parentDirectory: layer.parentDirectory,
            url: layer.url+export_flag,
            arcgis_layers: layer.id
        };

        var id_exists = true;
        for(var i=0; id_exists == true && i < 1000; i++) {
          mdatObj.id = 'mdat_layer_' + i;
          if (Object.keys(app.viewModel.layerIndex).indexOf(mdatObj.id) < 0) {
            id_exists = false;
          }
        }

        var mdatLayer = app.viewModel.getOrCreateLayer(mdatObj, null, 'return', null),
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

        let export_flag = "/export";
        let path_separator = "/";
        if (layer.proxy_url) {
          export_flag = "%2Fexport";
          path_separator = "%2F";
        }

        var vtrObj = {
            type: 'ArcRest',
            name: layer.name,
            isVTR: true,
            dateRangeDirectory: layer.dateRangeDirectory,
            url: layer.url+path_separator+'MapServer'+export_flag,
            arcgis_layers: layer.id
        };

        var id_exists = true;
        for(var i=0; id_exists == true && i < 1000; i++) {
          vtrObj.id = 'vtr_layer_' + i;
          if (Object.keys(app.viewModel.layerIndex).indexOf(vtrObj.id) < 0) {
            id_exists = false;
          }
        }

        var vtrLayer = app.viewModel.getOrCreateLayer(vtrObj, null, 'activateLayer', null);

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

    self.getThemeById = function(id) {
      var themes = self.themes();
      for (var i = 0; i < themes.length; i++) {
        if (themes[i].id == id) {
          return themes[i];
        }
      }
      return null;
    }

    // get layer by id
    self.getLayerById = function(id) {
        if (app.viewModel.layerIndex[id] instanceof layerModel) {
          return app.viewModel.layerIndex[id];
        }
        for (var x=0; x<self.themes().length; x++) {
            var layer_list = $.grep(self.themes()[x].layers(), function(layer) {
                return layer.id === id;
            });
            //find parent layers by ID
            if (layer_list.length > 0) {
                return layer_list[0];
            } else {
                if (typeof(id) == "string" && id.indexOf('aoi') >= 0) {
                    return app.viewModel.layerIndex[id];
                }
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


    /**
      * @function getOrCreateLayer - if a layerModel object with the given id exists, return it.
      *    if not, create it.
      * @param {object} layer_obj - an object describing the layer with at least 'id' field
      * @param {object} parent - the layer's parent object (used if creating new layerModel object)
      * @param {string} action - the name of the action to be taken if the layer needs to be loaded first
      * @param {event} event - an optional event that triggered this request to be passed on when loading the layer
      */
    self.getOrCreateLayer = function(layer_obj, parent, action, event, override_defaults) {
      var layer = self.getLayerById(layer_obj.id);
      if (!layer) {
        if (!layer_obj.hasOwnProperty('name')) {
          layer_obj.name = 'Loading...';
        }
        var layer = new layerModel(layer_obj, parent);
        if (override_defaults) {
          layer.override_defaults(true);
        }
        if (layer.id) {
          // dynamic layers do not come with IDs
          app.viewModel.layerIndex[layer.id.toString()] = layer;
        }
      } else if (layer.name.toLowerCase() == "loading..." && layer_obj.hasOwnProperty('name')) {
        layer.name = layer_obj.name;
      }
      if (action == 'return'){
        return layer;
      } else if (layer.fullyLoaded || layer.isMDAT || layer.isVTR || (layer_obj.hasOwnProperty('wmsSession') && layer_obj.wmsSession) ) {
        layer.performAction(action, event);
      } else {
        layer.getFullLayerRecord(action, event);
      }
      return null;
    }

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
            console.log("Did not find search term", self.searchTerm());
            return false;
        }
        if (!(found.layer instanceof layerModel)) {
          if (typeof found.layer == "string") {
            found.layer = parseInt(found.layer);
          }
          if (Number.isInteger(found.layer)) {
            if (app.viewModel.layerIndex[found.layer.toString()] instanceof layerModel) {
              found.layer = app.viewModel.layerIndex[found.layer.toString()];
            } else {
              app.viewModel.getOrCreateLayer({id: found.layer}, null, 'layerSearch', null);
              return false;
            }
          } else if (found.layer.hasOwnProperty('id') || Object.keys(found.layer).indexOf('id') >= 0) {
            app.viewModel.getOrCreateLayer({id: found.layer.id}, null, 'layerSearch', null);
            return false;
          } else {
            console.log("Did not find search term", self.searchTerm());
            return false;
          }
        }
        if (!found.layer.fullyLoaded) {
          found.layer.getFullLayerRecord('layerSearch', null);
          return false;
        }
        //self.activeTheme(theme);
        if (!(found.theme instanceof themeModel)) {
          if (Number.isInteger(found.theme)) {
            found.theme = app.viewModel.getThemeById(found.theme);
          } else if (found.theme.hasOwnProperty('id')) {
            found.theme = app.viewModel.getThemeById(found.theme.id);
          } else {
            console.log("Did not find theme for layer indicated.");
            return false;
          }
        }
        if (self.openThemes.indexOf(found.theme) === -1) {
          // self.openThemes.push(found.theme);

          found.theme.setOpenTheme();
          window.setTimeout(function() {
            $('#activeTab').tab('show');
          }, 400);
        }
        if (found.layer instanceof layerModel) {
          found.layer.activateLayer();
        } else {
          var layer_obj = {id:found.layer, name:"Loading..."};
          var parent = null;
          var action = null;
          app.viewModel.getOrCreateLayer(layer_obj, parent, 'activateLayer', action);
        }
        self.searchTerm($('#data-search-input').text());
    };
    self.keySearch = function(_, event) {
        // Capture user input before it gets wiped
        self.searchTermInput($("#data-search-input").val());

        if (event.which === 13) {
            self.searchTerm($('.typeahead .active').text());
            self.layerSearch();
        }
        $('ul.typeahead').on('click', 'li', function () {
            self.searchTerm($(this).text());
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
        if (app.state && !app.state.activeLayers){
          app.state.activeLayers = [];
        }

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
            if (layer instanceof layerModel && layer.is_multilayer_parent()) {
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

        if (app.wrapper.map.hasOwnProperty('sortLayers')) {
          app.wrapper.map.sortLayers();
        }

        // update the url hash
        app.updateUrl();

        $.each(self.activeLayers(), function(i, layer) {
          if (layer instanceof layerModel && layer.is_multilayer_parent()) {
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

        setTimeout(function() {
          $('[data-toggle="tooltip"]').tooltip();
        }, 300);

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

    self.checkShowSliderButtons = function() {
      return $('#myTab li[data-tab="data"]').hasClass('active');
    };

    self.showSliderButtons = ko.observable($.deparam(window.location.hash.slice(1)).tab == "data");
    /**
      * @function trackMultilayerLoad - keep track of the status of loading multilayer layers (sliders) via ajax
      * @param {string} parentLayer - the multilayer parent layerModel instance
      * @param {boolean} init - whether you're starting a fresh load of multilayers, or are just updating the status
      * @param {string} updateId - the ID (string) of the layer that has just finished loading (optional)
      */
    self.trackMultilayerLoad = function(parentLayer, init, updateId) {
      if (!self.hasOwnProperty('multilayerLoadStatus')) {
        self.multilayerLoadStatus = {};
      }
      if (!parentLayer.hasOwnProperty('multilayers')) {
        parentLayer.multilayers = self.getMultilayerIds(parentLayer.associated_multilayers, []);
      }
      var parentLayerId = parentLayer.id.toString();
      var idList = parentLayer.multilayers;
      if (init || Object.keys(self.multilayerLoadStatus).indexOf(parentLayerId) < 0) {
        var statusObject = {};
        for (var i = 0; i < idList.length; i++) {
          statusObject[idList[i].toString()] = {
            loaded: false
          }
        }
        self.multilayerLoadStatus[parentLayerId] = statusObject;
      } else {
        var all_loaded = true;
        self.multilayerLoadStatus[parentLayerId][updateId].loaded = true;
        var statusObject = self.multilayerLoadStatus[parentLayerId];
        for (var i = 0; i < idList.length; i++) {
          if (statusObject[idList[i].toString()].loaded == false) {
            var all_loaded = false;
            break;
          }
        }
        if (all_loaded) {
          parentLayer.buildMultilayerValueLookup();
        }
      }
    }

    return self;
} //end viewModel

app.viewModel = new viewModel();
