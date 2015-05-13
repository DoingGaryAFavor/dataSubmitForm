Parse.initialize("aOa7pfDy6GLtckl4cYBEMCnkBW9NyDLZ7ta4FVoI", "jFHEVpzYS5rVlEPJha3N9YK6KP5ifHHy71roi7pl");


function initialize() {
     var input = document.getElementById('searchTextField');
     var autocomplete = new google.maps.places.Autocomplete(input);
     google.maps.event.addListener(autocomplete, 'place_changed', function () {
     var place = autocomplete.getPlace();
     document.getElementById('city2').value = place.name;
     document.getElementById('latitude').value = place.geometry.location.lat();
     document.getElementById('longitude').value = place.geometry.location.lng();
     document.getElementById('website').value = place.website;
     document.getElementById('phone-number').value = place.formatted_phone_number;
     document.getElementById('formatted-address').value = place.formatted_address;
     });
}
google.maps.event.addDomListener(window, 'load', initialize); 

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    var Restaurant = Parse.Object.extend("restaurants");
    var restaurant = new Restaurant();
    var restaurantQuery = new Parse.Query(Restaurant);

    restaurant.set("name", document.getElementById('city2').value);
    restaurant.set("description", document.getElementById('restaurant-description').value);
    restaurant.set("phoneNumber", document.getElementById('phone-number').value);
    restaurant.set("website", document.getElementById('website').value);
    restaurant.set("streetNumber", document.getElementById('street-number').value);
    restaurant.set("streetAddress", document.getElementById('street-address').value);
    restaurant.set("city", document.getElementById('city').value);
    restaurant.set("zipCode", document.getElementById('zip-code').value);

    restaurantQuery.notEqualTo("name", restaurant.name);
    restaurantQuery.find({
      success: function(restaurant) {
        alert('Adding restaurant object with objectID: ' + restaurant.id);;
        // Do something with the returned Parse.Object values
        for (var i = 0; i < results.length; i++) { 
          var object = results[i];
          alert(object.id + ' - ' + object.get('playerName'));
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
   /*restaurant.save(null, {
      success: function(restaurant) {
         alert('New restaurant object created with objectID: ' + restaurant.id);
      },
      error: function(restaurant, error) {
         alert('Failed to create new restaurant object, with error: ' + error.message);
      }
   });*/

    var Deal = Parse.Object.extend("deals");
    var deal = new Deal();

    deal.set("title", document.getElementById('deal').value);
    deal.set("description", document.getElementById('deal-description').value);
    var point = new Parse.GeoPoint({latitude: parseFloat(document.getElementById('latitude').value),
       longitude: parseFloat(document.getElementById('longitude').value)});
    deal.set("locations", point);
    deal.set("restaurantId", restaurant);

    deal.save(null, {
      success: function(deal) {
        // Execute any logic that should take place after the object is saved.
        alert('New deal object created with objectId: ' + deal.id);
      },
      error: function(deal, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        alert('Failed to create new deal object, with error code: ' + error.message);
      }
    });

   return false;
}

var myForm = document.getElementById('my-form');
if (myForm.attachEvent) {
    myForm.attachEvent("submit", processForm);
} else {
    myForm.addEventListener("submit", processForm);
}