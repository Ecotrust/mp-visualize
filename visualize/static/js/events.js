/**
  * clickOnArcRESTLayerEvent - check if identification query should be performed, doing it if so
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
if (!app.wrapper.events.hasOwnProperty('clickOnArcRESTLayerEvent')) {
  app.wrapper.events.clickOnArcRESTLayerEvent = function(layer, evt){
    if (app.wrapper.map.getLayerParameter(layer, 'url')){
      var identifyUrl = app.wrapper.map.getLayerParameter(layer, 'url')
      .replace('export', app.wrapper.map.getLayerParameter(layer, 'arcgislayers') + '/query');
    } else {
      var identifyUrl = '';
    }

    var qs = []

    // buffer click by two pixels each direction and use that for selection envelope
    var geometry_raw = {
      UL: app.map.getCoordinateFromPixel([evt.pixel[0]-2, evt.pixel[1]-2]),
      LR: app.map.getCoordinateFromPixel([evt.pixel[0]-2, evt.pixel[1]-2])
    }
    var geometry = [geometry_raw.UL, geometry_raw.LR].join(',');
    qs.push('geometry=' + geometry);
    var geometryType = 'esriGeometryEnvelope';
    qs.push('geometryType=' + geometryType);
    var inSR = 3857;
    qs.push('inSR=' + inSR);
    var outSR = 3857;
    qs.push('outSR=' + outSR);
    var spatialRel = 'esriSpatialRelIntersects';
    qs.push('spatialRel=' + spatialRel);
    var format = 'json';
    qs.push('f=' + format);
    var returnGeometry = true;
    qs.push('returnGeometry=' + returnGeometry);
    var mp_layer = app.wrapper.map.getLayerParameter(layer, 'mp_layer');
    if (mp_layer.attributes.length > 0) {
      var outFieldList = [];
      for (var i = 0; i < mp_layer.attributes.length; i++) {
        attr = mp_layer.attributes[i];
        outFieldList.push(attr.field);
      }
      var outFields = outFieldList.join(',');
    } else {
      var outFields = '*';
    }
    qs.push('outFields=' + outFields);

    $.ajax({
      accepts: {
        mycustomtype: 'application/json',
      },
      dataType: 'json',
      url: identifyUrl + '?' + qs.join('&')
    })
    .done(function(responseText) {
      var clickAttributes = {},
      returnJSON = responseText;
      var mp_layer = app.wrapper.map.getLayerParameter(layer, 'mp_layer');

      //data manager opted to disable via DAI
      if (mp_layer.disable_click) {
        return false;
      }

      if(returnJSON['features'] && returnJSON['features'].length) {

        var report_features = []
        $.each(returnJSON['features'], function(index, feature) {
          var attributeObjs = [];
          var attributeList = feature['attributes'];

          if('fields' in returnJSON) {
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
          report_features.push({
            'name': 'Feature ' + (index+1),
            'id': mp_layer.featureAttributionName + '-' + index,
            'attributes': attributeObjs
          })
          return;
        });
        if (report_features && report_features.length) {
          clickAttributes[mp_layer.featureAttributionName] = report_features;
          $.extend(app.wrapper.map.clickOutput.attributes, clickAttributes);
          app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
          //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
          //the following ensures that the location of the marker has not been displaced while waiting for web services
          app.viewModel.updateMarker(app.wrapper.map.clickLocation);
        }
      }
    })
    .fail(function(response){
      console.log(response);
    });
  };
} //ArcREST Click Event

/**
  * clickOnVectorLayerEvent - check if id query should be performed, doing it if so.
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
if (!app.wrapper.events.hasOwnProperty('clickOnVectorLayerEvent')) {
  app.wrapper.events.clickOnVectorLayerEvent = function(layer, evt){
    console.log('Write ' + app.map_tech + ' code for feature click in ' + app.map_tech + '_events.js: app.wrapper.events.addFeatureClickEvent()');
  }
}

/**
  * clickOnUTFGridLayerEvent - check if id query should be performed, doing it if so
  */
if (!app.wrapper.events.hasOwnProperty('clickOnUTFGridLayerEvent')) {
  app.wrapper.events.clickOnUTFGridLayerEvent = function(layer, evt){
    console.log('Write ' + app.map_tech + ' code for UTF click in ' + app.map_tech + '_events.js: app.wrapper.events.clickOnUTFGridLayerEvent()');
  }
}

/**
  * clickOnWMSLayerEvent - check if id query should be performed, doing it if so
  */
if (!app.wrapper.events.hasOwnProperty('clickOnWMSLayerEvent')) {
  app.wrapper.events.clickOnWMSLayerEvent = function(layer, evt){
    console.log('Write ' + app.map_tech + ' code for WMS click in ' + app.map_tech + '_events.js: app.wrapper.events.clickOnWMSLayerEvent()');
  }
}

