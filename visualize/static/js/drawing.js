
function drawingModel(options) {
    var self = this;

    var ret = scenarioModel.apply(this, arguments);

    self.loadStatus = ko.observable(false);

    //self.isSelectionModel = true;

    //self.pointControl = new OpenLayers.Control.DrawFeature(pointLayer, OpenLayers.Handler.Point);
    //self.lineControl = new OpenLayers.Control.DrawFeature(lineLayer, OpenLayers.Handler.Path);

    //will need to distinguish between drawing types...
    self.edit = function() {
        self.drawing = this;
        if ( ! self.drawing.active() ) {
            self.drawing.activateLayer();
        }
        //app.viewModel.scenarios.drawingFormModel.polygonLayer.addFeatures([new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT($('#id_geometry_orig')[0].value))]);
        //app.viewModel.scenarios.drawingFormModel.polygonLayer.addFeatures([new OpenLayers.Format.WKT().read($('#id_geometry_orig')[0].value)]);

        //app.setLayerVisibility(drawing, false);
        return $.ajax({
            url: '/features/aoi/' + self.drawing.uid + '/form/',
            success: function(data) {
                app.viewModel.scenarios.drawingForm(true);
                app.viewModel.scenarios.drawingFormModel = new polygonFormModel();
                //app.viewModel.scenarios.drawingFormModel.replacePolygonLayer(self.drawing.layer);
                var oldLayer = app.viewModel.scenarios.drawingFormModel.polygonLayer;
                app.viewModel.scenarios.drawingFormModel.originalDrawing = self.drawing;
                app.viewModel.scenarios.drawingFormModel.polygonLayer = self.drawing.layer;
                
                // RDH 20220804: If users try to edit a shape before adding it to the map, the extent
                //  comes back as [Infinity, Infinity, -Infinity, -Infinity], and breaks stuff and 
                //  no edit form shows, forcing the user to refresh the page. This code tries to wait for it.
                var lyr_extent = false;
                try {
                    lyr_extent = self.drawing.layer().getDataExtent();
                } catch (error) {
                    lyr_extent = false;
                }
                if (lyr_extent && lyr_extent[0] != Infinity) {
                    app.map.zoomToExtent(lyr_extent);
                    app.map.zoomOut();
                }
                window.setTimeout(function() {
                    if (!lyr_extent || lyr_extent[0] == Infinity) {
                        try {
                            lyr_extent = self.drawing.layer().getDataExtent();
                        } catch (error) {
                            lyr_extent = false;
                        }
                    }
                    if (lyr_extent && lyr_extent[0] != Infinity) {
                        app.map.zoomToExtent(lyr_extent);
                        app.map.zoomOut();
                        app.map.drawingLayer = self.drawing.layer().layer;

                        $('#drawing-form').html(data);
                        ko.applyBindings(app.viewModel.scenarios.drawingFormModel, document.getElementById('drawing-form'));

                        app.viewModel.scenarios.drawingFormModel.showEdit(true);
                        app.viewModel.scenarios.drawingFormModel.hasShape(true);
                    } else {
                        window.alert("Couldn't load editing form. Try adding your shape to the map before editing");
                    }
                    var drawing_layer_type = self.drawing.layer().layer.getSource().getFeatures()[0].getGeometry().getGeometriesArray()[0].getType();
                    switch(drawing_layer_type) {
                        case 'Polygon':
                            app.viewModel.scenarios.drawingFormModel.sketchMode('polygon');
                            $('#edit-feature-type').html('Shape');
                            break;
                        case 'LineString':
                            app.viewModel.scenarios.drawingFormModel.sketchMode('line');
                            $('#edit-feature-type').html('Line');
                            break;
                        case 'Point':
                            app.viewModel.scenarios.drawingFormModel.sketchMode('point');
                            $('#edit-feature-type').html('Point');
                            break;
                        default:
                            console.log("unknown geom type, can't activate 'Add' button.");
                    }
                }, 500);
            },
            error: function (result) {
                //debugger;
            }
        });
    };

    self.createCopy = function() {
        var drawing = this;

        //create a copy of this shape to be owned by the user
        $.ajax({
            url: '/scenario/copy_design/' + drawing.uid + '/',
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
        var drawing = this;

        //remove from activeLayers
        app.viewModel.activeLayers.remove(drawing.layer());
        //remove from app.map
        app.wrapper.map.removeLayerByUID(drawing.uid)
        //remove from selectionList
        app.viewModel.scenarios.drawingList.remove(drawing);

        //remove from server-side db (this should provide error message to the user on fail)
        $.jsonrpc('delete_drawing', [drawing.uid], {
            //complete: drawingModel.loadDrawingList
        });
    };

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
}

function polygonFormModel(options) {
    var self = this;

    self.isImporting = ko.observable(false);
    self.isDrawing = ko.observable(false);
    self.sketchMode = ko.observable(null);
    self.showEdit = ko.observable(false);
    self.isEditing = ko.observable(false);
    self.hasShape = ko.observable(false);

    app.addDrawingLayerToMap();

    self.startSketch = app.startSketch;
    self.startPolygonSketch = app.startPolygonSketch;
    self.startLineSketch = app.startLineSketch;
    self.startPointSketch = app.startPointSketch;
    self.startEdit = app.startEdit;
    self.completeEdit = app.completeEdit;
    self.cleanUp = app.cleanupDrawing;

    return self;
} // end polygonFormModel

// GIS File Import Logic

const validate_input_file = function() {
    let is_valid = false;
    let input_file_name = $('#gisfile').val();
    let name_length = input_file_name.length;
    let type_valid = false;
    if (
        name_length > 0 &&
        (
            input_file_name.toLowerCase().indexOf('.shp') > 0 ||
            input_file_name.toLowerCase().indexOf('.zip') > 0 ||
            input_file_name.toLowerCase().indexOf('.csv') > 0 ||
            input_file_name.toLowerCase().indexOf('.tsv') > 0 ||
            input_file_name.toLowerCase().indexOf('.json') > 0 ||
            input_file_name.toLowerCase().indexOf('.geojson') > 0 ||
            input_file_name.toLowerCase().indexOf('.kml') > 0 ||
            input_file_name.toLowerCase().indexOf('.kmz') > 0
        )
    ) {
        is_valid = true;
        type_valid = true;
    }
    return {
        'is_valid': is_valid,
        'length': name_length,
        'type_valid': type_valid
    }
}

const add_geojson_to_map = function(geojson) {
    app.wrapper.map.addFeaturesToDrawingLayer(geojson);
}

const interpret_json = function(field) {
    let file = field.prop('files')[0];
    let file_url = URL.createObjectURL(file);
    $.get(file_url, (data) => {
            let geojson_object = JSON.parse(data);
            add_geojson_to_map(geojson_object);
        }, "text");
    finishGISFileImport();
}

const interpret_kml = function(field) {
    let file = field.prop('files')[0];
    let file_url = URL.createObjectURL(file);
    $.ajax(file_url).done(function(xml) {
        let geojson_object = toGeoJSON.kml(xml);
        add_geojson_to_map(geojson_object);
        finishGISFileImport();
    });
}

const interpret_zip = function(field) {
    let file = field.prop('files')[0];
    loadshp({url: file, encoding: 'utf-8'}, function(geojson) { add_geojson_to_map(geojson)});
    finishGISFileImport();
}

const interpret_alt_zip = function() {
    window.alert('To import a zipfile, please only use a standard .zip format: not .bz, .gz, .7z, etc...');
}

const interpret_shp = function(field, filename) {
    window.alert('To import a shapefile, please zip it up into a single .zip file, including at least a .shp, a .dbf, and a .prj, if you have one.');

    // TODO: for .shp or .dbf, provide a new form to add .shp, .dbf, and (optional) .prj, submitting all 3 file-fields at once
    //      Then the below can be fixed to read those directly, rather than assume filenames and try to add them itself
    //      which should never work, for security reasons.

    // EXAMPLE: https://github.com/wavded/js-shapefile-to-geojson/blob/master/index.html

    // let file = field.prop('files')[0];
    // let file_url = URL.createObjectURL(file);
    // let filename_parts = filename.split('.');
    // let filetype = filename_parts.pop();
    // let is_shp = filetype.toLowerCase() == '.shp';
    // let basename = filename_parts.join('.');
    // let cap_first = filetype[0] == filetype[0].toUpperCase();
    // let cap_second = filetype[1] == filetype[1].toUpperCase();
    // let cap_third = filetype[2] == filetype[2].toUpperCase();
    // let partner_ext = '';
    // // Assume consistent capitalization of filename extensions across shapefile
    // if (is_shp){
    //     partner_ext += cap_first ? 'D' : 'd';
    //     partner_ext += cap_second ? 'B' : 'b';
    //     partner_ext += cap_third ? 'F' : 'f';
    // } else {
    //     partner_ext += cap_first ? 'S' : 's';
    //     partner_ext += cap_second ? 'H' : 'h';
    //     partner_ext += cap_third ? 'P' : 'p';
    // }

    // let prj_ext = '';
    // prj_ext += cap_first ? 'P' : 'p';
    // prj_ext += cap_second ? 'R' : 'r';
    // prj_ext += cap_third ? 'J' : 'j';

    // window.setTimeout(function() {
    //     let alt_filename = [basename, partner_ext].join('.');
    //     $('#altfile').val(alt_filename);
    //     let alt_url = $('#altfile').prop('files')[0];
    
    //     let prj_filename = [basename, prj_ext].join('.');
    //     $('#prjfile').val(prj_filename);
    //     let prj_url = $('#prjfile').prop('files')[0];
        
    //     if (is_shp) {
    //         shp_url = file_url;
    //         dbf_url = alt_url;
    //     } else {
    //         shp_url = alt_url;
    //         dbf_url = file_url;
    //     }
    
    //     shapefile = new Shapefile({
    //         shp: shp_url,
    //         dbf: dbf_url,
    //         prj: prj_url
    //     }, function(data){
    //         add_geojson_to_map(data.geojson);
    //     });

    // }, 100);   
}

const interpret_csv = function(field, delimiter) {
    let file = field.prop('files')[0];
    let file_url = URL.createObjectURL(file);
    $.get(file_url, (data) => {
            let parsed_csv = $.csv.toArrays(data, {'separator': delimiter});
            csv2geojson.csv2geojson(data, {
                latfield: parsed_csv[0][0],
                lonfield: parsed_csv[0][1],
                delimiter: delimiter
            }, function(err, data) {
                add_geojson_to_map(data);
            });
        }, "text");
    finishGISFileImport();
}

const finishGISFileImport = function() {
    app.viewModel.scenarios.drawingFormModel.isImporting(true);
}

const interpret_file = function() {
    let field = $('#gisfile');
    let filename = field.val();
    let filename_parts = filename.split('.');
    let filename_type = filename_parts[filename_parts.length-1].toLowerCase();
    switch (filename_type) {
        case 'json':
            interpret_json(field);
            break;
        case 'geojson':
            interpret_json(field);
            break;
        case 'zip':
            interpret_zip(field);
            break;
        case 'shp':
            interpret_shp(field, filename);
            break;
        case 'dbf':
            interpret_shp(field, filename);
            break;
        case 'csv':
            interpret_csv(field, ',');
            break;
        case 'tsv':
            interpret_csv(field, '\t');
            break;
        case 'bz':
            interpret_alt_zip();
            break;
        case 'gz':
            interpret_alt_zip();
            break;
        case '7z':
            interpret_alt_zip();
            break;
        case 'kml':
            interpret_kml(field);
            break;
        case 'kmz':
            // interpret_kml(field)
            window.alert('KMZs are not yet supported. Please unzip the file and updload the resulting .kml file.');
        default:
            window.alert('Unsupported file type "' + filename_type + '". Please convert to a zipped Shapefile, GeoJSON, KML/KMZ, or .CSV. Please use the "feedback" tool to let us know if you\'d like another format supported.');
    }
}