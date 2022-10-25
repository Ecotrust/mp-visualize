// save the initial load hash so we can use it if set
app.hash = window.location.hash;
// if (!app.hasOwnProperty('onResize')) {
//   app.onResize = function(percent) {
//     app.map.render('map');
//   };
// }

// $(window).on('resize', function() {
//     app.onResize();
// });

// add indexof for typeahead
if (!Array.prototype.indexOf) {

  Array.prototype.indexOf = function (obj, start) {
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

// RDH: WAY more verbose than we need, but if more styles need 'initial' styles or settings to hold while we wait for
// KOBindings to apply preferred styles, this seems to be an elegant place for them.
let postKOBindingCleanup = function() {
  $('#user-content-notice').css('visibility','unset');
}

// RDH 2022-10-20: Async Issue -- sometimes only part of one theme would load, then upon hitting a call to 'app.map.zoom()' the function
//  could not be found and numerous bindings would fail. Delaying applying bindings by a second seems to resolve the issue. Attempts at
//  shorter timeouts (~800ms) didn't consistently fix the issue.
window.setTimeout(function() {
  ko.applyBindings(app.viewModel);
  postKOBindingCleanup();
}, 1000)

// app.viewModel.loadLayersFromServer().done(function() {
app.viewModel.initLeftNav().done(function () {
  // app.onResize(); // RDH 20191119 - this was commented out for 2019 upgrades, but may be needed for cacheless.

  // trigger events that depend on the map
  $(document).trigger('map-ready');

  // if we have the hash state go ahead and load it now
  if (app.hash) {
    app.loadStateFromHash(app.hash);
  }

  $('[data-toggle="tooltip"]').tooltip();

  $('#toggleBaselayer').css({ 'background-image': "url(/static/visualize/img/baselayer-" + app.wrapper.map.getBasemap().name.split(' ').join('_') + ".png)", "color": +app.wrapper.map.getBasemap().textColor });

  $(".nav-tabs li.disabled").on("click", function (e) {
    e.preventDefault();
    return false;
  });

  setTimeout(function () {
    app.viewModel.showSliderButtons(app.viewModel.checkShowSliderButtons());
  }, 10);
});

// initialize the map
app.init();

// TODO: Make map center a configuration value
// app.wrapper.map.setCenter(-73.24, 38.93);

$(document).ready(function () {
  // app.onResize();
  // $(window).resize(app.onResize);

  app.map.zoom = ko.observable(app.map.getView().getZoom());

  app.map.getView().on('change:resolution', (event) => {
    app.map.zoom(app.map.getView().getZoom());
  });

  //Do not display any warning for missing tiles
  // Be sure to set your map tech accordingly.

  // if we have the hash state go ahead and load it now
  /*if (app.hash && !app.loginHash) {
    console.log('document ready without #login hash');
    app.loadStateFromHash(app.hash);
  } */
  // handle coordinate indicator on pointer
  $('#map').bind('mouseleave mouseenter', function (e) {
    $('#pos').toggle();
  });
  $('#map').bind('mousemove', function (e) {
    $('#pos').css({
      left: e.pageX + 20,
      top: e.pageY + 20
    });
  });


  $('.form-search').find('.btn').on('click', function (event) {
    $(event.target).closest('form').find('input').val(null).focus();
  });

  $('#designsTab[data-toggle="tab"]').on('shown', function (e) {
    setTimeout(function () { $('.group-members-popover').popover({ html: true, trigger: 'hover' }); }, 2000);
  });

  //the following appears to handle the bookmark sharing, while the earlier popover activation handles the design sharing
  setTimeout(function () { $('.group-members-popover').popover({ html: true, trigger: 'hover' }); }, 2000);

  setTimeout(function () {
    $('.disabled').popover({
      delay: { 'show': 200 },
      trigger: 'hover',
      //template: '<div class="popover layer-popover"><div class="arrow"></div><div class="popover-inner layer-tooltip"><div class="popover-content"><p></p></div></div></div>'
    });
  }, 2000);

  // Basemaps button and drop-down behavior
  //hide basemaps drop-down on mouseout
  $('#basemaps').mouseleave(function (e) {
    if ($(e.toElement).hasClass('basey')) { //handler for chrome and ie
      $('#basemaps').addClass('open');
    } else if ($(e.relatedTarget).hasClass('basey')) { //handler for ff
      $('#basemaps').addClass('open');
    } else {
      $('#SimpleLayerSwitcher').hide();
    }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mouseleave(function () {
    $('#SimpleLayerSwitcher').hide();
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mousedown(function () {
    // if (app.mafmc || !app.pageguide.preventBasemapsClose) {
    //     $('#basemaps').removeClass('open');
    // }
  });

  //hide basemaps drop-down on mouseout
  $('#SimpleLayerSwitcher').mouseenter(function () {
    //$('#basemaps').addClass('open');
  });

  $(document).on('click', 'a[name="start-default-tour"]', function () {
    app.viewModel.startDefaultTour();
  });

  $(document).on('click', '#continue-basic-tour', function () {
    app.viewModel.stepTwoOfBasicTour();
  });

  $(document).on('click', '#start-data-tour', function () {
    app.viewModel.startDataTour();
  });

  $(document).on('click', '#start-active-tour', function () {
    app.viewModel.startActiveTour();
  });

  $(document).on('click', '#share-option', function () {
    app.viewModel.scenarios.initSharingModal();
  });

  $(document).on('click', 'body', function (event) {
    var activeLayer = app.viewModel.activeLayer();
    var elm = '.layer.open.dropdown';
    if (activeLayer && typeof activeLayer.showSublayers == 'function') {
      if (activeLayer && (activeLayer.showSublayers() || $(elm).length)) {
        app.viewModel.outsideSubLayer(event, elm);
      }
    }
  });

  $(document).on('click', '#activeTab', function () {
    $('[data-toggle="tooltip"]').tooltip();
  })

  //typeahead autocomplete for mdat layers
  $(document).on('focusin', '.mdat-input', function () {
    var activeMDATParent = app.viewModel.activeLayer();

    function stringShortener(item) {
      var nlb = 'natural log biomass',
        intlb = 'interpolated natural log biomass',
        itName = item.name;

      if (itName.indexOf(nlb) > -1) {
        name = itName.replace(nlb, 'log biomass');
      } else if (itName.indexOf(intlb) > -1) {
        name = itName.replace(intlb, 'iterpolated biomass');
      } else {
        name = itName
      }
      return name
    };

    $(this).typeahead({
      source: activeMDATParent.serviceLayers,
      matcher: function (item) {
        var it = stringShortener(item);
        // custom search matching on object titles
        if (it.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
          return true;
        }
      },
      displayText: function (item) {
        return stringShortener(item);
      },
      afterSelect: function (item) {
        item.url = activeMDATParent.url;
        app.viewModel.activateMDATLayer(item);
      },
      minLength: 2,
      items: 14,
    })
  });

  //typeahead autocomplete for VTR port layers
  $(document).on('focusin', '.port-input', function () {
    var activateVTRParent = app.viewModel.activeLayer();

    $(this).typeahead({
      source: activateVTRParent.serviceLayers,
      matcher: function (item) {
        var it = item.name;
        // custom search matching on object titles
        if (it.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
          return true;
        }
      },
      afterSelect: function (item) {
        item.url = activateVTRParent.url;
        app.viewModel.activateVTRLayer(item);
      },
      minLength: 2,
      items: 12,
    })
  });

  // hiding feature attributes on new click events (but ignoring map pan events)
  var isDragging = false;
  $('#map')
    .mousedown(function () {
      isDragging = false;
    })
    .mousemove(function () {
      isDragging = true;
    })
    .mouseup(function () {
      if (!isDragging) {
        app.wrapper.map.clickOutput.attributes = {};
        app.viewModel.closeAttribution();
      }
      isDragging = false;
    });

  // $('a[data-toggle="tab"]').on('shown', function (e) {
  $('#myTab li').on('click', function (e) {
    setTimeout(function () {
      app.viewModel.showSliderButtons(app.viewModel.checkShowSliderButtons());
    }, 10);
    setTimeout(function () {
      app.updateUrl();
    }, 100);
  });

  $('[data-toggle="tooltip"]').tooltip();

});

$('#bookmark-form').on('submit', function (event) {
  var inputs = {},
    $form = $(this);
  event.preventDefault();
  $(this).find('input, textarea').each(function (i, input) {
    var $input = $(input);
    inputs[$input.attr('name')] = $input.val();
  });
  $.post('/feedback/bookmark', inputs, function () {
    $form.closest('.modal').modal('hide');
  });
});

$('#user-layer-form').on('submit', function(event) {
  var inputs = {},
    $form = $(this);
  event.preventDefault();
  $(this).find('input, textarea').each(function(i, input) {
    var $input = $(input);
    inputs[$input.attr('name')] = $input.val();
  });
  $.post('/feedback/userLayer', inputs, function() {
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

// add panel class for printing
$('#map-wrapper').toggleClass('panel-open');
// toggle panel class for printing
// when map-wrapper has class panel-open the map is translated left by the width of left panel
// this allows the print area to match what the user sees in window
$('.collapse-button').click(function () {
  $('#map-wrapper').toggleClass('panel-open');
});

$('#left-panel .panel-heading h4 a.collapse-button').click(function () {
  $(this).find('i').toggleClass('fa-angle-double-left fa-angle-double-right');
  $("#left-minimized").toggle();
  $("#left-maximized").toggle();
  if ($("#left-minimized").is(":visible")) {
    $('#left-panel').width('200px')
  } else {
    $('#left-panel').width('')
  }
});

var cloneForm = '.clone-wms-form';
//wms layer modal
$('#map-wrapper').on('click', '#wms-button', function () {
  var $mapModal = $('#map-wms-modal');

  $(cloneForm).show();
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
$('#map-wms-modal').on('click', cloneForm, function () {
  var formCount = $('.wmsForm').length;
  var template = $('#wmsForms .wmsForm:first').clone();
  var elm = 'add';

  toggleFormClone(cloneForm, elm);

  formCount++;
  template.find('.modal-help-toggle').remove();
  template.find('.modal-form-help').remove();
  var form = template.clone().find(':input').val("").each(function () {
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
});

//remove wms forms
$('#map-wms-modal').on('click', '.remove-wms-form', function () {
  var elm = 'remove';
  $(this).parent().parent().remove();
  toggleFormClone(cloneForm, elm)
  return false;
});

function toggleFormClone(cloneForm, elm) {
  var formCount = $('.wmsForm').length;

  if (elm === 'add') {
    if (formCount >= 3) {
      $(cloneForm).hide();
    } else {
      $(cloneForm).show()
    }
  } else {
    if (formCount <= 4) {
      $(cloneForm).show();
    } else {
      $(cloneForm).hide();
    }
  }
}

function returnPxOver(pxOver) {
  var printWidthRatio = pxOver / 18;
  if (pxOver < 300) {
    printWidthRatio = pxOver / 13;
  } else if (pxOver < 400) {
    printWidthRatio = pxOver / 14;
  } else if (pxOver < 500) {
    printWidthRatio = pxOver / 15;
  } else if (pxOver < 625) {
    printWidthRatio = pxOver / 16;
  } else if (pxOver < 750) {
    printWidthRatio = pxOver / 17;
  }
  if (printWidthRatio > 0) {
    return printWidthRatio;
  } else {
    return 0;
  }
};

$('#btn-print').click(function () {
  $('#print-modal').modal('show');
  var exportButton = document.getElementById('export-pdf');
  // Show Attribution if hidden:
  var attribution_state = app.wrapper.controls.getAttributionState();
  app.wrapper.controls.setAttributionState('show');
  const attributionElement = document.querySelector('.ol-attribution');
  
  document.body.style.cursor = 'progress';

  // Show legend panel
  document.getElementById('legendTab').click();

  /*-------------------------------
    Start creating printable images
  -------------------------------*/
  canvasImages = [];
  exportButton.disabled = true;
  function createCanvas(el) {
    html2canvas(el, {
      useCORS: true,
    }).then(function (elCanvas) {
      if (elCanvas) {
        var elImg = elCanvas.toDataURL("image/png");
        canvasImages.push(elImg);
      }
    });
  };
  // Create legend canvas
  printables = document.querySelectorAll('.printable');
  for (var i = 0; i < printables.length; i++) {
    createCanvas(printables[i]);
  };
  /*------------------------------
    End creating printable images
  -----------------------------*/
  exportButton.disabled = false;
  document.body.style.cursor = 'auto';

  // Create pdf on button click
  exportButton.addEventListener('click', function () {

    // disable export pdf button and show loading spinner
    exportButton.disabled = true;

    // paper sizes available in millimeters (mm)
    const dims = {
      a0: [1189, 841],
      a1: [841, 594],
      a2: [594, 420],
      a3: [420, 297],
      a4: [297, 210],
      a5: [210, 148],
      letter: [279, 216],
      legal: [356, 216]
    };

    const format = document.getElementById('format').value;
    const resolution = document.getElementById('resolution').value;
    const dim = dims[format];
    const width = Math.round((dim[0] * resolution) / 25.4);
    const height = Math.round((dim[1] * resolution) / 25.4);
    // make legend half the page width
    const legendWidth = dim[0] / 2.5;
    const size = app.map.getSize();
    const viewResolution = app.map.getView().getResolution();

    // Set up attribution to print on map
    let attributionHeight = 6;
    let yAttribution = dim[1] - 6;  
    let attributionElementCanvas;
    html2canvas(attributionElement, {
      useCORS: true,
    }).then(function (elCanvas) {
      if (elCanvas) {
        var elImg = elCanvas.toDataURL("image/png");
        attributionElementCanvas = elImg;
      }
    });
    
    app.map.once('rendercomplete', function () {
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = width;
      mapCanvas.height = height;
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(
        document.querySelectorAll('.ol-layer canvas'),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            const matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      mapContext.globalAlpha = 1;

      // Create PDF
      const pdf = new jspdf.jsPDF("landscape", undefined, format);
      
      //  Add map
      pdf.addImage(
        mapCanvas.toDataURL('image/jpeg'),
        'JPEG',
        0,
        0,
        dim[0],
        dim[1]
      );

      pdf.addImage(
        attributionElementCanvas,
        'PNG',
        0,
        yAttribution,
        0,
        attributionHeight,
        '',
        'MEDIUM'
      );

      // Add the map canvas to the PDF
      canvasImages.forEach(function (anImage) {
        // Add page for each printable image
        pdf.addPage(format, 'p');
        pdf.addImage(
          anImage,
          'PNG',
          10,
          10,
          legendWidth,
          0,
          '',
          'MEDIUM'
        );
      });

      // Auto print
      pdf.autoPrint();
      pdf.save('map.pdf');

      // });

      // Reset original map size
      app.map.setSize(size);
      app.map.getView().setResolution(viewResolution);

      exportButton.disabled = false;
      document.body.style.cursor = 'auto';
      app.wrapper.controls.setAttributionState(attribution_state);
      $('#print-modal').modal('hide');
    });

    // Set print size
    const printSize = [width, height];
    app.map.setSize(printSize);
    const scaling = Math.min(width / size[0], height / size[1]);
    app.map.getView().setResolution(viewResolution / scaling);

  }, false);
});

function downloadImage(data, filename = 'untitled.jpeg') {
  var a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

function printPage() {
  window.print();
}

$(document).mousedown(function (e) {

  // Process "outside" clicks
  if (app.viewModel._outsideClicks.length > 0) {
    var last = app.viewModel._outsideClicks[app.viewModel._outsideClicks.length - 1];
    if (!last.container.contains(e.target)) {
      app.viewModel._outsideClicks.pop();
      last.callback(e);
    }
  }

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

  return;

});
