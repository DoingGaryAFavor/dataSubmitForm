// appliction id, javascript id
Parse.initialize(
    "zjbuJvWrvzgdpDvRnHejLD008hLGf6zHua5nCGvq",
    "ypRtibx0ApTEOeqmKo5EQqCpnfiSS9qFdokfWGyD");

var constants = {
  'Month' : '111111111111',
  'DaysOfMonth' : '0000000000000000000000000000000',
  'WeeksOfMonth' : '11111',
  'DayOfWeek' : '0000000'
}

function initialize() {
     var input = document.getElementById('searchTextField');
     var autocomplete = new google.maps.places.Autocomplete(input);
     google.maps.event.addListener(autocomplete, 'place_changed', function () {
       var place = autocomplete.getPlace();
       document.getElementById('restaurantName').value = place.name;
       document.getElementById('restaurantLatitude').value = place.geometry.location.lat();
       document.getElementById('restaurantLongitude').value = place.geometry.location.lng();
       document.getElementById('restaurantWebsite').value = place.website;
       document.getElementById('restaurantPhoneNumber').value = place.formatted_phone_number;
       document.getElementById('restaurantAddress').value = place.formatted_address;
       document.getElementById('restaurantStreetNumber').value = place.address_components[0].long_name;
       document.getElementById('restaurantStreetAddress').value = place.address_components[1].long_name;
       document.getElementById('restaurantCity').value = place.address_components[2].long_name;
       document.getElementById('restaurantState').value = place.address_components[3].short_name;
       document.getElementById('restaurantZipCode').value = place.address_components[5].long_name;
     });
}
google.maps.event.addDomListener(window, 'load', initialize); 

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    var Deal = Parse.Object.extend("deals");
    var deal = new Deal();
    var dealQuery = new Parse.Query(Deal);

    var Restaurant = Parse.Object.extend("restaurants");
    var restaurantQuery = new Parse.Query(Restaurant);

    var Neighborhood = Parse.Object.extend("neighborhoods");
    var neighborhoodQuery = new Parse.Query(Neighborhood);

    function check(elementId) {
      element = document.getElementById(elementId);
      if (element.checked) return true;
      else return false;
    }

    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function parseTimeValue(elementId) {
      var elementValue = document.getElementById(elementId).value;
      if (elementValue != "") return parseInt(elementValue)
      else return null
    }

    function recurrence(elementId) {
      var checkBoxes = document.getElementsByName(elementId);
      var checked = [];
      var daysOfWeekBitValue = 0;
      var day = 64;

      for (var i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) daysOfWeekBitValue = daysOfWeekBitValue | day;
        day = day >> 1;
      }

      if (daysOfWeekBitValue == 0) var recurrenceValue = null;
      else {
        var daysOfWeekBitValuePad = pad(daysOfWeekBitValue.toString(2), 7);
        var recurrenceValue = constants.Month.concat(constants.DaysOfMonth).concat(constants.WeeksOfMonth).concat(daysOfWeekBitValuePad);
      }
      return recurrenceValue;
    }

    var checkboxes = document.getElementsByName('dealtype');
    var checkboxesChecked = [];

    for (var i = 0; i<checkboxes.length; i++) {
     if (checkboxes[i].checked)
        checkboxesChecked.push(checkboxes[i].value);
    }

    var dealTagArrayLowerCase = checkboxesChecked.toString().toLowerCase();
    var dealTagArraySplit = dealTagArrayLowerCase.toString().split(",");
    var dealTagArrayTrim = dealTagArraySplit.map(Function.prototype.call, String.prototype.trim);

    var customDealTagArray = document.getElementById('dealType3').value;
    var customDealTagArraySplit = customDealTagArray.toString().toLowerCase().split(",");
    var customDealTagArrayTrim = customDealTagArraySplit.map(Function.prototype.call, String.prototype.trim);

    if (customDealTagArray ==  "") {
      var concatDealTagArrayTrim = dealTagArrayTrim;
    } else {
      var dealTagArray = customDealTagArrayTrim + ',' + dealTagArrayTrim;
      var concatDealTagArray = dealTagArray.toString().split(",");
      var concatDealTagArrayTrim = concatDealTagArray.map(Function.prototype.call, String.prototype.trim);
    }

    dealQuery.equalTo("item", document.getElementById('dealItem').value);
    dealQuery.equalTo("reducedPrice", parseFloat(document.getElementById('dealPrice').value));
    dealQuery.equalTo("firstOpenTime1", parseTimeValue('dealFirstOpen1'));
    dealQuery.equalTo("firstCloseTime1", parseTimeValue('dealFirstClose1'));
    dealQuery.equalTo("lastOpenTime1", parseTimeValue('dealLastOpen1'));
    dealQuery.equalTo("lastCloseTime1", parseTimeValue('dealLastClose1'));
    dealQuery.equalTo("firstOpenTime2", parseTimeValue('dealFirstOpen2'));
    dealQuery.equalTo("firstCloseTime2", parseTimeValue('dealFirstClose2'));
    dealQuery.equalTo("lastOpenTime2", parseTimeValue('dealLastOpen2'));
    dealQuery.equalTo("lastCloseTime2", parseTimeValue('dealLastClose2'));
    dealQuery.find({
      success: function(deals) {
        if (deals.length == 0) {
          var dealItem = toTitleCase(document.getElementById('dealItem').value.toString());
          deal.set("item", dealItem);
          var categoricalItem = toTitleCase(document.getElementById('categoricalItem').value.toString());
          deal.set("category", categoricalItem);
          var dealPrimaryTag = toTitleCase(document.getElementById('dealPrimaryTag').value.toString());;
          deal.set("primaryTag", dealPrimaryTag);
          deal.set("fineprint", toTitleCase(document.getElementById('dealFinePrint').value));
          deal.set("reducedPrice", parseFloat(document.getElementById('dealPrice').value));
          deal.set("amountOff", parseFloat(document.getElementById('dealAmountOff').value));
          deal.set("percentOff", parseFloat(document.getElementById('dealPercentOff').value));
          deal.set("tags", concatDealTagArrayTrim);
          deal.set("vegan", check('vegan'));
          deal.set("vegetarian", check('vegetarian'));
          deal.set("glutenFree", check('glutenFree'));
          deal.set("submittedBy", toTitleCase(document.getElementById('submittedBy').value));
          deal.set("downVotes", 0);
          deal.set("upVotes", 0);
          deal.set("rating", 0);
          deal.set("flags", 0);
          deal.set("recurrence1", recurrence('dealDays1'));
          deal.set("firstOpenTime1", parseTimeValue('dealFirstOpen1'));
          deal.set("lastOpenTime1", parseTimeValue('dealLastOpen1'));
          deal.set("firstCloseTime1", parseTimeValue('dealFirstClose1'));
          deal.set("lastCloseTime1", parseTimeValue('dealLastClose1'));
          deal.set("recurrence2", recurrence('dealDays2'));
          deal.set("firstOpenTime2", parseTimeValue('dealFirstOpen2'));
          deal.set("lastOpenTime2", parseTimeValue('dealLastOpen2'));
          deal.set("firstCloseTime2", parseTimeValue('dealFirstClose2'));
          deal.set("lastCloseTime2", parseTimeValue('dealLastClose2'));
          var point = new Parse.GeoPoint({latitude: parseFloat(document.getElementById('restaurantLatitude').value),
                       longitude: parseFloat(document.getElementById('restaurantLongitude').value)});
          deal.save(null, {
            success: function(deals) {
              restaurantQuery.equalTo("name", document.getElementById('restaurantName').value);
              restaurantQuery.equalTo("streetAddress", document.getElementById('restaurantStreetAddress').value);
              restaurantQuery.find({
                success: function(restaurants) {
                  if (restaurants.length ==  0) {
                    var restaurant = new Restaurant();
                    restaurant.set("name", document.getElementById('restaurantName').value);
                    restaurant.set("phoneNumber", document.getElementById('restaurantPhoneNumber').value);
                    restaurant.set("website", document.getElementById('restaurantWebsite').value);
                    restaurant.set("location", point);
                    restaurant.set("streetNumber", document.getElementById('restaurantStreetNumber').value);
                    restaurant.set("streetAddress", document.getElementById('restaurantStreetAddress').value);
                    restaurant.set("city", document.getElementById('restaurantCity').value);
                    restaurant.set("state", document.getElementById('restaurantState').value)
                    restaurant.set("zipCode", document.getElementById('restaurantZipCode').value);
                    restaurant.set("twentyOnePlus", check('alcohol'));
                    restaurant.set("recurrence1", recurrence('restaurantDays1'));
                    restaurant.set("firstOpenTime1", parseTimeValue('restaurantFirstOpen1'));
                    restaurant.set("lastOpenTime1", parseTimeValue('restaurantLastOpen1'));
                    restaurant.set("firstCloseTime1", parseTimeValue('restaurantFirstClose1'));
                    restaurant.set("lastCloseTime1", parseTimeValue('restaurantLastClose1'));
                    restaurant.set("recurrence2", recurrence('restaurantDays2'));
                    restaurant.set("firstOpenTime2", parseTimeValue('restaurantFirstOpen2'));
                    restaurant.set("lastOpenTime2", parseTimeValue('restaurantLastOpen2'));
                    restaurant.set("firstCloseTime2", parseTimeValue('restaurantFirstClose2'));
                    restaurant.set("lastCloseTime2", parseTimeValue('restaurantLastClose2'));
                    restaurant.set("submittedBy", toTitleCase(document.getElementById('submittedBy').value));
                    deal.set("restaurantId", restaurant);
                    deal.save(null, {
                      success: function(deals){ },
                      error: function(error){ }
                    });
                    restaurant.save(null, {
                      success: function(restaurants) {
                        neighborhoodQuery.equalTo("areaName", document.getElementById('restaurantCity').value);
                        neighborhoodQuery.find({
                          success: function(neighborhoods) {
                            if (neighborhoods.length == 0) {
                              var neighborhood = new Neighborhood();
                              neighborhood.set("areaName", document.getElementById('restaurantCity').value);
                              neighborhood.addUnique("zipCodes", document.getElementById('restaurantZipCode').value);
                              neighborhood.save(null, {
                                success: function(neighborhoods) { },
                                error: function(error) { }
                              });
                              restaurant.set("neighborhoodId", neighborhood);
                              restaurant.save(null, {
                                success: function(restaurants){ },
                                error: function(error) { }
                              });
                            } else if (neighborhoods.length == 1) {
                              // neighborhoodQuery.containedIn("")
                              // if (neighborhoods.get("zipCodes").indexOf(document.getElementById('restaurantZipCode').value == -1)) {
                              // neighborhoods.set("zipCodes", document.getElementById('restaurantZipCode').value);
                              // }
                              // neighborhoods.save(null, {
                              //   success: function(neighborhoods) { },
                              //   error: function(error) { }
                              // });
                              // restaurant.set("neighborhoodId", neighborhoods[0]);
                              // restaurant.save(null, {
                              //   success: function(restaurants){ },
                              //   error: function(error){ }
                              // });
                              // var neighborhoodId = neighborhoods[0].id;
                              // neighborhoods[0].save({
                              //   success: function(neighborhoods){ },
                              //   error: function(error){ }
                              // });
                            }
                          },
                          error: function(error) {
                            alert("Failed to query the database for that neighborhood. Error code: " + error.message);
                          }
                        });
                        alert("Succesfully created new restaurant and deal");
                      },
                      error: function(error) {
                        alert("Failed to create restaurant, deal still created. You may need to delete this deal. Error code: " + error.message);
                      }
                    });
                  } else if (restaurants.length ==  1) {
                    deal.set("restaurantId", restaurants[0]);
                    deal.save(null, {
                      success: function(deal){ },
                      error: function(error){ }
                    });
                    var restaurantId = restaurants[0].id;
                    restaurants[0].save({
                      success: function(restaurants) {
                        alert("Succesfully created new deal and added to existing restaurant. WARNING: DEAL COULD BE DUPLICATE, PLEASE VERIFY IN DATABASE!")
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
              alert("Failed to create new deal object, with error code: " + error.message);
            }
          });
        }
        else if (deals.length == 1) {
          alert("Deal already exists, duplicate deal not added");
        }
      },
      error: function(error) {
        alert("Failed to query the database for deals. Error code: " + error.message);
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