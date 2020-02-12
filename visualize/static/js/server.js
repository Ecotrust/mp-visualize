// load layers from fixture or the server
app.viewModel.loadLayers = function(data) {
	var self = app.viewModel;
	// load layers
	$.each(data.layers, function(i, layer) {
    if (layer) {
      var layerViewModel = new layerModel(layer);

      self.layerIndex[layer.id] = layerViewModel;
      // add sublayers if they exist
      if (layer.subLayers) {
        $.each(layer.subLayers, function(i, layer_options) {
          var subLayer = new layerModel(layer_options, layerViewModel);
          app.viewModel.layerIndex[subLayer.id] = subLayer;
          layerViewModel.subLayers.push(subLayer);
        });
      }
    }
	});

	// load themes
    $.each(data.themes, function(i, themeFixture) {
      if (themeFixture) {
        var layers = [],
            theme = new themeModel(themeFixture);
        if (theme.is_visible) {
            $.each(themeFixture.layers, function(j, layer_id) {
                // create a layerModel and add it to the list of layers
                var layer = self.layerIndex[layer_id];

                if (layer) {  // There is an issue with data-manager where sometimes layers that don't belong
                                //    to this site are getting though

                  // Construct the text document to be searched
                  var searchText = layer.name + ' ' +
                          themeFixture.display_name + ' ' +
                          themeFixture.description + ' ' +
                          layer.description + ' ' +
                          layer.overview;
                  var searchKey = layer.name;

                  layer.themes.push(theme);
                  theme.layers.push(layer);

                  if (!layer.subLayers.length) { //if the layer does not have sublayers
                      self.layerSearchIndex[searchKey] = {
                          layer: layer,
                          searchText: searchText,
                          theme: theme
                      };
                  } else {
                      //if the layer has sublayers
                      $.each(layer.subLayers, function(i, subLayer) {
                          // Construct the text document to be searched
                          var searchText = subLayer.name + ' ' +
                                  themeFixture.display_name + ' / ' +
                                  themeFixture.description + ' ' +
                                  subLayer.parent.name + ' ' +
                                  subLayer.parent.overview + ' ' +
                                  subLayer.parent.description;
                          var searchKey = subLayer.name;

                          if (subLayer.name !== 'Data Under Development') {
                              self.layerSearchIndex[searchKey] = {
                                  layer: subLayer,
                                  searchText: searchText,
                                  theme: theme
                              };
                          }
                      });
                      //sort by order id
                      layer.subLayers.sort( function(a,b) {
                          if (a.order === b.order) {
                              //sort alphabetically if id order is the same
                              return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
                          } else {
                              return a.order - b.order
                          }
                      });
                  }
                }
            });
            //sort by order id
            theme.layers.sort( function(a,b) {
                if (a.order === b.order) {
                    //sort alphabetically if id order is the same
                    return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
                } else {
                    return a.order - b.order
                }
            });


            self.themes.push(theme);
        } else {
            $.each(themeFixture.layers, function(j, layer_id) {
                var layer = self.layerIndex[layer_id];
                if (layer) {    // There is an issue with data-manager where sometimes layers that don't belong
                                //    to this site are getting though
                  layer.themes.push(theme);
                  // if (layer.name === 'Canyon Labels' && $.browser.msie && $.browser.version < 9.0) {
                  //     //skip it
                  // } else {
                       theme.layers.push(layer);
                  // }
                }
            });
            //sort by order id
            theme.layers.sort( function(a,b) { return a.order - b.order });

            self.hiddenThemes.push(theme);
        }
      }
    });

	app.typeAheadSource = (function () {
            var items = [];
            for (var searchTerm in app.viewModel.layerSearchIndex) {
                items.push({
                    'name': searchTerm
                });
            }
            return items;
    })();

};
app.viewModel.loadLayersFromFixture = function() {
	app.viewModel.loadLayers(app.fixture);
};


app.viewModel.loadLayersFromServer = function() {
	return $.getJSON('/data_manager/get_json', function(data) {
		app.viewModel.loadLayers(data);
	});
};

// Begin Cacheless Overhaul
app.viewModel.initLeftNav = function() {
  return $.getJSON('/data_manager/get_themes', function(data) {
    app.viewModel.getSearchData();
    app.viewModel.loadThemes(data);
  })
};

app.viewModel.loadThemes = function(data) {
  var self = app.viewModel;

  // load themes
    $.each(data.themes, function(i, themeFixture) {
      if (themeFixture) {
        var layers = [],
            theme = new themeModel(themeFixture);
            layer = new layerModel({has_sublayers: false, id: null, name: 'Loading...'});
            theme.layers([layer]);
        if (theme.is_visible) {
            self.themes.push(theme);
        } else {
            self.hiddenThemes.push(theme);
        }
				if (theme.name.toLowerCase() == 'companion') {
            theme.getLayers();
        }
      }
    });
};

app.viewModel.getSearchData = function() {
  $.ajax({
    url: '/data_manager/get_layer_search_data',
    success: function(data) {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var searchKey = keys[i];
        if (! data[searchKey].layer.has_sublayers) {
          var searchText = data[searchKey].layer.name + ' ' +
          data[searchKey].theme.name + ' ' +
          data[searchKey].theme.description + ' ' +
          data[searchKey].layer.description + ' ' +
          data[searchKey].layer.overview;
          app.viewModel.layerSearchIndex[searchKey] = {
            layer: data[searchKey].layer.id,
            searchText: searchText,
            theme: data[searchKey].theme.id
          };
        } else {
          for (var j = 0; j < data[searchKey].layer.sublayers.length; j++) {
            var subLayer = data[searchKey].layer.sublayers[j];
            var searchText = subLayer.name + ' ' +
                data[searchKey].theme.display_name + ' / ' +
                data[searchKey].theme.description + ' ' +
                data[searchKey].layer.name + ' ' +
                data[searchKey].layer.overview + ' ' +
                data[searchKey].layer.description;
            // var searchKey = subLayer.name;

            if (subLayer.name !== 'Data Under Development') {
                app.viewModel.layerSearchIndex[subLayer.name] = {
                    layer: subLayer.id,
                    searchText: searchText,
                    theme: data[searchKey].theme
                };
            }
          }
        }
      }
      app.typeAheadSource = (function () {
              var items = [];
              for (var searchTerm in app.viewModel.layerSearchIndex) {
                  items.push({
                      'name': searchTerm
                  });
              }
              return items;
      })();
      // autocomplete for filter
      // See bootstrap3-typeahead docs
      $('.main-search').typeahead({
        source: app.typeAheadSource,
        displayText: function(item) {
          return item.name;
        },
        matcher: function (item) {
          // custom search matching on object titles
          var it = item.name;
          return ~it.toLowerCase().indexOf(this.query.toLowerCase());
        },
        afterSelect: function() {
          // replace the search box contents with the user's actual input
          // otherwise it will be replaced by the display text of the chosen item
          $('#data-search-input').val(app.viewModel.searchTermInput());
        },
        autoSelect: true,
        items: 20,
        minLength: 2
      });
    },
    error: function(data) {
      console.log('failed to get layer search typeahead data');
    }
  });
}
