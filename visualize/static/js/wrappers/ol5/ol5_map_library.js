/**
  * app.wrapper.map_library.transform - given coordinates and two projection identifiers, transform from one to the other.
  * @param lon - the longitude value of the coordinate;
  * @param lat - the latitude value of the coordinate;
  * @param from - the common identifier (i.e. 'EPSG:3857') of the current coordinate projection
  * @param to - the common identifier (i.e. 'EPSG:4326') of the output coordinate projection
  */
app.wrapper.map_library.transform = function(lon, lat, from, to) {
  return ol.proj.transform([lon, lat], from, to);
}

/**
  * app.wrapper.map_library.getProjection - get the current projection of the map
  */
app.wrapper.map_library.getProjection = function() {
  return app.map.getView().getProjection();
}
