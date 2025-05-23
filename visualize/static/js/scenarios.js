// hexToRgb function Thanks to kennebec @
// https://stackoverflow.com/a/30971075/706797
// With a slight tweak to the return inspired by Paul S. @
// https://stackoverflow.com/a/30970691/706797
function hexToRgb(c){
    // if(/^#([a-f0-9]{3}){1,2}$/.test(c)){
        if(c.length== 4){
            c= '#'+[c[1], c[1], c[2], c[2], c[3], c[3]].join('');
        }
        c= '0x'+c.substring(1);
        // return 'rgb('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+')';
        return {
            'r': (c>>16)&255,
            'g': (c>>8)&255,
            'b': c&255
        };
    // }
    return '';
}

var madrona = {
    onShow: function(callback) { callback(); },
    setupForm: function($form) {
        //var submitted = false;

        $form.find('.btn-submit').hide();

        $form.find('label').each(function (i, label) {
            if ($(label).find('input[type="checkbox"]').length) {
                $(label).addClass('checkbox');
            }
        });

        $form.closest('.panel').on('click', '.cancel_button', function(e) {
            app.viewModel.scenarios.reset({cancel: true});
        });

        $form.closest('.panel').on('click', '.submit_button', function(e) {
            e.preventDefault();
            var name = $('#id_name').val();
            if ($.trim(name) === "") {
                $('#invalid-name-message').show();
                return false;
            }
            //submitted = true;
            submitForm($form);
            $form.closest('.panel').off('click', '.submit_button');
        });

        setFormStyle = function() {
            rgba_dict = hexToRgb($('#id_color').val());
            fill_val = `rgba(${rgba_dict.r}, ${rgba_dict.g}, ${rgba_dict.b}, ${parseFloat($('#id_fill_opacity').val())})`;
            stroke_color = $('#id_stroke_color').val();
            stroke_width = parseInt($('#id_stroke_width').val());

            // Allowing users a stroke-width of 0 would be cool, but
            //  makes no sense for linestrings. Also 0-width strokes
            //  are not yet respected when rendering the final style
            //  after editing is done. Uncomment the code below once 
            //  that is fixed.
            
            // if (stroke_width > 0) {
                line_poly_style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: fill_val,
                    }),
                    stroke: new ol.style.Stroke({
                        color: stroke_color,
                        width: stroke_width
                    }),
                });
                point_style = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: fill_val,
                        }),
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: stroke_color,
                            width: stroke_width
                        }),
                    })
                });
            // } else {
            //     line_poly_style = new ol.style.Style({
            //         fill: new ol.style.Fill({
            //             color: fill_val,
            //         }),
            //     });
            //     point_style = new ol.style.Style({
            //         image: new ol.style.Circle({
            //             fill: new ol.style.Fill({
            //                 color: fill_val,
            //             }),
            //             radius: 5,
            //         })
            //     });
            // }

            styles = [
                line_poly_style,
                point_style
            ]

            app.map.drawingLayer.setStyle(styles);
        }

        $form.find('#id_color').on('change', function(e){
            setFormStyle();
        })

        $form.find('#id_fill_opacity').on('input', function(e){
            setFormStyle();
        })

        $form.find('#id_stroke_color').on('change', function(e){
            setFormStyle();
        })

        $form.find('#id_stroke_width').on('input', function(e){
            setFormStyle();
        })

        //no longer needed...? (if it was going here it meant there was a problem)
        /*
        $form.submit( function() {
            var name = $('#id_name').val();
            if ($.trim(name) === "") {
                $('#invalid-name-message').show();
                return false;
            }
            if (!submitted) {
                submitForm($form);
            }
        });
        */
        submitForm = function($form) {
            //var $form = $(this).closest('.panel').find('form'),
            var url = $form.attr('action'),
                $bar = $form.closest('.tab-pane').find('.bar'),
                data = {},
                barTimer,
                formId = $form[0].getAttribute('id');

            //progress bar
            barTimer = setInterval(function () {
                var width = parseInt($bar.css('width').replace('px', ''), 10) + 5,
                    barWidth = parseInt($bar.parent().css('width').replace('px',''), 10);

                if (width < barWidth) {
                    $bar.css('width', width + "px");
                } else {
                    clearInterval(barTimer);
                }
            }, 500);


            $form.find('input,select,textarea').each( function(index, input) {
                var $input = $(input);
                if ($input.attr('type') === 'checkbox') {
                    if ($input.attr('checked')) {
                        data[$input.attr('name')] = 'True';
                    } else {
                        data[$input.attr('name')] = 'False';
                    }
                } else {
                    data[$input.attr('name')] = $input.val();
                }
            });

            app.viewModel.scenarios.scenarioForm(false);
            app.viewModel.scenarios.loadingMessage("Creating Design");

            $.ajax( {
                url: url,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(result) {
                    if (result['X-Madrona-Show'].indexOf('visualize_userlayer_') >= 0) {
                        app.viewModel.userLayers.finishAddingUserLayer(result);
                    } else {
                        app.viewModel.scenarios.addScenarioToMap(null, {uid: result['X-Madrona-Show']});
                    }
                    app.viewModel.scenarios.loadingMessage(false);
                    clearInterval(barTimer);
                },
                error: function(result) {
                    app.viewModel.scenarios.loadingMessage(null);
                    clearInterval(barTimer);
                    if (result.status === 400) {
                        // if response message is a new replacement form with errors embedded:
                        if (result.responseText.indexOf("<form") >= 0) {
                            $('#'+formId).html(result.responseText);
                        } else {
                            $('#'+formId).append(result.responseText);
                        }
                        app.viewModel.scenarios.scenarioForm(true);
                    } else {
                        app.viewModel.scenarios.errorMessage(result.responseText.split('\n\n')[0]);
                    }
                }
            });
        };

    }
}; // end madrona init



