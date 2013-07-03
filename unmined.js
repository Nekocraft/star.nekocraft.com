/*

  Functions for Google Maps

  uNmINeD (C) 2012 Balázs Farkas
  http://unmined.intro.hu

*/

var minMapX = minRegionX * 512;
var minMapY = minRegionZ * 512;
var mapWidth = (maxRegionX + 1 - minRegionX) * 512;
var mapHeight = (maxRegionZ + 1 - minRegionZ) * 512;

/*

  Lat/long ranges:
  
    lat:    -90 .. +90
    long:  -180 .. +180

*/

var lattitudeRange = 9;
var longitudeRange = 9;
var transformFactor = Math.pow(2, standardZoom - minZoom);

function UnminedProjection() {};

UnminedProjection.prototype.fromLatLngToPoint = function(latLng, opt_point)
{
	var point = opt_point || new google.maps.Point(0, 0);

    point.x = (latLng.lng() / longitudeRange) + 0.5;
	point.y = (latLng.lat() / lattitudeRange) + 0.5;

	point.x = (point.x * mapWidth + minMapX) / transformFactor;
	point.y = (point.y * mapHeight + minMapY) / transformFactor;

	return point;
};

UnminedProjection.prototype.fromPointToLatLng = function(point)
{
	point.x = (point.x * transformFactor - minMapX) / mapWidth;
	point.y = (point.y * transformFactor - minMapY) / mapHeight;

	point.x = (point.x - 0.5) * longitudeRange;
	point.y = (point.y - 0.5) * lattitudeRange;

	return new google.maps.LatLng(point.y, point.x, true);
};

UnminedProjection.prototype.fromPointToMinecraft = function(point)
{
    return new google.maps.Point(point.x * transformFactor, point.y * transformFactor);
};

UnminedProjection.prototype.fromMinecraftToPoint = function(point)
{
    return new google.maps.Point(point.x / transformFactor, point.y / transformFactor);
};

function getQueryParams()
{
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
}

var unminedTypeOptions = {
    getTileUrl: function(coord, zoom) {

        zoomFactor = Math.pow(2, zoom - standardZoom);
        
        var minTileX = Math.floor(minMapX * zoomFactor / 256);
        var minTileY = Math.floor(minMapY * zoomFactor / 256);
        var maxTileX = Math.ceil((minMapX + mapWidth) * zoomFactor / 256) - 1;
        var maxTileY = Math.ceil((minMapY + mapHeight)  * zoomFactor / 256) - 1;

        if (coord.x >= minTileX
          && coord.y >= minTileY
          && coord.x <= maxTileX
          && coord.y <= maxTileY)
            return "tiles"
              + "/zoom." + (zoom - standardZoom)
              + "/" + Math.floor(coord.x / 10)
              + "/" + Math.floor(coord.y / 10)
              + "/tile"
              + "." + coord.x
              + "." + coord.y
              + "." + tileImageFormat;
        else
            return "tiles/empty." + tileImageFormat;
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: maxZoom,
    minZoom: minZoom,
    name: "unmined"
};

var unminedMapType = new google.maps.ImageMapType(unminedTypeOptions);
unminedMapType.projection = new UnminedProjection();

var h = location.hash.substr(1),c = new google.maps.Point(0, 0);
if(h) {
  arr = h.split(" ");
  if(arr[0])c.x = arr[0];
  if(arr[2])c.y = arr[2];
}

var unminedDefaultOptions = {
	zoom: defaultZoom,
	center: unminedMapType.projection.fromPointToLatLng(unminedMapType.projection.fromMinecraftToPoint(c)),
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	mapTypeControl: false,
	streetViewControl: false,
	mapTypeControlOptions:
	{
        mapTypeIds: ["unmined"]
	}
};

