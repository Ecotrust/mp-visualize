app.wrapper = {
  'layers': {},
  'layer_functions': {},
  'events': {},
  'map': {},
  'controls': {},
  'state': {},
  'map_library': {},
  'scenarios': {},
  'baseLayers': [
    {
      'name': 'ocean',
      'altName': 'ESRI Ocean',
      'verboseName': 'Ocean',
      'url': 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others',
      'minZoom': null,
      'maxZoom': 13,
      'bounds': [],
      'projection': '',
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': "gray",
      'altName': 'Gray',
      'verboseName': 'Gray',
      'url': 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others',
      'minZoom': null,
      'maxZoom': 13,
      'bounds': [],
      'projection': '',
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'osm',
      'altName': 'Open Street Map',
      'verboseName': 'Open Street Map',
      'url': '',
      'attribution': '',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'OSM',
      'textColor': 'black'
    },
    {
      'name': 'streets',
      'altName': 'streets',
      'verboseName': 'ESRI Streets',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom, and others',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'topo',
      'altName': 'Physical',
      'verboseName': 'ESRI Physical',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black'
    },
    {
      'name': 'satellite',
      'altName': 'satellite',
      'verboseName': 'ESRI Satellite',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and others',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'white'
    },
    {
      'name': 'nautical',
      'altName': 'nautical',
      'verboseName': 'Nautical Charts',
      'url': 'https://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/ImageServer/exportImage',
      'attribution': 'NOAA',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'projection': 'EPSG:3857',
      'technology': 'ArcGIS',
      'params': {'layers': null },
      'textColor': 'black'
    },
  ]
}

/**
  * app.getBaseLayerDefinitionByName - given a name, get the initial JSON definition of the layer
  * @param {sting} name - the name of the layer to recover
  */
app.getBaseLayerDefinitionByName = function(name) {
  for (var i = 0; i < app.wrapper.baseLayers.length; i++) {
    if (app.wrapper.baseLayers[i].name.toLowerCase() == name.toLowerCase() || app.wrapper.baseLayers[i].altName.toLowerCase() == name.toLowerCase()) {
      return app.wrapper.baseLayers[i];
    }
  }
  return null;
}