function scenarioFormModel(options) {
    var self = this;

    var initial_leaseblocks_left = app.viewModel.scenarios.leaseblockList.length || 3426;
    self.leaseblocksLeft = ko.observable(initial_leaseblocks_left);
    self.showLeaseblockSpinner = ko.observable(false);

    self.isLeaseblockLayerVisible = ko.observable(false);
    self.isLeaseblockLayerVisible.subscribe( function() {
        if ( self.isLeaseblockLayerVisible() ) {
            self.showRemainingBlocks();
        } else {
            self.hideLeaseblockLayer();
        }
    });
    //self.isLeaseblockButtonActivated = ko.observable(false);

    //not sure how best to tie the width of the show/hide leaseblocks button to the width of the form...
    //self.showLeaseblockButtonWidth = ko.observable($('#scenario-form').width());

    self.activateLeaseblockLayer = function() {
        self.isLeaseblockLayerVisible(true);
        //self.showRemainingBlocks();
    };

    self.deactivateLeaseblockLayer = function() {
        self.isLeaseblockLayerVisible(false);
        //remove from attribute list (if it's there)
        app.viewModel.removeFromAggregatedAttributes(app.viewModel.scenarios.scenarioLeaseBlocksLayerName);
        app.viewModel.updateAggregatedAttributesOverlayWidthAndScrollbar();
        //self.hideLeaseblockLayer();
    };

    self.lastChange = (new Date()).getTime();

    //Parameters
    self.windSpeedParameter = ko.observable(false);
    self.distanceToShoreParameter = ko.observable(false);
    self.depthRangeParameter = ko.observable(false);
    self.distanceToSubstationParameter = ko.observable(false);
    self.distanceToAWCParameter = ko.observable(false);
    self.distanceToShippingParameter = ko.observable(false);
    self.shipTrafficDensityParameter = ko.observable(false);
    self.uxoParameter = ko.observable(false);

    self.toggleWindSpeedWidget = function() {
        if ( self.windSpeedParameter() ) {
            self.windSpeedParameter(false);
            $('#id_input_parameter_wind_speed').removeAttr('checked');
            $('#wind_speed_widget').css('display', 'none');
        } else {
            var value = $('#id_input_avg_wind_speed')[0].value;
            $('#id_input_parameter_wind_speed').attr('checked', 'checked');
            self.windSpeedParameter(true);
            self.change_wind_message(value);
            $('#wind_speed_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleDistanceToShoreWidget = function() {
        if ( self.distanceToShoreParameter() ) {
            self.distanceToShoreParameter(false);
            $('#id_input_parameter_distance_to_shore').removeAttr('checked');
            $('#distance_to_shore_widget').css('display', 'none');
        } else {
            var minValue = $('#id_input_min_distance_to_shore')[0].value,
                maxValue = $('#id_input_max_distance_to_shore')[0].value;
            $('#id_input_parameter_distance_to_shore').attr('checked', 'checked');
            self.distanceToShoreParameter(true);
            $('#distance_to_shore_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleDepthWidget = function() {
        if ( self.depthRangeParameter() ) {
            self.depthRangeParameter(false);
            $('#id_input_parameter_depth').removeAttr('checked');
            $('#depth_widget').css('display', 'none');
        } else {
            var minValue = $('#id_input_min_depth')[0].value,
                maxValue = $('#id_input_max_depth')[0].value;
            $('#id_input_parameter_depth').attr('checked', 'checked');
            self.depthRangeParameter(true);
            $('#depth_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleSubstationWidget = function() {
        if ( self.distanceToSubstationParameter() ) {
            $('#id_input_parameter_distance_to_substation').removeAttr('checked');
            self.distanceToSubstationParameter(false);
            $('#distance_to_substation_widget').css('display', 'none');
        } else {
            var value = $('#id_input_distance_to_substation')[0].value;
            $('#id_input_parameter_distance_to_substation').attr('checked', 'checked');
            self.distanceToSubstationParameter(true);
            $('#distance_to_substation_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleAWCWidget = function() {
        if ( self.distanceToAWCParameter() ) {
            $('#id_input_parameter_distance_to_awc').removeAttr('checked');
            self.distanceToAWCParameter(false);
            $('#distance_to_awc_widget').css('display', 'none');
        } else {
            var value = $('#id_input_distance_to_awc')[0].value;
            $('#id_input_parameter_distance_to_awc').attr('checked', 'checked');
            self.distanceToAWCParameter(true);
            $('#distance_to_awc_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleShippingLanesWidget = function() {
        if ( self.distanceToShippingParameter() ) {
            $('#id_input_filter_distance_to_shipping').removeAttr('checked');
            self.distanceToShippingParameter(false);
            $('#distance_to_shipping_widget').css('display', 'none');
        } else {
            var value = $('#id_input_distance_to_shipping')[0].value;
            $('#id_input_filter_distance_to_shipping').attr('checked', 'checked');
            self.distanceToShippingParameter(true);
            $('#distance_to_shipping_widget').css('display', 'block');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleShipTrafficWidget = function() {
        if ( self.shipTrafficDensityParameter() ) {
            self.shipTrafficDensityParameter(false);
            $('#id_input_filter_ais_density').removeAttr('checked');
        } else {
            var value = 1;
            self.shipTrafficDensityParameter(true);
            $('#id_input_filter_ais_density').attr('checked', 'checked');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.toggleUXOWidget = function() {
        if ( self.uxoParameter() ) {
            self.uxoParameter(false);
            $('#id_input_filter_uxo').removeAttr('checked');
        } else {
            self.uxoParameter(true);
            $('#id_input_filter_uxo').attr('checked', 'checked');
        }
        //Update Remaining Leaseblocks
        self.updateFiltersAndLeaseBlocks();
        self.updateRemainingBlocks();
    };

    self.change_wind_message = function(value) {
        var $text = $('#wind_speed_text'),
            $label = $text.closest('.label');
            $label.css('color', 'black');
        if (value < 7.0) {
            $text.html('Fair');
            $label.css('background', "#377EB8");
        } else if (value < 7.25) {
            $text.html('Good');
            $label.css('background', "#377EB8");
        } else if (value < 7.5) {
            $text.html('Good');
            $label.css('background', "#377EB8");
        } else if (value < 7.75) {
            $text.html('Excellent');
            $label.css('background', "#40B3A7");
        } else if (value < 8.0) {
            $text.html('Excellent');
            $label.css('background', "#45B06C");
        } else if (value < 8.25) {
            $text.html('Outstanding');
            $label.css('background', "#84D439");
        } else if (value < 8.5) {
            $text.html('Outstanding');
            $label.css('background', "#CCED26");
        } else if (value < 8.75) {
            $text.html('Outstanding');
            $label.css('background', "#FFFF12");
        } else if (value < 9.0) {
            $text.html('Superb');
            $label.css('background', "#FFE712");
        } else if (value < 9.25) {
            $text.html('Superb');
            $label.css('background', "#FCA326");
        } else if (value < 9.5) {
            $text.html('Superb');
            $label.css('background', "#F07224");
        } else {
            $text.html('Superb');
            $label.css('background', "#E35539");
        }
        //Poor       < 12.5      (< 5.6)     ffff00
        //Fair       14.3-15.7   (6.4-7.0)   ff0000
        //Good       15.7-16.8   (7.0-7.5)   ff0077
        //Excellent  16.8-17.9   (7.5-8.0)   ff00ff
        //Oustanding 17.9-19.7   (8.0-8.8)   7700ff
        //Superb     > 19.7      (> 8.8)     0000ff
    }

    self.filters = {};

    self.updateFilters = function(object) {
        self.filters[object.key] = object.value;
        //self.isLeaseblockButtonActivated(true);
    };
    self.removeFilter = function(key) {
        delete self.filters[key];
        //if ( $.isEmptyObject(self.filters) ) {
        //    self.isLeaseblockButtonActivated(false);
        //}
    };

    self.updateFiltersAndLeaseBlocks = function() {
        if ( self.depthRangeParameter() ) {
            self.updateFilters({'key': 'min_depth', 'value': $('#id_input_min_depth')[0].value});
            self.updateFilters({'key': 'max_depth', 'value': $('#id_input_max_depth')[0].value});
        } else {
            self.removeFilter('min_depth');
            self.removeFilter('max_depth');
        }
        if ( self.windSpeedParameter() ) {
            self.updateFilters({'key': 'wind', 'value': $('#id_input_avg_wind_speed')[0].value});
        } else {
            self.removeFilter('wind');
        }
        if ( self.distanceToShoreParameter() ) {
            self.updateFilters({'key': 'min_distance', 'value': $('#id_input_min_distance_to_shore')[0].value});
            self.updateFilters({'key': 'max_distance', 'value': $('#id_input_max_distance_to_shore')[0].value});
        } else {
            self.removeFilter('min_distance');
            self.removeFilter('max_distance');
        }
        if ( self.distanceToSubstationParameter() ) {
            self.updateFilters({'key': 'substation', 'value': $('#id_input_distance_to_substation')[0].value});
        } else {
            self.removeFilter('substation');
        }
        if ( self.distanceToAWCParameter() ) {
            self.updateFilters({'key': 'awc', 'value': $('#id_input_distance_to_awc')[0].value});
        } else {
            self.removeFilter('awc');
        }
        if ( self.distanceToShippingParameter() ) {
            self.updateFilters({'key': 'tsz', 'value': $('#id_input_distance_to_shipping')[0].value});
        } else {
            self.removeFilter('tsz');
        }
        if ( self.shipTrafficDensityParameter() ) {
            self.updateFilters({'key': 'ais', 'value': 1});
        } else {
            self.removeFilter('ais');
        }
        if ( self.uxoParameter() ) {
            self.updateFilters({'key': 'uxo', 'value': 1});
        } else {
            self.removeFilter('uxo');
        }
        self.updateLeaseblocksLeft();

    };

    self.updateLeaseblocksLeft = function() {
        //self.leaseblocksLeft(23);
        var list = app.viewModel.scenarios.leaseblockList,
            count = 0;

        for ( var i=0; i<list.length; i++ ) {
            var addOne = true;
            if (self.filters['wind'] && list[i].min_wind_speed < self.filters['wind'] ) {
                addOne = false;
            }
            if (self.filters['max_distance'] && list[i].avg_distance > self.filters['max_distance'] ||
                self.filters['min_distance'] && list[i].avg_distance < self.filters['min_distance'] ) {
                addOne = false;
            }
            if (self.filters['max_depth'] && list[i].avg_depth > self.filters['max_depth'] ||
                self.filters['min_depth'] && list[i].avg_depth < self.filters['min_depth'] ) {
                addOne = false;
            }
            if (self.filters['substation'] &&
                (list[i].substation_min_distance > self.filters['substation'] || list[i].substation_min_distance === null) ) {
                addOne = false;
            }
            if (self.filters['awc'] && list[i].awc_min_distance > self.filters['awc'] ||
                list[i].awc_min_distance === null ) {
                addOne = false;
            }
            if (self.filters['tsz'] && list[i].tsz_min_distance < self.filters['tsz'] ) {
                addOne = false;
            }
            if (self.filters['ais'] && list[i].ais_mean_density > 1 ) {
                addOne = false;
            }
            if (self.filters['uxo'] && list[i].uxo !== 0 ) {
                addOne = false;
            }
            if (addOne) {
                count += 1;
            }
        }
        self.leaseblocksLeft(count);
        //self.showRemainingBlocks();
    };

    self.updateRemainingBlocks = function() {
        self.lastChange = (new Date()).getTime();
        setTimeout(function() {
            var newTime = (new Date()).getTime();
            if ( newTime - self.lastChange > 100 ) {
                //console.log('showRemainingBlocks');
                self.showRemainingBlocks();
            }
        }, 200);
    };

    self.showRemainingBlocks = function() {
        if ( self.isLeaseblockLayerVisible() ) {
            //console.log('showing remaining blocks');
            self.showLeaseblockSpinner(true);
            //var blockLayer = app.map.getLayersByName('OCS Test')[0];
            if ( ! app.viewModel.scenarios.leaseblockLayer()) {
                app.viewModel.scenarios.loadLeaseblockLayer();
            }
            var blockLayer = app.viewModel.scenarios.leaseblockLayer();
            var filter = new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.AND,
                filters: []
            });
            if ( self.windSpeedParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if WINDREV_MI >= self.filters['wind']
                        type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                        property: "WINDREV_MI",
                        value: self.filters['wind']
                    })
                );
            }
            if ( self.distanceToShoreParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if MI_MAX >= self.filters['min_distance']
                        type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                        property: "MI_MEAN",
                        value: self.filters['min_distance']
                    }),
                    new OpenLayers.Filter.Comparison({ // if MI_MAX <= self.filters['max_distance']
                        type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                        property: "MI_MEAN",
                        value: self.filters['max_distance']
                    })
                );
            }
            if ( self.depthRangeParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if DEPTHM_MAX >= self.filters['min_distance']
                        type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                        property: "DEPTH_MEAN",
                        value: (-self.filters['min_depth'])
                    }),
                    new OpenLayers.Filter.Comparison({ // if DEPTHM_MIN <= self.filters['max_distance']
                        type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                        property: "DEPTH_MEAN",
                        value: (-self.filters['max_depth'])
                    })
                );
            }
            if ( self.distanceToSubstationParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if SUBSTAMIN <= self.filters['substation']
                        type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                        property: "SUBSTAMIN",
                        value: self.filters['substation']
                    }),
                    new OpenLayers.Filter.Comparison({ // if SUBSTAMIN <= self.filters['substation']
                        type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                        property: "SUBSTAMIN",
                        value: 0
                    })
                );
            }
            if ( self.distanceToAWCParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if AWCMI_MIN <= self.filters['awc']
                        type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                        property: "AWCMI_MIN",
                        value: self.filters['awc']
                    })
                );
            }
            if ( self.distanceToShippingParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if TRSEP_MIN >= self.filters['tsz']
                        type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                        property: "TRAFFCMIN",
                        value: self.filters['tsz']
                    })
                );
            }
            if ( self.shipTrafficDensityParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if AIS7_MEAN <= 1
                        type: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
                        property: "ALLVES_MAJ",
                        value: "1"
                    })
                );
            }
            if ( self.uxoParameter() ) {
                filter.filters.push(
                    new OpenLayers.Filter.Comparison({ // if UXO == 0
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "UXO",
                        value: 0
                    })
                );
            }
            blockLayer.styleMap.styles['default'].rules[0] = new OpenLayers.Rule({
                filter: filter,
                symbolizer: { strokeColor: '#fff' }
            });
            //console.log(blockLayer);

            self.showLeaseblockLayer(blockLayer);
        }

    };

    self.showLeaseblockLayer = function(layer) {
        if ( ! app.map.getLayersByName(app.viewModel.scenarios.leaseblockLayer().name).length ) {
            app.map.addLayer(app.viewModel.scenarios.leaseblockLayer());
        }
        //layer.layerModel.setVisible();
        layer.setVisibility(true);
        app.viewModel.updateAttributeLayers();
        //layer.refresh();
        layer.redraw();
    }

    self.hideLeaseblockLayer = function() {
        app.viewModel.scenarios.leaseblockLayer().setVisibility(false);
        //if ( app.map.getLayersByName(app.viewModel.scenarios.leaseblockLayer().name).length ) {
        //    app.map.removeLayer(app.viewModel.scenarios.leaseblockLayer());
        //}
        //remove the key/value pair from aggregatedAttributes
        app.viewModel.removeFromAggregatedAttributes(app.viewModel.scenarios.leaseblockLayer().name);
        app.viewModel.updateAttributeLayers();
    }

    self.windSpeedLayer = app.viewModel.getLayerById(7);
    self.toggleWindSpeedLayer = function(formModel, event) {
        if ( self.windSpeedLayer.active() ) {
            self.windSpeedLayer.deactivateLayer();
        } else {
            self.windSpeedLayer.activateLayer();
        }
        return true;
    };
    self.toggleWindSpeedDescription = function(formModel) {
        if ( self.windSpeedLayer.infoActive() ) {
            self.windSpeedLayer.hideDescription(self.windSpeedLayer);
        } else {
            self.windSpeedLayer.showDescription(self.windSpeedLayer);
        }
        return true;
    };

    self.awcLayer = app.viewModel.getLayerById(65);
    self.toggleAWCLayer = function(formModel, event) {
        if ( self.awcLayer.active() ) {
            self.awcLayer.deactivateLayer();
        } else {
            self.awcLayer.activateLayer();
        }
        return true;
    };
    self.toggleAWCDescription = function(formModel) {
        if ( self.awcLayer.infoActive() ) {
            self.awcLayer.hideDescription(self.awcLayer);
        } else {
            self.awcLayer.showDescription(self.awcLayer);
        }
        return true;
    };

    self.depthZonesLayer = app.viewModel.getLayerById(96);
    self.toggleDepthZonesLayer = function(formModel, event) {
        if ( self.depthZonesLayer.active() ) {
            self.depthZonesLayer.deactivateLayer();
        } else {
            self.depthZonesLayer.activateLayer();
        }
        return true;
    };
    self.toggleDepthZonesDescription = function(formModel) {
        if ( self.depthZonesLayer.infoActive() ) {
            self.depthZonesLayer.hideDescription(self.depthZonesLayer);
        } else {
            self.depthZonesLayer.showDescription(self.depthZonesLayer);
        }
        return true;
    };

    self.shippingLanesLayer = app.viewModel.getLayerById(64); // original shipping lanes layer (geojson)
    //self.shippingLanesLayer = app.viewModel.getLayerById(103); // mmc (wms) shipping lanes layer
    self.toggleShippingLanesLayer = function(formModel, event) {
        if ( self.shippingLanesLayer.active() ) {
            self.shippingLanesLayer.deactivateLayer();
        } else {
            self.shippingLanesLayer.activateLayer();
        }
        return true;
    };
    self.toggleShippingLanesDescription = function(formModel) {
        if ( self.shippingLanesLayer.infoActive() ) {
            self.shippingLanesLayer.hideDescription(self.shippingLanesLayer);
        } else {
            self.shippingLanesLayer.showDescription(self.shippingLanesLayer);
        }
        return true;
    };

    return self;
} // end scenarioFormModel

