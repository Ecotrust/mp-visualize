/**
  * clickOnArcRESTLayerEvent - check if identification query should be performed, doing it if so
  * @param {object} layer - the layer clicked
  * @param {object} evt - the click event
  */
if (!app.wrapper.events.hasOwnProperty('clickOnArcRESTLayerEvent')) {
  app.wrapper.events.clickOnArcRESTLayerEvent = function(layer, evt){
    if (app.wrapper.map.getLayerParameter(layer, 'url')){

      var identifyUrl = app.wrapper.map.getLayerParameter(layer, 'url');

      if (identifyUrl.indexOf('export') >= 0) {
        identifyUrl = identifyUrl.replace('export', app.wrapper.map.getLayerParameter(layer, 'arcgislayers') + '/query');
      } else {
        if (identifyUrl[identifyUrl.length-1] != "/") {
          identifyUrl += '/'
        }
        identifyUrl += app.wrapper.map.getLayerParameter(layer, 'arcgislayers') + '/query';
      }
    } else {
      var identifyUrl = '';
    }

    var qs = []

    var mp_layer = app.wrapper.map.getLayerParameter(layer, 'mp_layer');
    // If layer is 'select by point' geom should be a point, not envelope.
    if (mp_layer.query_by_point || layer.get('query_by_point')) {
      var geometry = app.map.getCoordinateFromPixel([evt.pixel[0], evt.pixel[1]]);
      var geometryType = 'esriGeometryPoint';
    } else {
      // buffer click by two pixels each direction and use that for selection envelope
      var geometry_raw = {
        UL: app.map.getCoordinateFromPixel([evt.pixel[0]-2, evt.pixel[1]-2]),
        LR: app.map.getCoordinateFromPixel([evt.pixel[0]+2, evt.pixel[1]+2])
      }
      var geometry = [geometry_raw.UL, geometry_raw.LR].join(',');
      var geometryType = 'esriGeometryEnvelope';

    }

    qs.push('geometry=' + geometry);
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

    if (mp_layer.password_protected() && mp_layer.token() && mp_layer.token() != null) {
      qs.push('token=' + mp_layer.token());
    }

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
                var attribute_rules = mp_layer.attributes.find(o => o.field === field.name);
                if (mp_layer.preserved_format_attributes.indexOf(field.name) < 0) {
                  if (field.type === 'esriFieldTypeDate') {
                    data = new Date(data).toDateString();
                  } else if (app.utils.isNumber(data)) {
                    var precision = false;
                    if (attribute_rules && attribute_rules.hasOwnProperty('precision')) {
                      precision = attribute_rules.precision;
                    }
                    data = app.utils.formatNumber(data, precision);
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

if (!app.wrapper.events.hasOwnProperty('parseGMLFeatureInfoResponse')) {
  /**
    * parseGMLFeatureInfoResponse - given a GML response to a GetFeatureInfo query,
    *     attempt to populate the attribute report with something useful (or punt).
    * @param {object} mp_layer - the mp_layer the report is for
    * @param {list} getFeatureInfoUrl - the formatted WMS query URL
    */
    app.wrapper.events.parseGMLFeatureInfoResponse = function(mp_layer, data) {
      if (data.length > 0) {
        var reported = false;
        if (app.wrapper.events.hasOwnProperty('reportGMLAttributes')) {
          reported = app.wrapper.events.reportGMLAttributes(mp_layer, data);
        }
        if (!reported) {
          try{
            var xml_data = $.parseXML(data);
            var nodeData = {};
            var ignoreTags = [
              'gml:boundedBy',
              'gml:Box',
              'gml:coordinates'
            ]
            for (var i = 0; i < xml_data.all.length; i++) {
              var node = xml_data.all[i];
              var anticipated_prefixes = [
                'gml:',
                'geonode:'
              ]
              for (var prefix_idx = 0; prefix_idx < anticipated_prefixes.length; prefix_idx++) {
                var prefix = anticipated_prefixes[prefix_idx];
                if (node.children.length == 0 && node.tagName.indexOf(prefix) >= 0 && ignoreTags.indexOf(node.tagName) < 0) {
                  var nodeNameList = node.tagName.split(prefix);
                  var nodeName = nodeNameList[nodeNameList.length-1];
                  nodeData[node.tagName.split(prefix)[1]] = node.textContent;
                }
              }
            }
            app.wrapper.events.generateAttributeReport(mp_layer, [nodeData]);
          } catch (error) {
            console.log(error);
          }
        }
      }
      return;
    }
}

app.wrapper.events.fakeSluggify = function(to_slug){
  to_slug = to_slug.split(' ').join('-');
  var special_chars = ['(', ')', '[',']','{','}','!','@','#','$','%','^','&','*','.',',','<','>','?',"\'","\"",":",";","\\","|","~","`"];
  for (var i = 0; i < special_chars.length; i++) {
    to_slug = to_slug.split(special_chars[i]).join('');
  }
  return to_slug;
}


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
    var static_formats = [
      'text/html',
      'text/plain'
    ];
    if (image_formats.indexOf(mp_layer.wms_info_format) >=0 ) {
      data = [{'placeholder': getFeatureInfoUrl}];
      app.wrapper.events.generateAttributeReport(mp_layer, data);
      var report_id = mp_layer.name.toLowerCase() + '0';
      report_id = app.wrapper.events.fakeSluggify(report_id);
      if (mp_layer.wms_info_format.indexOf('image') >= 0) {
        $('#' + report_id).html('<img class="attr_report_img" src="' + getFeatureInfoUrl +'" />');
      }
    } else if (static_formats.indexOf(mp_layer.wms_info_format) >=0 ) {
      data = [{'placeholder': getFeatureInfoUrl}];
      app.wrapper.events.generateAttributeReport(mp_layer, data);
      var report_id = mp_layer.name.toLowerCase() + '0';
      report_id = app.wrapper.events.fakeSluggify(report_id);
      data = $('#' + report_id).html('<iframe class="attr_report_img" src="' + getFeatureInfoUrl +'" />');
    } else {
      let url = '/visualize/proxy/';
      let data = {
        url: getFeatureInfoUrl,
      };
      if (mp_layer.proxy_url) {
        // RDH 2022-06-07: This would be bad: proxying a proxy
        //  Work has been done to craft the URL for you in the OL6+ event wrappers
        url = getFeatureInfoUrl;
        data = {};
      }
      $.ajax({
        headers: { "Accept": mp_layer.wms_info_format},
        type: 'GET',
        url: url,
        data: data,
        success: function(data, textStatus, request){
          if (mp_layer.wms_info_format.indexOf('gml') >= 0) {
            return app.wrapper.events.parseGMLFeatureInfoResponse(mp_layer, data);
          } else if ($.isXMLDoc(data)) {
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
          } else if (typeof(data) == "object" && data.hasOwnProperty('type') && data.type == "FeatureCollection") {
            nodeData = [];
            if (data.hasOwnProperty('features') && data.features.length > 0) {
              for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                nodeData.push(feature.properties);
              }
            }
            data = nodeData;
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
        if (mp_layer.label_field) {
          var feature_name = feature[mp_layer.label_field]
        } else {
          var feature_name = 'Feature ' + (i+1);
        }
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
