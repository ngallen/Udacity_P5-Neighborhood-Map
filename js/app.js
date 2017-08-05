var initialPlaces = [
{
  name: "The Noshery",
  pos: {lat: 39.7872593, lng: -105.0365347}
},
{
  name: "Cozy Cottage",
  pos: {lat: 39.7773229, lng: -105.0539467}
},
{
  name: "Denver Biscuit Company",
  pos: {lat: 39.7743676, lng: -105.0465118}
},
{
  name: "Revelry Kitchen",
  pos: {lat: 39.7692719, lng: -105.0436237}
},
{
  name: "DJ's Berkeley Cafe",
  pos: {lat: 39.7701176, lng: -105.04608}
}
];

var mapRef = null;
var placeList = null;

// represent a place item
var Place = function (data) {
  this.name = ko.observable(data.name);
  this.pos = ko.observable(data.pos);
  this.placeMarker = null;
};

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    mapRef = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.7818155, lng: -105.0417344},
      zoom: 13
    });

    //creating marker references
    if (placeList !== null){
      ko.utils.arrayForEach(placeList(), function(place){
        place.placeMarker = new google.maps.Marker({
          position: place.pos(),
          map: mapRef,
          title: place.name()
        });
      });
    }
    else {
      alert("Initial places did not load correctly");
    }
  }

function initFourSquare{


}

// our main view model
var ViewModel = function () {
  var self = this;


  placeList = ko.observableArray([]);
  this.query = ko.observable('');
  this.filteredList = ko.observableArray([]);
  this.filter = ko.observable();
  this.mapRef = new Map();

  initialPlaces.forEach(function(placeItem){
    placeList.push( new Place(placeItem));
  }

    );

  this.currentPlace = ko.observable(placeList[0]);

  this.setPlace = function(clickedPlace) {
    self.currentPlace(clickedPlace);
  };

  //Filter list based on text input and add/remove markers from map
  //if map has been initialized
  this.filteredList = ko.computed(function(){
   return placeList().filter(function(place){
    if(!self.filter() || place.name().toLowerCase().indexOf(self.filter().toLowerCase()) !== -1){
      if (mapRef !== null && place.placeMarker.map === null)
        place.placeMarker.setMap(mapRef);
      return place;
    }
    else
      place.placeMarker.setMap(null);
    });
  });


};

// Google maps api error handler
function mapErr() {
  alert("Google Maps failed to load. Try turning it off and back on."
  );
}

ko.applyBindings(new ViewModel());