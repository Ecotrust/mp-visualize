// save the initial load hash so we can use it if set
app.hash = window.location.hash;
app.onResize = function(percent) {
    app.map.render('map');
};

$(window).on('resize', function() {
    app.onResize();
});

// add indexof for typeahead
if (!Array.prototype.indexOf) {

    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    };
 }


// state of the app
app.state = {
  //list of active layer ids in order they appear on the map
  activeLayers: [],
  totalLayers: 0,
  location: {}
};

// property to store the state of the map for restoring
app.restoreState = {};

ko.applyBindings(app.viewModel);
app.viewModel.loadLayersFromServer().done(function() {
  app.onResize();
  
  // trigger events that depend on the map
  $(document).trigger('map-ready');
  
  // if we have the hash state go ahead and load it now
  if (app.hash) {
    app.loadStateFromHash(app.hash);
  }

  // autocomplete for filter
  // See bootstrap3-typeahead docs
  $('.search-box').typeahead({
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

  $('[data-toggle="tooltip"]').tooltip()

  $('#toggleBaselayer').css({'background-image':"url(/static/visualize/img/baselayer-"+app.map.baseLayer.name.split(' ').join('_')+".png)", "color":+app.map.baseLayer.textColor});

$(".nav-tabs li.disabled").on("click", function(e) {
  console.log("SDFA");
    e.preventDefault();
    return false;
});
  // }
});

// initialize the map
app.init();
// Google.v3 uses EPSG:900913 as projection, so we have to
// transform our coordinates
// TODO: Make map center a configuration value
app.map.setCenter(new OpenLayers.LonLat(-73.24, 38.93).transform(
new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), 7);

$(document).ready(function() {
  app.onResize();
  $(window).resize(app.onResize);
  
  //Do not display any warning for missing tiles
  OpenLayers.Util.onImageLoadError = function(){
    this.src = 'http://www.openlayers.org/api/img/blank.gif';
  };
  OpenLayers.Tile.Image.useBlankTile=false;

  // if we have the hash state go ahead and load it now
  /*if (app.hash && !app.loginHash) {
    console.log('document ready without #login hash');
    app.loadStateFromHash(app.hash);
  } */
  // handle coordinate indicator on pointer
  $('#map').bind('mouseleave mouseenter', function(e) {
    $('#pos').toggle();
  });
  $('#map').bind('mousemove', function(e) {
    $('#pos').css({
      left: e.pageX + 20,
      top: e.pageY + 20
    });
  });

  
  $('.form-search').find('.btn').on('click', function(event) {
     $(event.target).closest('form').find('input').val(null).focus();
  });
  
  $('#designsTab[data-toggle="tab"]').on('shown', function(e) {
    setTimeout(function() {$('.group-members-popover').popover({html: true, trigger: 'hover'});}, 2000); 
  });
  
  //the following appears to handle the bookmark sharing, while the earlier popover activation handles the design sharing
  setTimeout(function() {$('.group-members-popover').popover({html: true, trigger: 'hover'});}, 2000); 

  setTimeout(function() {
    $('.disabled').popover({
      delay: {'show': 200},
      trigger: 'hover',
      //template: '<div class="popover layer-popover"><div class="arrow"></div><div class="popover-inner layer-tooltip"><div class="popover-content"><p></p></div></div></div>'
    });
  }, 2000);

  // Basemaps button and drop-down behavior
  //hide basemaps drop-down on mouseout
  $('#basemaps').mouseleave( function(e) {
    if ( $(e.toElement).hasClass('basey') ) { //handler for chrome and ie
        $('#basemaps').addClass('open');
    } else if ( $(e.relatedTarget).hasClass('basey') ) { //handler for ff
        $('#basemaps').addClass('open');
    } else {
        $('#SimpleLayerSwitcher_29').hide();
    }
  });
  
  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mouseleave( function() {
    $('#SimpleLayerSwitcher_29').hide();
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });
  
  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mousedown( function() {
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });
  
  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher_29').mouseenter( function() {
    //$('#basemaps').addClass('open');
  });

  $(document).on('click', 'a[name="start-default-tour"]', function() {
    app.viewModel.startDefaultTour();
  });
  
  $(document).on('click', '#continue-basic-tour', function() {
    app.viewModel.stepTwoOfBasicTour();
  });
  
  $(document).on('click', '#start-data-tour', function() {
    app.viewModel.startDataTour();
  });
  
  $(document).on('click', '#start-active-tour', function() {
    app.viewModel.startActiveTour();
  });

  $(document).on('click', '#share-option', function() {
    app.viewModel.scenarios.initSharingModal();
  });

  $(document).on('click', 'body', function(event) {
    var activeLayer = app.viewModel.activeLayer();
    var elm = '.layer.open.dropdown';
    if (activeLayer && (activeLayer.showSublayers() || $(elm).length)) {
      app.viewModel.outsideSubLayer(event, elm);
    }
  });


  
  // hiding feature attributes on new click events (but ignoring map pan events)
  app.map.events.register('move', app.map, function() {
    app.map.mousedrag = true;
  });
  $('#map').mouseup( function() {
    if ( !app.map.mousedrag ) {
      app.map.clickOutput.attributes = {};
      app.viewModel.closeAttribution();
    }
    app.map.mousedrag = false;
  });
  
  $('a[data-toggle="tab"]').on('shown', function (e) {
    app.updateUrl();
  });
  
  $('[data-toggle="tooltip"]').tooltip()

});

