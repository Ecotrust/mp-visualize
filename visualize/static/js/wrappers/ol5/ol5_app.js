/*
  * app.onResize (ol5) (removed) - cruft from ol2. It appears ol5 handles resizing issues on its own.
  * @param {int} percent - not used for ol5.
  */
// RDH - instead we'll try to remove this logic from the entire tool since it seems to be ol2 specific
// app.onResize = function(percent) {};

// get layer by ol_uid
app.viewModel.getLayerByOLId = function(id) {
    for (var x=0; x<app.viewModel.themes().length; x++) {
        var layer_list = $.grep(app.viewModel.themes()[x].layers(), function(layer) {
          if(layer.hasOwnProperty('layer') && layer.layer) {
            return layer.layer.ol_uid === id;
          } else {
            return false;
          }
        });
        //find parent layers by ID
        if (layer_list.length > 0) {
            return layer_list[0];
        } else {
            var subLayerArray = [];
            $.each(app.viewModel.themes()[x].layers(), function(i, l) {
                if (l.subLayers.length > 0) {
                   subLayerArray.push.apply(subLayerArray, l.subLayers);
                }
            })
            //find sublayers by ID
            if (subLayerArray.length > 0) {
                var sublayer_list = $.grep(subLayerArray, function(layer) {
                  if (layer.hasOwnProperty('layer') && layer.layer) {
                    return layer.layer.ol_uid === id;
                  } else {
                    return false;
                  }
                });
                if (sublayer_list.length > 0) {
                    return sublayer_list[0];
                }
            }
        }
    }
    return false;
};
