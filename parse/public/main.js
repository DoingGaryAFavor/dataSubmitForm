var constants = {
  'Month' : '111111111111',
  'DaysOfMonth' : '0000000000000000000000000000000',
  'WeeksOfMonth' : '11111',
  'DayOfWeek' : '0000000'
}

// appliction id, javascript id
Parse.initialize(
    "zjbuJvWrvzgdpDvRnHejLD008hLGf6zHua5nCGvq",
    "ypRtibx0ApTEOeqmKo5EQqCpnfiSS9qFdokfWGyD");

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

/*
function showHide(control) {
  if (document.getElementById('categorical').checked)
    document.getElementById('categoricalItem').style.visibility = 'visible';
  else
    document.getElementById('categoricalItem').style.visibility = 'hidden';
}*/

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    var Deal = Parse.Object.extend("deals");
    var deal = new Deal();

    var Restaurant = Parse.Object.extend("restaurants");
    var restaurantQuery = new Parse.Query(Restaurant);

    /*
    var restaurantAvailabilityObject = { 
      sundaySt: document.getElementById('sundaySt').value, sundayEn: document.getElementById('sundayEn').value,
      mondaySt: document.getElementById('mondaySt').value, mondayEn: document.getElementById('mondayEn').value,
      tuesdaySt: document.getElementById('tuesdaySt').value, tuesdayEn: document.getElementById('tuesdayEn').value,
      wednesdaySt: document.getElementById('wednesdaySt').value, wednesdayEn: document.getElementById('wednesdayEn').value,
      thursdaySt: document.getElementById('thursdaySt').value, thursdayEn: document.getElementById('thursdayEn').value,
      fridaySt: document.getElementById('fridaySt').value, fridayEn: document.getElementById('fridayEn').value,
      saturdaySt: document.getElementById('saturdaySt').value, saturdayEn: document.getElementById('saturdayEn').value
    };*/

    var vegan = document.getElementById('vegan');
    var veganValue = false;
    if (vegan.checked)
      veganValue = true;

    var vegetarian = document.getElementById('vegetarian');
    var vegetarianValue = false;
    if (vegetarian.checked)
      vegetarianValue = true;

    var glutenFree = document.getElementById('glutenFree');
    var glutenFreeValue = false;
    if (glutenFree.checked)
      glutenFreeValue = true;

    var alochol = document.getElementById('alcohol');
    var alcoholValue = false;
    if (alcohol.checked)
      alcoholValue = true;

    var checkboxes = document.getElementsByName('dealtype');
    var checkboxesChecked = [];

    for (var i = 0; i<checkboxes.length; i++) {
     if (checkboxes[i].checked)
        checkboxesChecked.push(checkboxes[i].value);
    }

    var restaurantDays1CheckBoxes = document.getElementsByName('restaurantDays1');
    var restaurantDays1Checked = [];
    var daysOfWeekBitValue = 0;
    var day = 64;

    for (var i = 0; i<restaurantDays1CheckBoxes.length; i++) {
      if (restaurantDays1CheckBoxes[i].checked)
        daysOfWeekBitValue = daysOfWeekBitValue | day;
      day = day >> 1;
    }

    var daysOfWeekBitValuePad = pad(daysOfWeekBitValue.toString(2), 7);
    var restaurantRecurrence1Value = constants.Month.concat(constants.DaysOfMonth).concat(constants.WeeksOfMonth).concat(daysOfWeekBitValuePad);

    var restaurantDays2CheckBoxes = document.getElementsByName('restaurantDays2');
    var restaurantDays2Checked = [];
    var daysOfWeekBitValue2 = 0;
    var day2 = 64;

    for (var i = 0; i<restaurantDays2CheckBoxes.length; i++) {
      if (restaurantDays2CheckBoxes[i].checked)
        daysOfWeekBitValue2 = daysOfWeekBitValue2 | day2;
      day2 = day2 >> 1;
    }

    if (daysOfWeekBitValue2 == 0)
      var restaurantRecurrence2Value = null;
    else {
      var daysOfWeekBitValue2Pad = pad(daysOfWeekBitValue2.toString(2), 7);
      var restaurantRecurrence2Value = constants.Month.concat(constants.DaysOfMonth).concat(constants.WeeksOfMonth).concat(daysOfWeekBitValue2Pad);
    }

    var dealDays1CheckBoxes = document.getElementsByName('dealDays1');
    var dealDays1Checked = [];
    var dealDaysOfWeekBitValue = 0;
    var day = 64;

    for (var i = 0; i<dealDays1CheckBoxes.length; i++) {
      if (dealDays1CheckBoxes[i].checked)
        dealDaysOfWeekBitValue = dealDaysOfWeekBitValue | day;
      day = day >> 1;
    }

    var dealDaysOfWeekBitValuePad = pad(dealDaysOfWeekBitValue.toString(2), 7);
    var dealRecurrence1Value = constants.Month.concat(constants.DaysOfMonth).concat(constants.WeeksOfMonth).concat(dealDaysOfWeekBitValuePad);

    var dealDays2CheckBoxes = document.getElementsByName('dealDays2');
    var dealDays2Checked = [];
    var dealDaysOfWeekBitValue2 = 0;
    var day = 64;

    for (var i = 0; i<dealDays2CheckBoxes.length; i++) {
      if (dealDays2CheckBoxes[i].checked)
        dealDaysOfWeekBitValue2 = dealDaysOfWeekBitValue2 | day;
      day2 = day2 >> 1;
    }

    if (dealDaysOfWeekBitValue2 == 0)
      var dealRecurrence2Value = null;
    else {
      var dealDaysOfWeekBitValue2Pad = pad(dealDaysOfWeekBitValue2.toString(2), 7);
      var dealRecurrence2Value = constants.Month.concat(constants.DaysOfMonth).concat(constants.WeeksOfMonth).concat(dealDaysOfWeekBitValue2Pad);
    }

    function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function parseTimeValue(elementId) {
      var elementValue = document.getElementById(elementId).value)
      var time
      if (elementValue != "") {
        return parseInt(elementValue)
      } else {
        return null
      }
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
    deal.set("vegan", veganValue);
    deal.set("vegetarian", vegetarianValue);
    deal.set("glutenFree", glutenFreeValue);
    deal.set("submittedBy", toTitleCase(document.getElementById('submittedBy').value));
    deal.set("downVotes", 0);
    deal.set("upVotes", 0);
    deal.set("rating", 0);
    deal.set("flags", 0);
    deal.set("recurrence1", dealRecurrence1Value);
    deal.set("firstOpenTime1", parseTimeValue('dealFirstOpen1'));
    deal.set("lastOpenTime1", parseTimeValue('dealLastOpen1'));
    deal.set("firstCloseTime1", parseTimeValue('dealFirstClose1'));
    deal.set("lastCloseTime1", parseTimeValue('dealLastClose1'));
    deal.set("recurrence2", dealRecurrence2Value);
    deal.set("firstOpenTime2", parseTimeValue('dealFirstOpen2'));
    deal.set("lastOpenTime2", parseTimeValue('dealLastOpen2'));
    deal.set("firstCloseTime2", parseTimeValue('dealFirstClose2'));
    deal.set("lastCloseTime2", parseTimeValue('dealLastClose2'));
    /*deal.set("sundaySt", parseInt(document.getElementById('sundayDealSt').value));
    deal.set("sundayEn", parseInt(document.getElementById('sundayDealEn').value));
    deal.set("mondaySt", parseInt(document.getElementById('mondayDealSt').value));
    deal.set("mondayEn", parseInt(document.getElementById('mondayDealEn').value));
    deal.set("tuesdaySt", parseInt(document.getElementById('tuesdayDealSt').value));
    deal.set("tuesdayEn", parseInt(document.getElementById('tuesdayDealEn').value));
    deal.set("wednesdaySt", parseInt(document.getElementById('wednesdayDealSt').value));
    deal.set("wednesdayEn", parseInt(document.getElementById('wednesdayDealEn').value));
    deal.set("thursdaySt", parseInt(document.getElementById('thursdayDealSt').value));
    deal.set("thursdayEn", parseInt(document.getElementById('thursdayDealEn').value));
    deal.set("fridaySt", parseInt(document.getElementById('fridayDealSt').value));
    deal.set("fridayEn", parseInt(document.getElementById('fridayDealEn').value));
    deal.set("saturdaySt", parseInt(document.getElementById('saturdayDealSt').value));
    deal.set("saturdayEn", parseInt(document.getElementById('saturdayDealEn').value));*/
    var point = new Parse.GeoPoint({latitude: parseFloat(document.getElementById('restaurantLatitude').value),
                 longitude: parseFloat(document.getElementById('restaurantLongitude').value)});

    deal.save(null, {
      success: function(deal) {
        // Execute any logic that should take place after the object is saved.

        restaurantQuery.equalTo("name", document.getElementById('restaurantName').value);
        restaurantQuery.equalTo("streetAddress", document.getElementById('restaurantStreetAddress').value)
        restaurantQuery.find({
          success: function(restaurants) {
            if (restaurants.length ==  0) {
              var restaurant = new Restaurant();
              // New restaurant.
              restaurant.set("name", document.getElementById('restaurantName').value);
              restaurant.set("phoneNumber", document.getElementById('restaurantPhoneNumber').value);
              restaurant.set("website", document.getElementById('restaurantWebsite').value);
              restaurant.set("location", point);
              restaurant.set("streetNumber", document.getElementById('restaurantStreetNumber').value);
              restaurant.set("streetAddress", document.getElementById('restaurantStreetAddress').value);
              restaurant.set("city", document.getElementById('restaurantCity').value);
              restaurant.set("state", document.getElementById('restaurantState').value)
              restaurant.set("zipCode", document.getElementById('restaurantZipCode').value);
              // restaurant.set("availability", restaurantAvailabilityObject);
              restaurant.set("twentyOnePlus", alcoholValue);
              restaurant.set("recurrence1", restaurantRecurrence1Value);
              restaurant.set("firstOpenTime1", parseTimeValue('restaurantFirstOpen1'));
              restaurant.set("lastOpenTime1", parseTimeValue('restaurantLastOpen1'));
              restaurant.set("firstCloseTime1", parseTimeValue('restaurantFirstClose1'));
              restaurant.set("lastCloseTime1", parseTimeValue('restaurantLastClose1'));
              restaurant.set("recurrence2", restaurantRecurrence2Value);
              restaurant.set("firstOpenTime2", parseTimeValue('restaurantFirstOpen2'));
              restaurant.set("lastOpenTime2", parseTimeValue('restaurantLastOpen2'));
              restaurant.set("firstCloseTime2", parseTimeValue('restaurantFirstClose2'));
              restaurant.set("lastCloseTime2", parseTimeValue('restaurantLastClose2'));
              restaurant.set("submittedBy", toTitleCase(document.getElementById('submittedBy').value));
              deal.set("restaurantId", restaurant);
              deal.save(null, {
                success: function(deal){ },
                error: function(deal){ }
              });
              restaurant.save(null, {
                success: function(restaurant) {
                  alert("Succesfully created new restaurant and deal")
                },
                error: function(error) {
                  alert("Failed to create restaurant, deal still created. You may need to delete this deal. Error code: " + error.message)
                }
              });
            } else if (restaurants.length ==  1) {
              deal.set("restaurantId", restaurants[0]);
              deal.save(null, {
                success: function(deal){ },
                error: function(deal){ }
              });
              var restaurantId = restaurants[0].id;
              restaurants[0].save({
                success: function(restaurant) {
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