if (!app.wrapper.events.hasOwnProperty('formatAttributeReportEntry')) {
  /**
    * formatAttributeReportEntry - given id response data and a layer, format it for display in attributes window
    * returns a list of formatted Attribute Objects.
    * @param {object} feature - the data returned by the identification request
    * @param {object} mp_layer - the Marine Planner formatted layer object.
    */
  app.wrapper.events.formatAttributeReportEntry = function(feature, mp_layer) {
    var attributeObjs = [];
    try {
      if (feature instanceof HTMLElement) {
        attributeObjs.push({
          'display': null,
          'data': feature
        });
        return attributeObjs;
      }
    } catch (error) { /*do nothing*/  }
    var attr_keys = Object.keys(feature);
    var attr_fields = mp_layer.attributes;
    var report_attributes = {};
    for (var i = 0; i < attr_fields.length; i++) {
      report_attributes[attr_fields[i].field] = {
        display: attr_fields[i].display,
        // mp_layer.attributes is ordered by 'order' on the server side. We can derive effective order from the list's own order
        order: i,
        precision: attr_fields[i].precision
      };
    }
    var report_keys = Object.keys(report_attributes);

    for (var j = 0; j < attr_keys.length; j++) {
      var key = attr_keys[j];
      if (report_keys.length == 0){
        attributeObjs.push({
          'display': key,
          'data': feature[key]
        });
      } else if(report_keys.indexOf(key) >= 0) {
        var report_attr = {
          'display': report_attributes[key].display,
          'data': feature[key],
          'order': report_attributes[key].order
        };
        if (report_attributes[key].precision != null) {
          report_attr.data = report_attr.data.toFixed(report_attributes[key].precision);
        }
        // TODO: implement comma-formatted large numbers when appropriate
        // report_attr.data = app.utils.numberWithCommas(report_attr.data);
        attributeObjs.push(report_attr);
        attributeObjs.sort(function(a,b){ return a.order - b.order;});
      }
    }
    return attributeObjs;
  };
};

if (!app.wrapper.events.hasOwnProperty('queryWMSFeatureInfo')) {
  /**
  * queryWMSFeatureInfo - given a Marine Planner layer and a Query URL, request
  *     the WMS feature info and display it in the attribute info report
  * @param {object} mp_layer - the mp_layer the report is for
  * @param {list} getFeatureInfoUrl - the formatted WMS query URL
  */

  app.wrapper.events.queryWMSFeatureInfo = function(mp_layer, getFeatureInfoUrl){
    var image_formats = [
      'image/png',
    ];
    if (image_formats.indexOf(mp_layer.wms_info_format) >=0 ) {
      data = [{'placeholder': getFeatureInfoUrl}];
      app.wrapper.events.generateAttributeReport(mp_layer, data);
      var report_id = mp_layer.name.toLowerCase() + '0';
      report_id = report_id.split(' ').join('-');
      if (mp_layer.wms_info_format.indexOf('image') >= 0) {
        $('#' + report_id).html('<img class="attr_report_img" src="' + getFeatureInfoUrl +'" />');
      }
    } else {
      $.ajax({
        headers: { "Accept": mp_layer.wms_info_format},
        type: 'GET',
        url: '/visualize/proxy/',
        data: {
          url: getFeatureInfoUrl,
        },
        success: function(data, textStatus, request){
          // if (mp_layer.wms_info_format == 'text/xml') {
          if ($.isXMLDoc(data)) {
            var nodeData = {};
            // var featureInfoResponse = data.childNodes[0];
            var featureInfoResponses = data.getElementsByTagName('FeatureInfoResponse');
            if (featureInfoResponses.length > 0) {
              // assume length is 1 for now
              var featureInfoResponse = featureInfoResponses[0];
              var featureInfos = featureInfoResponse.getElementsByTagName('FeatureInfo');
              if (featureInfos.length > 0) {
                //assume length is 1 for now
                var featureInfo = featureInfos[0];
                var featureInfoNodes = featureInfo.childNodes;
                for (var i = 0; i < featureInfoNodes.length; i++) {
                  if (featureInfoNodes[i].nodeType != Node.TEXT_NODE) {
                    nodeData[featureInfoNodes[i].tagName] = featureInfoNodes[i].textContent;
                  }
                }
              }
            }
            data = [nodeData];
          }
          app.wrapper.events.generateAttributeReport(mp_layer, data);
        },
        error: function(data, textStatus, request){
          console.log('error getting WMS feature info.')
        }
      });
    }
  }
}

if (!app.wrapper.events.hasOwnProperty('generateAttributeReport')) {
  /**
  * generateAttributeReport - given an object of report data and a layer, reformat for attr reporting
  * @param {object} mp_layer - the mp_layer the report is for
  * @param {list} data - the list of the data objects to be reported, one per selected feature
  */
  app.wrapper.events.generateAttributeReport = function(mp_layer, data){
    var clickAttributes = {};
    var report_features = [];
    if (data.length > 0){
      for (var i = 0; i < data.length; i++) {
        var feature = data[i];
        var feature_name = 'Feature ' + (i+1);
        var feature_id = mp_layer.featureAttributionName + '-' + i;
        var report_title = mp_layer.featureAttributionName;
        var report_feature = {
          'name': feature_name,
          'id': feature_id,
          'attributes': app.wrapper.events.formatAttributeReportEntry(feature, mp_layer)
        }
        report_features.push(report_feature);
      }
      if (report_features && report_features.length && report_features[0]) {
        clickAttributes[mp_layer.featureAttributionName] = report_features;
        $.extend(app.wrapper.map.clickOutput.attributes, clickAttributes);
        app.viewModel.aggregatedAttributes(app.wrapper.map.clickOutput.attributes);
        //app.viewModel.updateMarker(app.map.getLonLatFromViewPortPx(responseText.xy));
        //the following ensures that the location of the marker has not been displaced while waiting for web services
        app.viewModel.updateMarker(app.wrapper.map.clickLocation);
      }
    }
  };
}
