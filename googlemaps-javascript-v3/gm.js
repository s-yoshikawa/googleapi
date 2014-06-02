var GMAP = GMAP || {};

GMAP.map = {
  zoom: 12,

  geocoder: new google.maps.Geocoder(),

  render: function(location, params) {
    var latlng = new google.maps.LatLng(location.lat(), location.lng());

    var mapOptions = {
      zoom: (typeof params.zoom === "undefined")?this.zoom:params.zoom,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    new google.maps.Map(params.target, mapOptions);
  },

  go: function(params) {
    var address = params.address;
    this.geocoder.geocode({'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var location = results[0].geometry.location;
        GMAP.map.render(location, params);
      }
    });
  }
}

GMAP.streetview = {
  zoom: 8,
  heading: 45,
  pitch: 0,

  geocoder: new google.maps.Geocoder(),

  render: function(location, params) {
    var latlng = new google.maps.LatLng(location.lat(), location.lng());

    var panoramaOptions = {
      position: latlng,
      pov: {
        heading: (typeof params.heading === "undefined")?this.heading:params.heading,
        pitch: (typeof params.pitch === "undefined")?this.pitch:params.pitch
      }
    };

    var panorama = new google.maps.StreetViewPanorama(params.target, panoramaOptions);

    var mapOptions = {
      zoom: (typeof params.zoom === "undefined")?this.zoom:params.zoom,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      tilt: 0,
      streetView: panorama,
      streetViewControl: true
    }
    new google.maps.Map(params.target, mapOptions);
  },

  go: function(params) {
    var address = params.address;
    this.geocoder.geocode({'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var location = results[0].geometry.location;
        GMAP.streetview.render(location, params);
      }
    });
  }
}

GMAP.route = {
  index: 0,
  zoom: 8,

  init: function() {
    GMAP.route.geocoder = new google.maps.Geocoder();
    var size = $(".route").size();
    GMAP.route.directionsDisplay = {};
    for(var i = 0; i < size; i++) {
      GMAP.route.directionsDisplay[i] = new google.maps.DirectionsRenderer();
    }
  },

  direction: function(params) {
    var request = {
      origin: params.origin,
      destination: params.destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
      if(status == google.maps.DirectionsStatus.OK) {
        GMAP.route.directionsDisplay[GMAP.route.index].setDirections(response);
        GMAP.route.index++;
      }
    });
  },

  render: function(location, params) {
    var latlng = new google.maps.LatLng(location.lat(), location.lng());
    var mapOptions = {
      zoom: (typeof params.zoom === "undefined")?this.zoom:params.zoom,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    var map = new google.maps.Map(params.target, mapOptions);
    GMAP.route.directionsDisplay[params.index].setMap(map);
    this.direction(params);
  },

  go: function(params) {
    var address = params.origin;
    this.geocoder.geocode({'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var location = results[0].geometry.location;
        GMAP.route.render(location, params);
      }
    });
  }
}

$(function() {
  GMAP.route.init();

  var counter = 0;
  $(".mapView").each(function() {
    GMAP.route.params = {
      index: counter,
      target: $(this).children(".route")[0],
      origin: $(this).children(".route").data("origin"),
      destination: $(this).children(".route").data("destination")
    };
    GMAP.route.go(GMAP.route.params);

    GMAP.streetview.params = {
      target: $(this).children(".street")[0],
      heading: $(this).children(".street").data("heading"),
      pitch: $(this).children(".street").data("pitch"),
      address: $(this).children(".map").data("address")
    };
    GMAP.streetview.go(GMAP.streetview.params);

    GMAP.map.params = {
      target: $(this).children(".map")[0],
      address: $(this).children(".map").data("address"),
      zoom: $(this).children(".map").data("zoom")
    };
    GMAP.map.go(GMAP.map.params);
    
    counter++;
  });
});
