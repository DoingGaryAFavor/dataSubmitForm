var constants = {
  'Month' : '111111111111',
  'DaysOfMonth' : '0000000000000000000000000000000',
  'WeeksOfMonth' : '11111',
  'DayOfWeek' : '0000000',
  'NullTime' : '4095'
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

    var restaurantFirstOpen1 = parseInt(document.getElementById('restaurantFirstOpen1').value).toString(2);
    var restaurantFirstOpen1LeadingZeroes = pad(restaurantFirstOpen1, 12);
    if (document.getElementById('restaurantLastOpen1').value == "")
      var restaurantLastOpen1 = parseInt(constants.NullTime).toString(2);
    else
      var restaurantLastOpen1 = parseInt(document.getElementById('restaurantLastOpen1').value).toString(2);
    var restaurantLastOpen1LeadingZeroes = pad(restaurantLastOpen1, 12);
    var openTime1 = restaurantLastOpen1LeadingZeroes.concat(restaurantFirstOpen1LeadingZeroes);
    if (document.getElementById('restaurantLastOpen1').value == "" && document.getElementById('restaurantFirstOpen1').value == "")
      var openTime1Value = null;
    else
      var openTime1Value = parseInt(openTime1, 2);

    if (document.getElementById('restaurantFirstClose1').value == "")
      var restaurantFirstClose1 = parseInt(constants.NullTime).toString(2);
    else
      var restaurantFirstClose1 = parseInt(document.getElementById('restaurantFirstClose1').value).toString(2);
    var restaurantFirstClose1LeadingZeroes = pad(restaurantFirstClose1, 12);
    var restaurantLastClose1 = parseInt(document.getElementById('restaurantLastClose1').value).toString(2);
    var restaurantLastClose1LeadingZeroes = pad(restaurantLastClose1, 12);
    var closeTime1 = restaurantLastClose1LeadingZeroes.concat(restaurantFirstClose1LeadingZeroes);
    if (document.getElementById('restaurantFirstClose1').value == "" && document.getElementById('restaurantLastClose1').value == "")
      var closeTime1Value = null;
    else
      var closeTime1Value = parseInt(closeTime1, 2);

    var restaurantFirstOpen2 = parseInt(document.getElementById('restaurantFirstOpen2').value).toString(2);
    var restaurantFirstOpen2LeadingZeroes = pad(restaurantFirstOpen2, 12);
    if (document.getElementById('restaurantLastOpen2').value == "")
      var restaurantLastOpen2 = parseInt(constants.NullTime).toString(2);
    else
      var restaurantLastOpen2 = parseInt(document.getElementById('restaurantLastOpen2').value).toString(2);
    var restaurantLastOpen2LeadingZeroes = pad(restaurantLastOpen2, 12);
    var openTime2 = restaurantLastOpen2LeadingZeroes.concat(restaurantFirstOpen2LeadingZeroes);
    if (document.getElementById('restaurantLastOpen2').value == "" && document.getElementById('restaurantFirstOpen2').value == "")
      var openTime2Value = null;
    else
      var openTime2Value = parseInt(openTime2, 2);

    if (document.getElementById('restaurantFirstClose2').value == "")
      var restaurantFirstClose2 = parseInt(constants.NullTime).toString(2);
    else
      var restaurantFirstClose2 = parseInt(document.getElementById('restaurantFirstClose2').value).toString(2);
    var restaurantFirstClose2LeadingZeroes = pad(restaurantFirstClose2, 12);
    var restaurantLastClose2 = parseInt(document.getElementById('restaurantLastClose2').value).toString(2);
    var restaurantLastClose2LeadingZeroes = pad(restaurantLastClose2, 12);
    var closeTime2 = restaurantLastClose2LeadingZeroes.concat(restaurantFirstClose2LeadingZeroes);
    if (document.getElementById('restaurantFirstClose2').value == "" && document.getElementById('restaurantLastClose2').value == "")
      var closeTime2Value = null;
    else
      var closeTime2Value = parseInt(closeTime2, 2);

    var dealFirstOpen1 = parseInt(document.getElementById('dealFirstOpen1').value).toString(2);
    var dealFirstOpen1LeadingZeroes = pad(dealFirstOpen1, 12);
    if (document.getElementById('dealLastOpen1').value == "")
      var dealLastOpen1 = parseInt(constants.NullTime).toString(2);
    else
      var dealLastOpen1 = parseInt(document.getElementById('dealLastOpen1').value).toString(2);
    var dealLastOpen1LeadingZeroes = pad(dealLastOpen1, 12);
    var dealOpenTime1 = dealLastOpen1LeadingZeroes.concat(dealFirstOpen1LeadingZeroes);
    if (document.getElementById('dealLastOpen1').value == "" && document.getElementById('dealFirstOpen1').value == "")
      var dealOpenTime1Value = null;
    else
      var dealOpenTime1Value = parseInt(dealOpenTime1, 2);

    if (document.getElementById('dealFirstClose1').value == "")
      var dealFirstClose1 = parseInt(constants.NullTime).toString(2);
    else
      var dealFirstClose1 = parseInt(document.getElementById('dealFirstClose1').value).toString(2);
    var dealFirstClose1LeadingZeroes = pad(dealFirstClose1, 12);
    var dealLastClose1 = parseInt(document.getElementById('dealLastClose1').value).toString(2);
    var dealLastClose1LeadingZeroes = pad(dealLastClose1, 12);
    var dealCloseTime1 = dealLastClose1LeadingZeroes.concat(dealFirstClose1LeadingZeroes);
    if (document.getElementById('dealLastClose1').value == "" && document.getElementById('dealFirstClose1').value == "")
      var dealCloseTime1Value = null;
    else
      var dealCloseTime1Value = parseInt(dealCloseTime1, 2);

    var dealFirstOpen2 = parseInt(document.getElementById('dealFirstOpen2').value).toString(2);
    var dealFirstOpen2LeadingZeroes = pad(dealFirstOpen2, 12);
    if (document.getElementById('dealLastOpen2').value == "")
      var dealLastOpen2 = parseInt(constants.NullTime).toString(2);
    else
      var dealLastOpen2 = parseInt(document.getElementById('dealLastOpen2').value).toString(2);
    var dealLastOpen2LeadingZeroes = pad(dealLastOpen2, 12);
    var dealOpenTime2 = dealLastOpen2LeadingZeroes.concat(dealFirstOpen2LeadingZeroes);
    if (document.getElementById('dealLastOpen2').value == "" && document.getElementById('dealFirstOpen2').value == "")
      var dealOpenTime2Value = null;
    else
      var dealOpenTime2Value = parseInt(dealOpenTime2, 2);

    if (document.getElementById('dealFirstClose2').value == "")
      var dealFirstClose2 = parseInt(constants.NullTime).toString(2);
    else
      var dealFirstClose2 = parseInt(document.getElementById('dealFirstClose2').value).toString(2);
    var dealFirstClose2LeadingZeroes = pad(dealFirstClose2, 12);
    var dealLastClose2 = parseInt(document.getElementById('dealLastClose2').value).toString(2);
    var dealLastClose2LeadingZeroes = pad(dealLastClose2, 12);
    var dealCloseTime2 = dealLastClose2LeadingZeroes.concat(dealFirstClose2LeadingZeroes);
    if (document.getElementById('dealLastClose2').value == "" && document.getElementById('dealFirstClose2').value == "")
      var dealCloseTime2Value = null;
    else
      var dealCloseTime2Value = parseInt(dealCloseTime2, 2);

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
    deal.set("openTime1", dealOpenTime1Value);
    deal.set("closeTime1", dealCloseTime1Value);
    deal.set("recurrence2", dealRecurrence2Value);
    deal.set("openTime2", dealOpenTime2Value);
    deal.set("closeTime2", dealCloseTime2Value);
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
              restaurant.set("openTime1", openTime1Value);
              restaurant.set("closeTime1", closeTime1Value);
              restaurant.set("recurrence2", restaurantRecurrence2Value);
              restaurant.set("openTime2", openTime2Value);
              restaurant.set("closeTime2", closeTime2Value);
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