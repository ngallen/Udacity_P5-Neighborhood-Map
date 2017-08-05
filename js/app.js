var initialPlaces = [
{
  name: "The Noshery",
  lat: 39.7872593,
  long: -105.0365347
},
{
  name: "Cozy Cottage",
  lat: 39.7773229,
  long: -105.0539467
},
{
  name: "Denver Biscuit Company",
  lat: 39.7743676,
  long: -105.0465118
},
{
  name: "Revelry Kitchen",
  lat: 39.7692719,
  long: -105.0436237
},
{
  name: "DJ's Berkeley Cafe",
  lat: 39.7701176,
  long: -105.04608
}
];

var mapRef = null;
var placeList = null;
var infoWindow = null;
var currP = ko.observable();

// represent a place item
var Place = function (data) {
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.lat);
  this.long = ko.observable(data.long);
  this.placeMarker = null;
  this.FShours = ko.observable();
  this.FSphone = ko.observable();
  this.FSweb = ko.observable();
  this.FSaddy = ko.observable();
  this.placeClass = ko.observable('inactivePlace');
};

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    mapRef = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.781868, lng: -105.039086},
      zoom: 13
    });

    //creating marker references
    if (placeList !== null){
      ko.utils.arrayForEach(placeList(), function(place){
        //initialize Markers
        place.placeMarker = new google.maps.Marker({
          position: {lat: place.lat(), lng: place.long()},
          map: mapRef,
          title: place.name()
        });
        place.placeMarker.addListener("click", function(){
          setCurrPlace(place);
        });
        //Initialize foursquare info
        foursquareSearch(place);
      });
    }
    else {
      alert("Initial places did not load correctly");
    }

    infoWindow = new google.maps.InfoWindow();
  }

//Uses FourSquare API for additional information requests on a place
function foursquareSearch(place){
  var clientID = "YAE0001NUEJULBK51QTJ1UWYDNT33HY0LCAKOZILV5UTD2S2";
  var clientSecret = "OFKPFOMJCZ4DLNNBADRTOKFCS43WHO2GCBU3KQ4RWY0EJYHN";
  var id = null;
  var hours = null;
  var likes = null;
  var searchURL = "https://api.foursquare.com/v2/venues/search/?" + $.param({
    client_id: clientID,
    client_secret: clientSecret,
    ll: place.lat() + "," + place.long(),
    query: place.name(),
    v: '20161016',
    limit: "5"
  });

  $.ajax(searchURL, {
      dataType: "jsonp",
      success: function(data){
          var venue = data.response.venues[0];
          id = venue.id;
          phone = venue.contact.phone;
          hours = venue.hours;
          address = venue.location.address;
          web = venue.url;

          if(phone !== undefined)
            place.FSphone(venue.contact.phone);
          else
            place.FSphone('Not Available');

          if(address !== undefined)
            place.FSaddy(address);
          else
            place.FSaddy('Not Available');

          if(hours !== undefined)
            place.FShours(hours);
          else
            place.FShours('Not Available');

          if(web !== undefined)
            place.FSweb(web);
          else
            place.FSweb('Not Available');


      },
      error: function(xhr, status, error) {
          alert("Foursquare Search Error: " + status);
      }
  });
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

  //Filter list based on text input
  //add/remove markers from map if map has been initialized
  this.filteredList = ko.computed(function(){
   return placeList().filter(function(place){
    if(!self.filter() || place.name().toLowerCase().indexOf(self.filter().toLowerCase()) !== -1){
      if (mapRef !== null && place.placeMarker.map === null){
        place.placeMarker.setMap(mapRef);
      }
      return place;
    }
    else
      place.placeMarker.setMap(null);
    });
  });

  this.setCurrPlaceCaller = function(clickedPlace) {
    setCurrPlace(clickedPlace);
  };
};

function setCurrPlace(clickedPlace){
    if(mapRef !== null && clickedPlace !== self.currP()){
      if(currP() !== undefined){
        currP().placeMarker.setAnimation(null);
        currP().placeClass('inactivePlace');
      }
      currP(clickedPlace);
      currP().placeMarker.setAnimation(google.maps.Animation.BOUNCE);
      currP().placeClass('activePlace');
      var htmlContent =
      '<div class="infoWin">Name: '+ currP().name()+'</div>'+
      '<div class="infoWin">Foursquare Data:</div>'+
      '<div class="infoWin">Hours: '+currP().FSaddy()+'</div>'+
      '<div class="infoWin">Phone: '+currP().FSphone()+'</div>'+
      '<div class="infoWin">Website: '+currP().FSweb()+'</div>'+
      '<div class="infoWin">Hours: '+currP().FShours()+'</div>';
      infoWindow.setContent(htmlContent);
      infoWindow.open(mapRef, currP().placeMarker);
    }
}

// Google maps api error handler
function mapErr() {
  alert("Google Maps failed to load. Try turning it off and back on."
  );
}

ko.applyBindings(new ViewModel());