function selectionModel(options) {
    var self = this;

    self.name = 'Selected Lease Blocks';

    var ret = scenarioModel.apply(this, arguments);

    self.isSelectionModel = true;

    self.edit = function() {
        var selection = this;
        app.viewModel.scenarios.zoomToScenario(selection);
        return $.ajax({
            url: '/features/leaseblockselection/' + selection.uid + '/form/',
            success: function(data) {
                app.viewModel.scenarios.selectionForm(true);
                $('#selection-form').html(data);
                if ($.browser.msie && $.browser.version < 9) {
                    app.viewModel.scenarios.selectionFormModel = new IESelectionFormModel();
                } else {
                    app.viewModel.scenarios.selectionFormModel = new selectionFormModel();
                }
                ko.applyBindings(app.viewModel.scenarios.selectionFormModel, document.getElementById('selection-form'));
                //particular for paintbrush selection form
                app.viewModel.scenarios.selectionFormModel.edit = true;
                app.viewModel.scenarios.selectionFormModel.selection = selection;
                app.viewModel.scenarios.selectionFormModel.selectedLeaseBlocks($('#id_leaseblock_ids').val().split(','));
                //particular for IE selection form, another ajax call to retrieve the leaseblocks
                //app.viewModel.scenarios.selectionFormModel.selectedLeaseBlocks($('#id_leaseblock_ids').val().split(','));
                //app.viewModel.scenarios.scenarioFormModel.updateFiltersAndLeaseBlocks();
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createCopy = function() {
        var selection = this;

        //create a copy of this shape to be owned by the user
        $.ajax({
            url: '/scenario/copy_design/' + selection.uid + '/',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                //app.viewModel.scenarios.loadSelectionsFromServer();
                app.viewModel.scenarios.addScenarioToMap(null, {uid: data[0].uid});
            },
            error: function (result) {
                //debugger;
            }
        })
    };

    self.deleteScenario = function() {
        var selection = this;

        //first deactivate the layer
        selection.deactivateLayer();

        //remove from activeLayers
        app.viewModel.activeLayers.remove(selection);
        //remove from app.map
        if (selection.layer) {
            app.map.removeLayer(selection.layer);
        }
        //remove from selectionList
        app.viewModel.scenarios.selectionList.remove(selection);

        //remove from server-side db (this should provide error message to the user on fail)
        $.ajax({
            url: '/scenario/delete_design/' + selection.uid + '/',
            type: 'POST',
            error: function (result) {
                //debugger;
            }
        })
    };

    // identical to drawingModel functions
    self.shapefileDownloadLink = function() {
        var url = "/scenario/export/shp/" + self.id + ".zip";
        return url;
    }
    self.geojsonDownloadLink = function() {
        var url = "/scenario/export/geojson/" + self.id + ".geojson";
        return url;
    }
    self.wktDownloadLink = function() {
        var url = "/scenario/export/wkt/" + self.id + "-wkt.txt";
        return url;
    }
    self.kmlDownloadLink = function() {
        var url = "/scenario/export/kml/" + self.id + ".kml";
        return url;
    }

    return ret;
}; // end selectionModel

function selectionFormModel(options) {
    var self = this;

    self.IE = false;

    self.leaseBlockLayer = app.viewModel.getLayerById(6);
    if (self.leaseBlockLayer.active()) {
        self.leaseBlockLayerWasActive = true;
        if ( !self.leaseBlockLayer.visible() ) {
            self.leaseBlockLayer.setVisible();
        }
    } else {
        self.leaseBlockLayer.activateLayer();
    }


    self.leaseBlockSelectionLayer = new layerModel({
        name: 'Selectable OCS Lease Blocks Layer',
        type: 'Vector',
        url: '/static/data_manager/geojson/OCSBlocks20130920.json',
        opacity: .5
    });

    self.leaseBlockSelectionLayerIsLoaded = false;

    self.selectingLeaseBlocks = ko.observable(false);

    self.selectedLeaseBlocksLayerName = 'Selected Lease Blocks';

    self.selectedLeaseBlocks = ko.observableArray();

    self.loadLeaseBlockSelectionLayer = function() {
        var defaultStyle = new OpenLayers.Style({
            //display: 'none'
            fillOpacity: 0,
            strokeColor: '#000',
            strokeOpacity: 0
        });
        var selectStyle = new OpenLayers.Style({
            strokeColor: '#00467F',
            strokeOpacity: .8
        });
        var styleMap = new OpenLayers.StyleMap( {
            'default': defaultStyle,
            'select': selectStyle
        });

        self.leaseBlockSelectionLayer.layer = new OpenLayers.Layer.Vector(
            self.leaseBlockSelectionLayer.name,
            {
                projection: new OpenLayers.Projection('EPSG:3857'),
                displayInLayerSwitcher: false,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    url: self.leaseBlockSelectionLayer.url,
                    format: new OpenLayers.Format.GeoJSON()
                }),
                styleMap: styleMap,
                layerModel: self.leaseBlockSelectionLayer
            }
        );
        app.map.addLayer(self.leaseBlockSelectionLayer.layer);


        /* PAINTBRUSH CONTROLS*/

        self.leaseBlockSelectionLayerBrushControl = new OpenLayers.Control.SelectFeature(
            self.leaseBlockSelectionLayer.layer, {
                multiple: true,
                hover: true,
                callbacks: {
                    out: function(event){}
                }
            }
        );
        app.map.addControl(self.leaseBlockSelectionLayerBrushControl);

        self.leaseBlockSelectionLayerClickControl = new OpenLayers.Control.SelectFeature(
            self.leaseBlockSelectionLayer.layer, {
                multiple: true,
                toggle: true,
            }
        );
        app.map.addControl(self.leaseBlockSelectionLayerClickControl);

        self.navigationControl = app.map.getControlsByClass('OpenLayers.Control.Navigation')[0];

        $('#map').mousedown( function() {
            if (self.selectingLeaseBlocks()) {
                //self.navigationControl.deactivate();
                self.leaseBlockSelectionLayerClickControl.deactivate();
                self.leaseBlockSelectionLayerBrushControl.activate();
            }
        });

        $('#map').mouseup( function() {
            if (self.selectingLeaseBlocks()) {
                //self.navigationControl.activate();
                self.leaseBlockSelectionLayerClickControl.activate();
                self.leaseBlockSelectionLayerBrushControl.deactivate();
            }
        });

        /* END PAINTBRUSH CONTROLS */

        self.leaseBlockSelectionLayerIsLoaded = true;
    }

    self.toggleSelectionProcess = function() {
        if ( ! self.selectingLeaseBlocks() ) { // if not currently in the selection process, enable selection process
            self.enableSelectionProcess();
        } else { // otherwise, disable selection process
            self.disableSelectionProcess();
        }
    };

    self.enableSelectionProcess = function() {
        // if lease block selection layer has not yet been loaded...
        if ( ! self.leaseBlockSelectionLayerIsLoaded ) {
            self.loadLeaseBlockSelectionLayer();
        } else {
            self.leaseBlockSelectionLayer.layer.setVisibility(true);
            self.selectedLeaseBlocksLayer.removeAllFeatures();
        }

        if (self.edit) {
            self.selection.deactivateLayer();
            self.leaseBlockSelectionLayer.layer.events.register("loadend", self.leaseBlockSelectionLayer.layer, function() {
                for (var i=0; i<self.leaseBlockSelectionLayer.layer.features.length; i+=1) {
                    var id = self.leaseBlockSelectionLayer.layer.features[i].data['PROT_NUMB'];
                    for (var j=0; j<self.selectedLeaseBlocks().length; j+=1) {
                        if (id === self.selectedLeaseBlocks()[j]) {
                            self.leaseBlockSelectionLayerClickControl.select(self.leaseBlockSelectionLayer.layer.features[i]);
                        }
                    }
                }
            });
        }

        self.navigationControl.deactivate();
        //activate the lease block feature selection
        self.leaseBlockSelectionLayerClickControl.activate();
        //app.addUtfLayerToMap(self.leaseBlockLayer);
        //disable feature attribution
        app.viewModel.disableFeatureAttribution();
        //change button text
        self.selectingLeaseBlocks(true);
    };

    self.disableSelectionProcess = function() {
        self.navigationControl.activate();
        //deactivate lease block feature selection
        self.leaseBlockSelectionLayerClickControl.deactivate();
        //enable feature attribution
        app.viewModel.enableFeatureAttribution();
        //change button text
        self.selectingLeaseBlocks(false);

        //re-create selectedLeaseBlocksLayer
        if ( self.selectedLeaseBlocksLayer && app.map.getLayer(self.selectedLeaseBlocksLayer.id) ) {
            app.map.removeLayer(self.selectedLeaseBlocksLayer);
        }
        self.selectedLeaseBlocksLayer = new OpenLayers.Layer.Vector(
            "Selected Lease Blocks Layer", {
                projection: new OpenLayers.Projection('EPSG:3857'),
                styleMap: new OpenLayers.StyleMap({
                    fillColor: '#00467F',
                    strokeColor: '#888888'
                })
            }
        );
        self.leaseBlockSelectionLayer.layer.setVisibility(false);
        for (var i=0; i<self.leaseBlockSelectionLayer.layer.selectedFeatures.length; i+=1) {
            self.selectedLeaseBlocksLayer.addFeatures([self.leaseBlockSelectionLayer.layer.selectedFeatures[i].clone()]);
        }
        app.map.addLayer(self.selectedLeaseBlocksLayer);

        //assign leaseblock ids to hidden leaseblock ids form field
        self.selectedLeaseBlocks([]);
        for (var i=0; i<self.selectedLeaseBlocksLayer.features.length; i++) {
            self.selectedLeaseBlocks().push(self.selectedLeaseBlocksLayer.features[i].data.PROT_NUMB);
        }
        $('#id_leaseblock_ids').val(self.selectedLeaseBlocks().join(","));

    };

    self.toggleLeaseBlockLayer = function(formModel, event) {
        if ( event.target.type === "checkbox" ) {
            if ($('#lease-blocks-layer-toggle input').is(":checked")) {
                self.leaseBlockLayer.activateLayer();
            } else {
                self.leaseBlockLayer.deactivateLayer();
            }
        }
        return true;
    };

    return self;
}; // end selectionFormModel

/* This is the "parent" class for the "Selection" model aka Lease block
collections, and the "Drawing" model aka Drawings. */
function scenarioModel(options) {
    var self = this;

    self.id = options.uid || null;
    self.uid = options.uid || null;
    self.name = options.name;
    self.featureAttributionName = self.name;
    self.description = options.description;
    self.shared = ko.observable();
    self.sharedByName = options.sharedByName || null;
    self.sharedByUsername = options.sharedByUsername;
    self.sharedBy = ko.observable();

    self.selectedGroups = ko.observableArray();
    self.sharedGroupsList = [];
    if (options.sharingGroups && options.sharingGroups.length) {
        self.selectedGroups(options.sharingGroups);
    }

    self.sharedWith = ko.observable();
    self.updateSharedWith = function() {
        if (self.selectedGroups().length) {
            var groupNames = "Shared with " + self.selectedGroups()[0];
            for(var i=1; i<self.selectedGroups().length; i+=1) {
                groupNames += ", " + self.selectedGroups()[i];
            }
            self.sharedWith(groupNames);
        }
    };

    if (options.shared) {
        self.shared(true);
        var s = ['Shared By',
                 self.sharedByName,
                 'to group' + (self.selectedGroups().length == 1 ? '' : 's'),
                 self.selectedGroups().join(", ")];
        self.sharedBy(s.join(" "));
    }
    else {
        self.shared(false);
        self.sharedBy(false);
    }
    
    self.updateSharedWith();
    self.selectedGroups.subscribe( function() {
        self.updateSharedWith();
    });
    self.temporarilySelectedGroups = ko.observableArray();

    self.attributes = [];
    self.scenarioAttributes = options.attributes ? options.attributes.attributes : [];

    self.showingLayerAttribution = ko.observable(true);
    self.toggleLayerAttribution = function() {
        var layerID = '#' + app.viewModel.convertToSlug(self.name);
        if ( self.showingLayerAttribution() ) {
            self.showingLayerAttribution(false);
            $(layerID).css('display', 'none');
        } else {
            self.showingLayerAttribution(true);
            $(layerID).css('display', 'block');
        }
        //update scrollbar
        // app.viewModel.updateAggregatedAttributesOverlayScrollbar();
    };

    //self.overview = self.description || 'no description was provided';
    self.constructInfoText = function() {
        var attrs = self.scenarioAttributes,
            output = '';
        if (self.description && self.description !== '') {
            output = self.description + '\n\n';
        }
        for (var i=0; i< attrs.length; i++) {
            output += attrs[i].title + ': ' + attrs[i].data + '\n';
        }
        return output;
    };
    self.overview = self.constructInfoText();

    self.scenarioReportValues = options.attributes ? options.attributes.report_values : [];

    self.features = options.features;

    self.active = ko.observable(false);
    self.visible = ko.observable(false);
    self.defaultOpacity = options.opacity || 0.8;
    self.opacity = ko.observable(self.defaultOpacity);
    self.type = 'Vector';
    self.layer = ko.observable(false);

    self.opacity.subscribe( function(newOpacity) {
        if ( self.layer() && self.layer().hasOwnProperty('styleMap')) {
            self.layer().styleMap.styles['default'].defaultStyle.strokeOpacity = newOpacity;
            self.layer().styleMap.styles['default'].defaultStyle.fillOpacity = newOpacity;
            self.layer().redraw();
        } else {
          var live_layers = app.wrapper.map.getLayers();

          for (var y = 0; y < live_layers.length; y++) {
            var ol_layer = live_layers[y];
            if (ol_layer.get('mpid') == self.id) {
              ol_layer.set('opacity', newOpacity);
              break;
            }
          }
        }
    });

    self.toggleActive = function(self, event) {
        var scenario = this;

        // start saving restore state again and remove restore state message from map view
        app.saveStateMode = true;
        app.viewModel.error(null);
        //app.viewModel.unloadedDesigns = [];

        //app.viewModel.activeLayer(layer);
        if (scenario.layer() && scenario.layer().active()) { // if layer is active, then deactivate
            scenario.deactivateLayer();
        } else { // otherwise layer is not currently active, so activate
            scenario.activateLayer();
            //app.viewModel.scenarios.addScenarioToMap(scenario);
        }
    };
    
    self.activateLayer = function() {
        var scenario = this;
        app.viewModel.scenarios.addScenarioToMap(scenario);
        // if (scenario.id.indexOf('drawing') !== -1) {
        // } else
        // if ( scenario.isSelectionModel ) {
        //     for (var i=0; i < app.viewModel.scenarios.activeSelections().length; i=i+1) {
        //         if(app.viewModel.scenarios.activeSelections()[i].id === scenario.id) {
        //             app.viewModel.scenarios.activeSelections().splice(i,1);
        //             i = i-1;
        //         }
        //     }
        //     app.viewModel.scenarios.activeSelections().push(scenario);
        // }
        self.active(true);
    };



    self.deactivateLayer = function() {
        var scenario = this;

        scenario.active(false);
        scenario.visible(false);

        if ( scenario.isSelectionModel ) {
            var index = app.viewModel.scenarios.activeSelections().indexOf(scenario);
            app.viewModel.scenarios.activeSelections().splice(index, 1);
            app.viewModel.scenarios.reports.updateChart();
        }

        scenario.opacity(scenario.defaultOpacity);
        app.setLayerVisibility(scenario.layer(), false);
        // app.viewModel.activeLayers.remove(scenario);
        scenario.layer().deactivateLayer()

        app.viewModel.removeFromAggregatedAttributes(scenario.name);
        /*
        //remove the key/value pair from aggregatedAttributes
        delete app.viewModel.aggregatedAttributes()[scenario.name];
        //if there are no more attributes left to display, then remove the overlay altogether
        if ($.isEmptyObject(app.viewModel.aggregatedAttributes())) {
            app.viewModel.aggregatedAttributes(false);
        }
        */
    };

    self.edit = function() {
        var scenario = this;
        return $.ajax({
            url: '/features/scenario/' + scenario.uid + '/form/',
            success: function(data) {
                //$('#scenario-form').append(data);
                app.viewModel.scenarios.scenarioForm(true);
                $('#scenario-form').html(data);
                app.viewModel.scenarios.scenarioFormModel = new scenarioFormModel();
                ko.applyBindings(app.viewModel.scenarios.scenarioFormModel, document.getElementById('scenario-form'));
                app.viewModel.scenarios.scenarioFormModel.updateFiltersAndLeaseBlocks();

                if ($('#id_input_parameter_wind_speed').is(':checked')) {
                    //app.viewModel.scenarios.scenarioFormModel.windSpeedParameter(true);
                    app.viewModel.scenarios.scenarioFormModel.toggleWindSpeedWidget();
                }
                if ($('#id_input_parameter_depth').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleDepthWidget();
                }
                if ($('#id_input_parameter_distance_to_shore').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleDistanceToShoreWidget();
                }
                if ($('#id_input_parameter_distance_to_substation').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleSubstationWidget();
                }
                if ($('#id_input_parameter_distance_to_awc').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleAWCWidget();
                }
                if ($('#id_input_filter_distance_to_shipping').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleShippingLanesWidget();
                }
                if ($('#id_input_filter_ais_density').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleShipTrafficWidget();
                }
                if ($('#id_input_filter_uxo').is(':checked')) {
                    app.viewModel.scenarios.scenarioFormModel.toggleUXOWidget();
                }
                app.viewModel.scenarios.scenarioFormModel.updateFiltersAndLeaseBlocks();
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createCopy = function() {
        var scenario = this;

        //create a copy of this shape to be owned by the user
        $.ajax({
            url: '/scenario/copy_design/' + scenario.uid + '/',
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                //app.viewModel.scenarios.loadSelectionsFromServer();
                app.viewModel.scenarios.addScenarioToMap(null, {uid: data[0].uid});
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.deleteScenario = function() {
        var scenario = this;

        //first deactivate the layer
        scenario.deactivateLayer();

        //remove from activeLayers
        app.viewModel.activeLayers.remove(scenario);
        //remove from app.map
        if (scenario.layer()) {
            app.map.removeLayer(scenario.layer());
        }
        //remove from scenarioList
        app.viewModel.scenarios.scenarioList.remove(scenario);

        //remove from server-side db (this should provide error message to the user on fail)
        $.ajax({
            url: '/scenario/delete_design/' + scenario.uid + '/',
            type: 'POST',
            error: function (result) {
                //debugger;
            }
        });
    };

    self.visible = ko.observable(false);

    // bound to click handler for layer visibility switching in Active panel
    self.toggleVisible = function() {
        var scenario = this;

        if (scenario.visible()) { //make invisible
            scenario.visible(false);
            app.setLayerVisibility(scenario, false);

            app.viewModel.removeFromAggregatedAttributes(scenario.name);

        } else { //make visible
            scenario.visible(true);
            app.setLayerVisibility(scenario, true);
        }
    };

    // is description active
    self.infoActive = ko.observable(false);
    // display descriptive text below the map
    self.toggleDescription = function(scenario) {
        if ( ! scenario.infoActive() ) {
            self.showDescription(scenario);
        } else {
            self.hideDescription(scenario);
        }
    };

    self.showDescription = function(scenario) {
        self.infoActive(true);
    };

    self.hideDescription = function(scenario) {
        self.infoActive(false);
    };

    // identical to drawingModel functions
    self.shapefileDownloadLink = function() {
        var url = "/scenario/export/shp/" + self.id + ".zip";
        return url;
    }
    self.geojsonDownloadLink = function() {
        var url = "/scenario/export/geojson/" + self.id + ".geojson";
        return url;
    }
    self.wktDownloadLink = function() {
        var url = "/scenario/export/wkt/" + self.id + "-wkt.txt";
        return url;
    }
    self.kmlDownloadLink = function() {
        var url = "/scenario/export/kml/" + self.id + ".kml";
        return url;
    }
    return self;
} // end scenarioModel


function scenariosModel(options) {
    var self = this;

    self.scenarioList = ko.observableArray();
    self.scenarioForm = ko.observable(false);

    self.activeSelections = ko.observableArray();
    self.selectionList = ko.observableArray();
    self.selectionForm = ko.observable(false);

    self.drawingList = ko.observableArray();
    self.drawingForm = ko.observable(false);
    self.loadingDrawingForm = ko.observable(false);

    self.userLayerForm = ko.observable(false);

    /** return true if normal MyPlanner content should be shown, false
        otherwise (when a form is active and assuming control of MyPlanner's
        space).
     */
    self.showMyPlanner = function() {
        // How about: when a form becomes active, it sets a variable called
        // anyFormActive(true)
        return !(self.scenarioForm() ||
                 self.reportsVisible() ||
                 self.drawingForm() ||
                 // This is awkward, but bookmarks and user layers aren't really scenarios,
                 // and they live in their own place.
                 app.viewModel.addBookmarksDialogVisible() ||
                 self.userLayerForm() ||
                 self.selectionForm());
    }


    self.getSelectionById = function(id) {
        var selections = self.selectionList();
        for (var i=0; i<selections.length; i++) {
            if ( selections[i].id === id ) {
                return selections[i];
            }
        }
        return false;
    };


    self.reportsVisible = ko.observable(false);
    self.showComparisonReports = function() {
        setTimeout(function() {
            $('#designs-slide').hide('slide', {direction: 'left'}, 300);
        }, 100);
        setTimeout(function() {
            self.reportsVisible(true);
            $('#designs-slide').show('slide', {direction: 'right'}, 300);
            if (self.activeSelections().length > 0) {
                self.reports.noActiveCollections(false);
                app.viewModel.scenarios.reports.updateChart();
            } else {
                self.reports.noActiveCollections(true);
            }
        }, 420);
    };

    self.returnToDesigns = function() {
        setTimeout(function() {
            $('#designs-slide').hide('slide', {direction: 'right'}, 300);
        }, 100);
        setTimeout(function() {
            app.viewModel.scenarios.reportsVisible(false);
            $('#designs-slide').show('slide', {direction: 'left'}, 300);
        }, 420);
    };


    self.leaseblockLayer = ko.observable(false);

    self.leaseblockLayer.subscribe( function() {
        app.viewModel.updateAttributeLayers();
    });

    self.scenarioLeaseBlocksLayerName = 'Selected OCS Blocks';

    // loading message for showing spinner
    // false for normal operation
    self.loadingMessage = ko.observable(false);
    self.errorMessage = ko.observable(false);

    self.sharingGroups = ko.observableArray();
    self.hasSharingGroups = ko.observable(false);

    self.sharingLayer = ko.observable();
    self.showSharingModal = function(scenario) {
        self.sharingLayer(scenario);
        self.sharingLayer().temporarilySelectedGroups(self.sharingLayer().selectedGroups().slice(0));
        $('#share-modal').modal('show');
    };

    self.showExportModal = function(object) {
        self.sharingLayer(object);
        $('#export-geometry').modal('show');
    }

    self.groupMembers = function(groupName) {
        var memberList = "";
        for (var i=0; i<self.sharingGroups().length; i++) {
            var group = self.sharingGroups()[i];
            if (group.group_name === groupName) {
                for (var m=0; m<group.members.length; m++) {
                    var member = group.members[m];
                    memberList += member + '<br>';
                }
            }
        }
        return memberList;
    };

    self.toggleGroup = function(obj) {
        var groupName = obj.group_name,
            indexOf = self.sharingLayer().temporarilySelectedGroups.indexOf(groupName);
        if ( indexOf === -1 ) {  //add group to list
            self.sharingLayer().temporarilySelectedGroups.push(groupName);
        } else { //remove group from list
            self.sharingLayer().temporarilySelectedGroups.splice(indexOf, 1);
        }
    };

    self.initSharingModal = function() {
        for (var i=0; i<self.sharingGroups().length; i++) {
            var groupID = '#' + self.sharingGroups()[i].group_slug;
            $(groupID).collapse( { toggle: false } );
        }
    };

    //TODO:  Fix the problem in which the first group toggled open will not toggle open again, once it's closed
    self.lastMembersClickTime = 0;
    self.toggleGroupMembers = function(obj, e) {
        var groupName = obj.group_name,
            groupID = '#' + obj.group_slug,
            clickTime = new Date().getTime();
        if (clickTime - self.lastMembersClickTime > 800) {
            self.lastMembersClickTime = clickTime;
            if ( ! $(groupID).hasClass('in') ) {  //toggle on and add group to list
                $(groupID).css("display", "none"); //allows the fade effect to display as expected
                if ( $.browser.msie ) {
                    $(groupID).fadeIn(0, function() {});
                } else {
                    $(groupID).fadeIn('slow', function() {});
                }
                $(groupID).collapse('show');
            } else { //toggle off and remove group from list
                if ( $.browser.msie ) {
                    $(groupID).fadeOut(0, function() {});
                } else {
                    $(groupID).fadeOut('slow', function() {});
                }
                $(groupID).collapse('hide');
                //set .modal-body background to eliminate residue that appears when the last Group is opened and then closed?
            }
            setTimeout(function() { self.updateSharingScrollBar(groupID); }, 300);
        }
    };

    self.groupIsSelected = function(groupName) {
        if (self.sharingLayer()) {
            var indexOf = self.sharingLayer().temporarilySelectedGroups.indexOf(groupName);
            return indexOf !== -1;
        }
        return false;
    };

    self.zoomToScenario = function(scenario) {
      setTimeout(function() {
        if (scenario.layer()) {
          var layer = scenario.layer();
          if (!scenario.active()) {
            scenario.activateLayer();
          }
          var extent = app.wrapper.layer_functions.getLayerExtent(layer);
          if (extent && extent.indexOf(Infinity) == -1 && extent.indexOf(-Infinity) == -1) {
            app.wrapper.map.zoomToBufferedExtent(extent, 0.2);
          }
        } else {
          self.addScenarioToMap(scenario, {zoomTo: true});
        }
      }, 500);
    };

    self.updateSharingScrollBar = function(groupID) {
        var sharingScrollpane = $('#sharing-groups').data('jsp');
        if (sharingScrollpane === undefined) {
            $('#sharing-groups').jScrollPane( {animateScroll: true});
        } else {
            sharingScrollpane.reinitialise();
            var groupPosition = $(groupID).position().top,
                containerPosition = $('#sharing-groups .jspPane').position().top,
                actualPosition = groupPosition + containerPosition;
            //console.log('group position = ' + groupPosition);
            //console.log('container position = ' + containerPosition);
            //console.log('actual position = ' + actualPosition);
            if (actualPosition > 140) {
                //console.log('scroll to ' + (groupPosition-120));
                sharingScrollpane.scrollToY(groupPosition-120);
            }

        }
    };


    // scenariosLoaded will be set to true after they have been loaded
    self.scenariosLoaded = false;
    self.selectionsLoaded = false;

    self.isScenariosOpen = ko.observable(false);
    self.toggleScenariosOpen = function(force) {
        // ensure designs tab is activated
        $('#designsTab').tab('show');

        if (force === 'open') {
            self.isScenariosOpen(true);
        } else if (force === 'close') {
            self.isScenariosOpen(false);
        } else {
            if ( self.isScenariosOpen() ) {
                self.isScenariosOpen(false);
            } else {
                self.isScenariosOpen(true);
            }
        }
    };
    self.isCollectionsOpen = ko.observable(false);
    self.toggleCollectionsOpen = function(force) {
        // ensure designs tab is activated
        $('#designsTab').tab('show');

        if (force === 'open') {
            self.isCollectionsOpen(true);
        } else if (force === 'close') {
            self.isCollectionsOpen(false);
        } else {
            if ( self.isCollectionsOpen() ) {
                self.isCollectionsOpen(false);
            } else {
                self.isCollectionsOpen(true);
            }
        }
    };
    self.isDrawingsOpen = ko.observable(false);
    self.toggleDrawingsOpen = function(force) {
        // ensure designs tab is activated
        $('#designsTab').tab('show');

        if (force === 'open') {
            self.isDrawingsOpen(true);
        } else if (force === 'close') {
            self.isDrawingsOpen(false);
        } else {
            if ( self.isDrawingsOpen() ) {
                self.isDrawingsOpen(false);
            } else {
                self.isDrawingsOpen(true);
            }
        }
    };


    //restores state of Designs tab to the initial list of designs
    self.reset = function (obj) {
        self.loadingMessage(false);
        self.errorMessage(false);

        //clean up scenario form
        if (self.scenarioForm() || self.scenarioFormModel) {
            self.removeScenarioForm();
        }

        //clean up selection form
        if (self.selectionForm() || self.selectionFormModel) {
            self.removeSelectionForm(obj);
        }

        //clean up drawing form
        if (self.drawingForm() || self.drawingFormModel) {
            self.removeDrawingForm(obj);
        }

        //clean up drawing form
        if (self.userLayerForm() || app.viewModel.userLayers.userLayerForm()) {
            app.viewModel.userLayers.removeUserLayerForm(obj);
        }

        //remove the key/value pair from aggregatedAttributes
        app.viewModel.removeFromAggregatedAttributes(self.leaseblockLayer().name);
        app.viewModel.updateAttributeLayers();
    };

    

    self.removeDrawingForm = function(obj) {
        self.drawingFormModel.cleanUp();
        self.drawingForm(false);
        var drawingForm = document.getElementById('drawing-form');
        $(drawingForm).empty();
        ko.cleanNode(drawingForm);
        //in case of canceled edit
        if ( obj && obj.cancel && self.drawingFormModel.originalDrawing ) {
            self.drawingFormModel.originalDrawing.deactivateLayer();
            self.drawingFormModel.originalDrawing.activateLayer();
        }
        delete self.drawingFormModel;
    };

    self.removeSelectionForm = function(obj) {
        self.selectionForm(false);
        var selectionForm = document.getElementById('selection-form');
        $(selectionForm).empty();
        ko.cleanNode(selectionForm);
        if (self.selectionFormModel.IE) {
            if (self.selectionFormModel.selectedLeaseBlocksLayer) {
                app.map.removeLayer(self.selectionFormModel.selectedLeaseBlocksLayer);
            }
        } else {
            app.map.removeControl(self.selectionFormModel.leaseBlockSelectionLayerClickControl);
            app.map.removeControl(self.selectionFormModel.leaseBlockSelectionLayerBrushControl);
            if (self.selectionFormModel.selectedLeaseBlocksLayer) {
                app.map.removeLayer(self.selectionFormModel.selectedLeaseBlocksLayer);
            }
            if (self.selectionFormModel.leaseBlockSelectionLayer.layer) {
                app.map.removeLayer(self.selectionFormModel.leaseBlockSelectionLayer.layer);
            }
            if (self.selectionFormModel.navigationControl) {
                self.selectionFormModel.navigationControl.activate();
            }
        }
        if ( ! self.selectionFormModel.leaseBlockLayerWasActive ) {
            if ( self.selectionFormModel.leaseBlockLayer.active() ) {
                self.selectionFormModel.leaseBlockLayer.deactivateLayer();
            }
        }
        if ( (obj && obj.cancel) && self.selectionFormModel.selection && !self.selectionFormModel.selection.active() ) {
            self.selectionFormModel.selection.activateLayer();
        }
        delete self.selectionFormModel;
        app.viewModel.enableFeatureAttribution();
    };

    self.removeScenarioForm = function() {
        self.scenarioForm(false);
        var scenarioForm = document.getElementById('scenario-form');
        $(scenarioForm).empty();
        ko.cleanNode(scenarioForm);
        delete self.scenarioFormModel;
        //hide remaining leaseblocks
        if ( self.leaseblockLayer() && app.map.getLayersByName(self.leaseblockLayer().name).length ) {
            app.map.removeLayer(self.leaseblockLayer());
        }
    };

    self.createWindScenario = function() {
        //hide designs tab by sliding left
        return $.ajax({
            url: '/features/scenario/form/',
            success: function(data) {
                self.scenarioForm(true);
                $('#scenario-form').html(data);
                self.scenarioFormModel = new scenarioFormModel();
                ko.applyBindings(self.scenarioFormModel, document.getElementById('scenario-form'));
                if (!self.leaseblockLayer()) {
                    self.loadLeaseblockLayer();
                }
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createSelectionDesign = function() {
        return $.ajax({
            url: '/features/leaseblockselection/form/',
            success: function(data) {
                self.selectionForm(true);
                $('#selection-form').html(data);
                self.selectionFormModel = new selectionFormModel();
                ko.applyBindings(self.selectionFormModel, document.getElementById('selection-form'));
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createPolygonDesign = function() {
        app.viewModel.scenarios.loadingDrawingForm(true);
        return $.ajax({
            url: '/features/aoi/form/',
            success: function(data) {
                app.viewModel.scenarios.drawingForm(true);
                $('#drawing-form').html(data);
                app.viewModel.scenarios.drawingFormModel = new polygonFormModel();
                try {
                  ko.applyBindings(app.viewModel.scenarios.drawingFormModel, document.getElementById('drawing-form'));
                }
                catch(e) {}
                app.viewModel.scenarios.loadingDrawingForm(false);
            },
            error: function (result) {
                //debugger;
                app.viewModel.scenarios.loadingDrawingForm(false);
            }
        });
    };

    self.createLineDesign = function() {};

    self.createPointDesign = function() {};

    //
    self.addScenarioToMap = function(scenario, options) {
        var scenarioId,
            opacity = .8,
            stroke = 1,
            fillColor = "#2F6A6C",
            strokeColor = "#1F4A4C",
            zoomTo = (options && options.zoomTo) || false;

        if ( scenario ) {
            scenarioId = scenario.uid;
            scenario.active(true);
            scenario.visible(true);
        } else {
            scenarioId = options.uid;
        }

        var isDrawingModel = false,
            isSelectionModel = false,
            isScenarioModel = false;
        if (scenarioId.indexOf('drawing') !== -1) {
            isDrawingModel = true;
        }
        else if (scenarioId.indexOf('leaseblockselection') !== -1) {
            isSelectionModel = true;
        } else {
            isScenarioModel = true;
        }
        if (self.scenarioFormModel) {
            self.scenarioFormModel.isLeaseblockLayerVisible(false);
        }
        //perhaps much of this is not necessary once a scenario has been added to app.map.layers initially...?
        //(add check for scenario.layer, reset the style and move on?)
        $.ajax( {
            url: '/features/generic-links/links/geojson/' + scenarioId + '/',
            type: 'GET',
            dataType: 'json',
            success: function(feature) {
                var layer_name = scenarioId;
                if (scenario) {
                  layer_name = scenario.name;
                } else if (feature.features.length == 1 && feature.features[0].properties.hasOwnProperty('name')) {
                  layer_name = feature.features[0].properties.name;
                }

                let layer_settings = {
                    'id': scenarioId,
                    'name': layer_name,
                    'order': 0,
                    'url': "/features/generic-links/links/geojson/" + scenarioId + "/",
                    'type': 'Vector',
                    'isDrawingModel': isDrawingModel,
                    'isSelectionModel': isSelectionModel
                  }

                  let custom_legend = false;
                  let scenario_properties = feature.features[0].properties;
                  if (feature && feature.hasOwnProperty('features') && feature.features.length > 0 && feature.features[0].hasOwnProperty('properties')) {
                    if (scenario_properties.hasOwnProperty('color')){
                        layer_settings['color'] = scenario_properties.color;
                        custom_legend = true;
                    }
                    if (scenario_properties.hasOwnProperty('fill_opacity')){
                        layer_settings['fillOpacity'] = scenario_properties.fill_opacity;
                        custom_legend = true;
                    }
                    if (scenario_properties.hasOwnProperty('stroke_color')){
                        layer_settings['outline_color'] = scenario_properties.stroke_color;
                        custom_legend = true;
                    }
                    if (scenario_properties.hasOwnProperty('stroke_width')){
                        layer_settings['outline_width'] = scenario_properties.stroke_width;
                        custom_legend = true;
                    }
                  }

                  if (custom_legend) {
                    let swatch_element = {};
                    // get feature type
                    // -- If any feature is a polygon, we build a square swatch
                    // -- Else if any feature is a point, we build a circle swatch
                    // -- Else it's a line and we make a line, ignoring any fill.
                    let type = false;
                    for (var collection_index = 0; collection_index < feature.features.length; collection_index++){
                        collection = feature.features[collection_index];
                        if (type != "Polygon" || !scenario_properties) {
                            if (collection.geometry.hasOwnProperty('geometries')) {
                                for (var feature_index = 0; feature_index < collection.geometry.geometries.length; feature_index++){
                                    if (!scenario_properties) {
                                        scenario_properties = collection.properties; 
                                    }
                                    geometry = collection.geometry.geometries[feature_index];
                                    if (geometry.type == "Polygon") {
                                        type = "Polygon";
                                        break;
                                    } else if (geometry.type == "Point") {
                                        type = "Point";
                                    } else {
                                        type = geometry.type;
                                    }
                                }
                            } else {
                                // FeatureCollection rather than geometry collecion
                                type = collection.geometry.type;
                            }
                        }
                    }
                    if (scenario_properties) {
                        swatch_element.label = scenario_properties.name;
                        if (type=="LineString") {
                            swatch_element.type = 'line';
                            // swatch_element.color = properties.stroke_color;
                            style = `border-top: ${scenario_properties.stroke_width}px solid ${scenario_properties.stroke_color};`; 
                            swatch_element.viz = `<div class="legend-line" style="${style}"></div>`;
                        } else {
                            let fill_dict = hexToRgb(scenario_properties.color);
                            fill_dict.a = scenario_properties.fill_opacity;
                            let fill_color = `rgba(${fill_dict.r},${fill_dict.g},${fill_dict.b},${fill_dict.a})`;
                            svg_size = 17;
                            svg_center = svg_size/2;
                            svg_stroke_width = scenario_properties.stroke_width;
                            svg_stroke_color = scenario_properties.stroke_color;
                            if (type=="Point") {
                                svg_r = (svg_size-svg_stroke_width)/2;
                                svg_center += svg_stroke_width;
                                svg_circle = `<circle r="${svg_r}px" cx="${svg_center}px" cy="${svg_center}px" stroke="${svg_stroke_color}" stroke-width="${svg_stroke_width}px" fill="${fill_color}" />`;
                                swatch_element.type = 'point_image';
                                swatch_element.viz = `<svg height="${svg_size}px" width="${svg_size}px" xmlns="http://www.w3.org/2000/svg" class="legend-${swatch_element.type}">${svg_circle}</svg>`;
                            } else {
                                if (type=="Polygon") {
                                    swatch_size = svg_size-2*svg_stroke_width;
                                    if (swatch_size < 4) {
                                        swatch_size = 4;
                                        svg_stroke_width = (svg_size-4)/2;
                                    }
                                } else {
                                    swatch_size = svg_size-5-(2*svg_stroke_width);
                                }
                                svg_swatch = `<rect width="${svg_size}px" height="${svg_size}px" x="1px" y="1px" style="fill:${fill_color};stroke-width:${svg_stroke_width};stroke:${svg_stroke_color}" />`;
                                swatch_element.type = 'swatch';
                                swatch_element.viz = `<svg width="${svg_size}px" height="${svg_size}px" xmlns="http://www.w3.org/2000/svg" class="legend-${swatch_element.type}">${svg_swatch}</svg>`;
                            }
                        }
                        layer_settings.legend = {'elements': [swatch_element]};
                    }
                  }

                  var layer = new layerModel(layer_settings, false);

                // app.wrapper.scenarios.addFeaturesToScenarioLayer(layer, feature);

                if ( scenario ) {
                    //reasigning opacity here, as opacity wasn't 'catching' on state load for scenarios
                    scenario.opacity(opacity);
                    scenario.layer(layer);
                    scenario.layer().scenarioModel = scenario;
                } else { //create new scenario
                    //only do the following if creating a scenario
                    var properties = feature.features[0].properties;
                    if (isDrawingModel) {
                        scenario = new drawingModel({
                            id: properties.uid,
                            uid: properties.uid,
                            name: properties.name,
                            description: properties.description,
                            features: layer.features
                        });
                        layer.color = properties.color;
                        layer.fillOpacity = properties.fill_opacity;
                        layer.outline_color = properties.stroke_color;
                        layer.outline_width = properties.stroke_width;
                        self.toggleDrawingsOpen('open');
                        self.zoomToScenario(scenario);
                    } else if (isSelectionModel) {
                        scenario = new selectionModel({
                            id: properties.uid,
                            uid: properties.uid,
                            name: properties.name,
                            description: properties.description,
                            features: layer.features
                        });
                        self.toggleCollectionsOpen('open');
                        self.zoomToScenario(scenario);
                    } else {
                        scenario = new scenarioModel({
                            id: properties.uid,
                            uid: properties.uid,
                            name: properties.name,
                            description: properties.description,
                            features: layer.features
                        });
                        self.toggleScenariosOpen('open');
                        self.zoomToScenario(scenario);
                    }
                    scenario.layer(layer);
                    scenario.layer().scenarioModel = scenario;
                    scenario.active(true);
                    scenario.visible(true);

                    app.viewModel.layerIndex[scenario.id] = scenario;

                    //get attributes
                    $.ajax( {
                        url: '/scenario/get_attributes/' + scenarioId + '/',
                        type: 'GET',
                        dataType: 'json',
                        success: function(result) {
                            scenario.scenarioAttributes = result.attributes;
                            if (isSelectionModel) {
                                scenario.scenarioReportValues = result.report_values;
                            }
                        },
                        error: function (result) {
                            //debugger;
                        }

                    });

                    //in case of edit, removes previously stored scenario
                    //self.scenarioList.remove(function(item) { return item.uid === scenario.uid } );

                    if ( isDrawingModel ) {
                        var previousDrawing = ko.utils.arrayFirst(self.drawingList(), function(oldDrawing) {
                            return oldDrawing.uid === scenario.uid;
                        });
                        if ( previousDrawing ) {
                            self.drawingList.replace( previousDrawing, scenario );
                        } else {
                            self.drawingList.push(scenario);
                        }
                        self.drawingList.sort(self.alphabetizeByName);
                    } else if ( isSelectionModel ) {
                        var previousSelection = ko.utils.arrayFirst(self.selectionList(), function(oldSelection) {
                            return oldSelection.uid === scenario.uid;
                        });
                        if ( previousSelection ) {
                            self.selectionList.replace( previousSelection, scenario );
                        } else {
                            self.selectionList.push(scenario);
                        }
                        self.activeSelections().push(scenario);
                        self.selectionList.sort(self.alphabetizeByName);
                    } else {
                        var previousScenario = ko.utils.arrayFirst(self.scenarioList(), function(oldScenario) {
                            return oldScenario.uid === scenario.uid;
                        });
                        if ( previousScenario ) {
                            self.scenarioList.replace( previousScenario, scenario );
                        } else {
                            self.scenarioList.push(scenario);
                        }
                        self.scenarioList.sort(self.alphabetizeByName);
                    }

                    //self.scenarioForm(false);
                    self.reset();
                }

                //app.addVectorAttribution(layer);
                //in case of edit, removes previously displayed scenario
                app.wrapper.map.removeLayerByName(scenario.name);
                app.wrapper.map.removeLayerByUID(scenario.uid);
                // for (var i=0; i<app.map.layers.length; i++) {
                //     if (app.map.layers[i].name === scenario.uid) {
                //         app.map.removeLayer(app.map.layers[i]);
                //         i--;
                //     }
                // }
                // app.addLayerToMap(scenario.layer);
                scenario.layer().activateLayer();
                //add scenario to Active tab
                // app.viewModel.activeLayers.remove(function(item) { return item.uid === scenario.uid; } );
                // app.viewModel.activeLayers.unshift(scenario);

                if (zoomTo) {
                    self.zoomToScenario(scenario);
                }

            },
            error: function(result) {
                //debugger;
                app.viewModel.scenarios.errorMessage(result.responseText.split('\n\n')[0]);
            }
        });
    }; // end addScenarioToMap

    self.alphabetizeByName = function(a, b) {
        var name1 = a.name.toLowerCase(),
            name2 = b.name.toLowerCase();
        if (name1 < name2) {
            return -1;
        } else if (name1 > name2) {
            return 1;
        }
        return 0;
    };

    // activate any lingering designs not shown during loadCompressedState
    self.showUnloadedDesigns = function() {
        var designs = {};
        var design_ids = [];
        if (app.viewModel.unloadedDesigns) {
            for (var design_index = 0; design_index < app.viewModel.unloadedDesigns.length; design_index++) {
                var id = app.viewModel.unloadedDesigns[design_index].id;
                design_ids.push(id);
                designs[id] = app.viewModel.unloadedDesigns[design_index];
            }
        }

        if (design_ids.length > 0) {
            //the following delay might help solve what appears to be a race condition
            //that prevents the design in the layer list from displaying the checked box icon after loadin
            setTimeout( function() {
                for (var x=0; x < design_ids.length; x=x+1) {
                    var id = design_ids[x],
                        opacity = designs[id].opacity,
                        isVisible = designs[id].isVisible;

                    if (app.viewModel.layerIndex[id]) {
                        app.viewModel.layerIndex[id].activateLayer();
                        window.setTimeout(function(){
                          app.viewModel.layerIndex[id].opacity(opacity);
                        }, 500)
                        for (var i=0; i < app.viewModel.unloadedDesigns.length; i=i+1) {
                          if(app.viewModel.unloadedDesigns[i].id === id) {
                            app.viewModel.unloadedDesigns.splice(i,1);
                            i = i-1;
                          }
                        }
                    }
                }
            }, 2750);
        }
    };

    self.loadScenariosFromServer = function() {
        $.ajax({
            url: '/scenario/get_scenarios',
            type: 'GET',
            dataType: 'json',
            success: function (scenarios) {
                self.loadScenarios(scenarios);
                self.scenariosLoaded = true;
                self.showUnloadedDesigns();
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    //populates scenarioList
    self.loadScenarios = function (scenarios) {
        self.scenarioList.removeAll();
        $.each(scenarios, function (i, scenario) {
            var scenarioViewModel = new scenarioModel({
                id: scenario.uid,
                uid: scenario.uid,
                name: scenario.name,
                description: scenario.description,
                attributes: scenario.attributes,
                shared: scenario.shared,
                sharedByUsername: scenario.shared_by_username,
                sharedByName: scenario.shared_by_name,
                sharingGroups: scenario.sharing_groups
            });
            self.scenarioList.push(scenarioViewModel);
            app.viewModel.layerIndex[scenario.uid] = scenarioViewModel;
        });
        self.scenarioList.sort(self.alphabetizeByName);
    };

    self.loadSelectionsFromServer = function() {
        $.ajax({
            url: '/scenario/get_selections',
            type: 'GET',
            dataType: 'json',
            success: function (selections) {
                self.loadSelections(selections);
                self.selectionsLoaded = true;
                self.showUnloadedDesigns();
            },
            error: function (result) {
                //debugger;
            }
        });
    };
    //populates selectionList
    self.loadSelections = function (selections) {
        self.selectionList.removeAll();
        $.each(selections, function (i, selection) {
            var selectionViewModel = new selectionModel({
                id: selection.uid,
                uid: selection.uid,
                name: selection.name,
                description: selection.description,
                attributes: selection.attributes,
                shared: selection.shared,
                sharedByUsername: selection.shared_by_username,
                sharedByName: selection.shared_by_name,
                sharingGroups: selection.sharing_groups
            });
            self.selectionList.push(selectionViewModel);
            app.viewModel.layerIndex[selection.uid] = selectionViewModel;
        });
        self.selectionList.sort(self.alphabetizeByName);
    };

    self.loadDrawingsFromServer = function() {
        $.ajax({
            url: '/drawing/get_drawings',
            type: 'GET',
            dataType: 'json',
            success: function (drawings) {
                self.loadDrawings(drawings);
                self.drawingsLoaded = true;
                self.showUnloadedDesigns();
            },
            error: function (result) {
                //debugger;
            }
        });
    };
    //populates selectionList
    self.loadDrawings = function (drawings) {
        self.drawingList.removeAll();
        $.each(drawings, function (i, drawing) {
            var drawingViewModel = new drawingModel({
                id: drawing.uid,
                uid: drawing.uid,
                name: drawing.name,
                description: drawing.description,
                attributes: drawing.attributes,
                shared: drawing.shared,
                sharedByUsername: drawing.shared_by_username,
                sharedByName: drawing.shared_by_name,
                sharingGroups: drawing.sharing_groups
            });
            if (drawing.owned_by_user) {
                self.drawingList.push(drawingViewModel);
            }
            app.viewModel.layerIndex[drawing.uid] = drawingViewModel;
        });
        self.drawingList.sort(self.alphabetizeByName);
    };

    self.loadLeaseblockLayer = function() {
        //console.log('loading lease block layer');
        var leaseBlockLayer = new OpenLayers.Layer.Vector(
            self.scenarioLeaseBlocksLayerName,
            {
                projection: new OpenLayers.Projection('EPSG:3857'),
                displayInLayerSwitcher: false,
                strategies: [new OpenLayers.Strategy.Fixed()],
                protocol: new OpenLayers.Protocol.HTTP({
                    //url: '/static/data_manager/geojson/LeaseBlockWindSpeedOnlySimplifiedNoDecimal.json',
                    url: '/static/data_manager/geojson/OCSBlocks20130920.json',
                    format: new OpenLayers.Format.GeoJSON()
                }),
                //styleMap: new OpenLayers.StyleMap( {
                //    "default": new OpenLayers.Style( { display: "none" } )
                //})
                layerModel: new layerModel({
                    name: self.scenarioLeaseBlocksLayerName
                })
            }
        );
        self.leaseblockLayer(leaseBlockLayer);

        self.leaseblockLayer().events.register("loadend", self.leaseblockLayer(), function() {
            if (self.scenarioFormModel && ! self.scenarioFormModel.IE) {
                self.scenarioFormModel.showLeaseblockSpinner(false);
            }
        });
    };

    self.leaseblockList = [];

    //populates leaseblockList
    self.loadLeaseblocks = function (ocsblocks) {
        self.leaseblockList = ocsblocks;
    };

    self.cancelShare = function() {
        self.sharingLayer().temporarilySelectedGroups.removeAll();
    };

    //SHARING DESIGNS
    self.submitShare = function() {
        self.sharingLayer().selectedGroups(self.sharingLayer().temporarilySelectedGroups().slice(0));
        var data = { 'scenario': self.sharingLayer().uid, 'groups': self.sharingLayer().selectedGroups() };
        $.ajax( {
            url: '/scenario/share_design',
            data: data,
            type: 'POST',
            dataType: 'json',
            error: function(result) {
                //debugger;
            }
        });
    };


    // External interface to objects for menus
    self.editDrawing = function(drawing) {
        drawing.edit();
    };
    self.createCopyOfDrawing = function(drawing) {
        drawing.createCopy();
    };
    self.shareDrawing = function(drawing) {
        self.showSharingModal(drawing);
    };
    self.exportDrawing = function(drawing) {
        self.showExportModal(drawing);
    }
    self.zoomToDrawing = function(drawing) {
        self.zoomToScenario(drawing);
    };
    self.deleteDrawing = function(drawing) {
        // Insert RUS before submitting
        app.viewModel.rus.showDialog(
            "Remove Drawing?", 
            `Are you sure you wish to delete your drawing "${drawing.name}"?`,
            function(){
                drawing.deleteScenario();
            }
        );
    };


    self.editLeaseBlockCollection = function(leaseBlockCollection) {
        leaseBlockCollection.edit();
    };
    self.createCopyOfLeaseBlockCollection = function(leaseBlockCollection) {
        leaseBlockCollection.createCopy();
    };
    self.shareLeaseBlockCollection = function(leaseBlockCollection) {
        self.showSharingModal(leaseBlockCollection);
    };
    self.zoomToLeaseBlockCollection = function(leaseBlockCollection) {
        self.zoomToScenario(leaseBlockCollection);
    };
    self.deleteLeaseBlockCollection = function(leaseBlockCollection) {
        leaseBlockCollection.deleteScenario();
    };

    self.editWindEnergySiting = function(windEnergySiting) {
        windEnergySiting.edit();
    };
    self.createCopyOfWindEnergySiting = function(windEnergySiting) {
        windEnergySiting.createCopy();
    };
    self.shareWindEnergySiting = function(windEnergySiting) {
        self.showSharingModal(windEnergySiting);
    };
    self.zoomToWindEnergySiting = function(windEnergySiting) {
        self.zoomToScenario(windEnergySiting);
    };
    self.deleteWindEnergySiting = function(windEnergySiting) {
        windEnergySiting.deleteScenario();
    };



    return self;
} // end scenariosModel

$('#designsTab').on('show.bs.tab', function (e) {
    //if ( app.viewModel.scenarios.reports && app.viewModel.scenarios.reports.showingReport() ) {
    //    app.viewModel.scenarios.reports.updateChart();
    //}
    if ( !app.viewModel.scenarios.scenariosLoaded || !app.viewModel.scenarios.selectionsLoaded) {
        // load the scenarios
        app.viewModel.scenarios.loadScenariosFromServer();

        // load the selections
        app.viewModel.scenarios.loadSelectionsFromServer();

        // load the drawing
        app.viewModel.scenarios.loadDrawingsFromServer();

        // load the user-imported layers
        app.viewModel.userLayers.getUserLayers();

        // load the leaseblocks
        $.ajax({
            url: '/scenario/get_leaseblocks',
            type: 'GET',
            dataType: 'json',
            success: function (ocsblocks) {
                app.viewModel.scenarios.loadLeaseblocks(ocsblocks);
            },
            error: function (result) {
                //debugger;
            }
        });

        $.jsonrpc('get_sharing_groups', [], {
            success: function(result) {
                app.viewModel.scenarios.sharingGroups(result);
                if (result.length) {
                    app.viewModel.scenarios.hasSharingGroups(true);
                }
            }
        });
    }
});
