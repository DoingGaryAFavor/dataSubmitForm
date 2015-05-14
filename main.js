Parse.initialize("aOa7pfDy6GLtckl4cYBEMCnkBW9NyDLZ7ta4FVoI", "jFHEVpzYS5rVlEPJha3N9YK6KP5ifHHy71roi7pl");


function initialize() {
     var input = document.getElementById('searchTextField');
     var autocomplete = new google.maps.places.Autocomplete(input);
     google.maps.event.addListener(autocomplete, 'place_changed', function () {
       var place = autocomplete.getPlace();
       document.getElementById('name').value = place.name;
       document.getElementById('latitude').value = place.geometry.location.lat();
       document.getElementById('longitude').value = place.geometry.location.lng();
       document.getElementById('website').value = place.website;
       document.getElementById('phone-number').value = place.formatted_phone_number;
       document.getElementById('formatted-address').value = place.formatted_address;
       document.getElementById('street-number').value = place.address_components[0].long_name;
       document.getElementById('street-address').value = place.address_components[1].long_name;
       document.getElementById('city').value = place.address_components[2].long_name;
       document.getElementById('state').value = place.address_components[3].short_name;
       document.getElementById('zip-code').value = place.address_components[5].long_name;
     });
}
google.maps.event.addDomListener(window, 'load', initialize); 

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    var Deal = Parse.Object.extend("deals");
    var deal = new Deal();

    var restaurantAvailabilityObject = { 
      sundaySt: document.getElementById('sundaySt').value, sundayEn: document.getElementById('sundayEn').value,
      mondaySt: document.getElementById('mondaySt').value, mondayEn: document.getElementById('mondayEn').value,
      tuesdaySt: document.getElementById('tuesdaySt').value, tuesdayEn: document.getElementById('tuesdayEn').value,
      wednesdaySt: document.getElementById('wednesdaySt').value, wednesdayEn: document.getElementById('wednesdayEn').value,
      thursdaySt: document.getElementById('thursdaySt').value, thursdayEn: document.getElementById('thursdayEn').value,
      fridaySt: document.getElementById('fridaySt').value, fridayEn: document.getElementById('fridayEn').value,
      saturdaySt: document.getElementById('saturdaySt').value, saturdayEn: document.getElementById('saturdayEn').value
    };

    var dealAvailabilityObject = { 
      sundaySt: document.getElementById('sundayDealSt').value, sundayEn: document.getElementById('sundayDealEn').value,
      mondaySt: document.getElementById('mondayDealSt').value, mondayEn: document.getElementById('mondayDealEn').value,
      tuesdaySt: document.getElementById('tuesdayDealSt').value, tuesdayEn: document.getElementById('tuesdayDealEn').value,
      wednesdaySt: document.getElementById('wednesdayDealSt').value, wednesdayEn: document.getElementById('wednesdayDealEn').value,
      thursdaySt: document.getElementById('thursdayDealSt').value, thursdayEn: document.getElementById('thursdayDealEn').value,
      fridaySt: document.getElementById('fridayDealSt').value, fridayEn: document.getElementById('fridayDealEn').value,
      saturdaySt: document.getElementById('saturdayDealSt').value, saturdayEn: document.getElementById('saturdayDealEn').value
    };

    deal.set("title", document.getElementById('deal').value);
    deal.set("description", document.getElementById('deal-description').value);
    deal.set("availability", dealAvailabilityObject);

    deal.save(null, {
      success: function(deal) {
        // Execute any logic that should take place after the object is saved.
        var Restaurant = Parse.Object.extend("restaurants");
        
        var restaurantQuery = new Parse.Query(Restaurant);
        restaurantQuery.equalTo("name", document.getElementById('name').value);
        restaurantQuery.equalTo("streetAddress", document.getElementById('street-address').value)
        restaurantQuery.find({
          success: function(restaurants) {
            if (restaurants.length == 0) {
              // New restaurant.
              var restaurant = new Restaurant();
              restaurant.set("name", document.getElementById('name').value);
              restaurant.set("description", document.getElementById('restaurant-description').value);
              restaurant.set("phoneNumber", document.getElementById('phone-number').value);
              restaurant.set("website", document.getElementById('website').value);
              restaurant.set("streetNumber", document.getElementById('street-number').value);
              restaurant.set("streetAddress", document.getElementById('street-address').value);
              restaurant.set("city", document.getElementById('city').value);
              restaurant.set("zipCode", document.getElementById('zip-code').value);
              restaurant.set("state", document.getElementById('state').value)
              var point = new Parse.GeoPoint({latitude: parseFloat(document.getElementById('latitude').value),
                 longitude: parseFloat(document.getElementById('longitude').value)});
              restaurant.set("location", point);
              restaurant.set("availability", restaurantAvailabilityObject);
              restaurant.set("deals",[{"__type":"Pointer","className":"deals","objectId":deal.id}]);
              restaurant.save(null, {
                success: function(restaurant) {
                  alert("Succesfully created new restaurant and deal")
                },
                error: function(error) {
                  alert("Failed to create restaurant, deal still created. You may need to delete this deal. Error code: " + error.message)
                }
              });
            } else if (restaurants.length == 1) {
              restaurants[0].add("deals",{"__type":"Pointer","className":"deals","objectId":deal.id});
              restaurants[0].save({
                success: function(restaurant) {
                  alert("Succesfully created new deal and added to existing restaurant")
                },
                error: function(error) {
                  alert("Failed to update existing restaurant, deal still created. You may need to delete this deal. Error code: " + error.message)
                }
              });
            } else {
              alert("Multiple restaurants with that name and address found");
            }
          },
          error: function(error) {
            alert("Failed to query the database for that restaurant. Error code: " + error.message)
          }
    });

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