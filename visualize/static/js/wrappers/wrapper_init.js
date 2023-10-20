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
      'verboseName': 'Esri Ocean',
      'url': 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}?token=' + app.ARCGIS_API_KEY,
      'attribution': 'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others',
      'minZoom': null,
      'maxZoom': 13,
      'bounds': [],
      'projection': '',
      'technology': 'XYZ',
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': 'streets',
      'altName': 'streets',
      'verboseName': 'ESRI Streets',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}?token=' + app.ARCGIS_API_KEY,
      'attribution': 'Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom, and others',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': 'topo',
      'altName': 'Physical',
      'verboseName': 'ESRI Physical',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                'World_Topo_Map/MapServer/tile/{z}/{y}/{x}?token=' + app.ARCGIS_API_KEY,
      'attribution': 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': 'satellite',
      'altName': 'satellite',
      'verboseName': 'ESRI Satellite',
      'url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=' + app.ARCGIS_API_KEY,
      'attribution': 'Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and others',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'white',
      'loadFunction': null,
    },
    {
      'name': 'nautical',
      'altName': 'nautical',
      'verboseName': 'Nautical Charts',
      'url': 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/MapServer',
      'attribution': 'NOAA',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'projection': 'EPSG:3857',
      'technology': 'ArcGIS',
      'params': {'layers': '0,1,2,3,4,5,6,7,8,9,10,11,12'},
      'params': {},
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': "gray",
      'altName': 'Positron',
      'verboseName': 'Gray',
      // 'url': 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}?token=' + app.ARCGIS_API_KEY,
      // 'attribution': 'Sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and others',
      'url': 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'attribution': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      'minZoom': null,
      'maxZoom': 13,
      'bounds': [],
      'projection': '',
      'technology': 'XYZ',
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': 'nationalmap',
      'altName': 'National Map',
      'verboseName': 'USGS Map',
      'url': 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
      'attribution': 'USGS The National Map: National Boundaries Dataset, 3DEP Elevation Program, Geographic Names Information System, National Hydrography Dataset, National Land Cover Database, National Structures Dataset, and National Transportation Dataset; USGS Global Ecosystems; U.S. Census Bureau TIGER/Line data; USFS Road Data; Natural Earth Data; U.S. Department of State Humanitarian Information Unit; and NOAA National Centers for Environmental Information, U.S. Coastal Relief Model. Data refreshed April, 2023.',
      'minZoom': null,
      'maxZoom': 19,
      'bounds': [],
      'technology': 'XYZ',
      'textColor': 'black',
      'loadFunction': null,
    },
    {
      'name': 'osm',
      'altName': 'Open Street Map',
      'verboseName': 'Open Street Map',
      'url': '',
      'attribution': '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      'minZoom': null,
      'maxZoom': null,
      'bounds': [],
      'technology': 'OSM',
      'textColor': 'black',
      'loadFunction': null,
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