$('#bookmark-form').on('submit', function(event) {
  var inputs = {},
    $form = $(this);
  event.preventDefault();
  $(this).find('input, textarea').each(function(i, input) {
    var $input = $(input);
    inputs[$input.attr('name')] = $input.val();
  });
  $.post('/feedback/bookmark', inputs, function() {
    $form.closest('.modal').modal('hide');
  });
});

$('#feedback-form').on('submit', function (event) {
   var feedback = {}, $form = $(this);
   event.preventDefault();
   $(this).find('input, textarea').each(function (i, input) {
      var $input = $(input);
      feedback[$input.attr('name')] = $input.val();
   });
   feedback.url = window.location.href;
   $.post('/feedback/send', feedback, function () {
      $form.closest('.modal').modal('hide');
      //$('#thankyou-modal').modal('show');
   });
   $form.closest('.modal').modal('hide');
});

$('#left-panel .panel-heading h4 a.collapse-button').click(function(){
  $(this).find('i').toggleClass('fa-angle-double-left fa-angle-double-right');
  $("#left-minimized").toggle();
  $("#left-maximized").toggle();
  if( $("#left-minimized").is( ":visible" ) ){
    $('#left-panel').width('200px')
  }else{
    $('#left-panel').width('')
  }
});

app.wmsSession = [];

//wms layer modal
$('#map-wrapper').on('click', '#wms-button', function() {
  var $mapModal = $('#map-wms-modal');

  //show only one form on load
  if ($('.wmsForm').length > 1) {
    $('.wmsForm').not(':first').remove();
  }
  //clear modal content
  $mapModal.on('hidden.bs.modal', function () {
      $(this).find("input,textarea").val('').end();
  });

  $mapModal.modal();    
});

//clone wms form
$('#map-wms-modal').on('click', '.clone-wms-form', function() {
  var template = $('#wmsForms .wmsForm:first').clone();

  if ($('.wmsForm').length === 1) {
      var formCount = 1;
  }

  formCount++;
  var form = template.clone().find(':input').val("").each(function(){
      //set id to store the updated form number
      var newId = this.id + formCount;
      //update for label
      $(this).prev().attr('for', newId);
      //update remove-wms class
      this.id = newId;
  }).end()

  //inject new form
  .appendTo('#wmsForms');

  //only show removal options on new forms
  form.children('.remove-wms').show();

  return false;
})

//remove wms forms
$('#map-wms-modal').on('click', '.remove-wms-form', function() {
  $(this).parent().parent().empty();
  return false;
});

$(document).mousedown(function(e) {

    // Process "outside" clicks
    if (app.viewModel._outsideClicks.length > 0) {
        var last = app.viewModel._outsideClicks[app.viewModel._outsideClicks.length - 1];
        if (!last.container.contains(e.target)) {
            app.viewModel._outsideClicks.pop();
            last.callback(e);
        }
    }

    return;

  //ensure layer switcher is removed
  $('#SimpleLayerSwitcher_29').hide();

  //removing layer tooltip popover from view
  var layer_pvr_event = $(e.target).closest(".layer-popover").length;
  if (!layer_pvr_event) {
    $("#layer-popover").hide();
  }

  //removing opacity popover from view
  var op_pvr_event = $(e.target).closest("#opacity-popover").length;
  var op_btn_event = $(e.target).closest(".opacity-button").length;
  if (!op_pvr_event && !op_btn_event) {
    //$('#opacity-popover').hide();
    app.viewModel.hideOpacity();
  }


});
