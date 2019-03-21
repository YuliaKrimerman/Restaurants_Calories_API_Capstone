'use strict';
// Scroll Function
$('.fill').on('click', function (e) {
    e.preventDefault();
    $('body, html').animate({
        scrollTop: $($(this).attr('href')).offset().top
    }, 600);

});

// Geolocation+Places API

const mapsAPIKey = 'AIzaSyA2pbng72aHFW9jfZ7wmXT8H12MNpTerW8';
const placesApiKey = 'AIzaSyAxMfGvV1kfyC18zfcelASuwJrd9Uzo36U';
const geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?';
const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

let map;
// Function converts location entered in search to lattitude and longitude
function convertLocToLatLong(searchLoc, searchDist) {
    // Creates URL for geocoding a location
    let searchURL = geocodeURL + `address=${encodeURIComponent(searchLoc)}&key=${mapsAPIKey}`;
    fetch(searchURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText)
        })
        .then(responseJSON => {
            // Define variable for object returned from geocode API {lat: num, lng: num}
            let searchCoord = responseJSON.results[0].geometry.location;
            initPlaceMap(searchCoord, searchDist);
            $('.restaurants-before').addClass('hidden');
            $('.restaurants-after').removeClass('hidden');
            $('.map').removeClass('hidden');
            $('#slogan').empty().html(`There you go:`).addClass('after-results');
        })
}

function displayFoodResults(results, status) {
    $('.js-restaurant-results').empty();
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
            $('.js-restaurant-results').append(`
        <li class='restaurant-results'>
          <h5>${results[i].name}</h5>
          <p>${results[i].rating}/5 stars based on ${results[i].user_ratings_total} reviews</p>
        </li>
      `);
            var restaurantMarker = new google.maps.Marker({
                position: results[i].geometry.location,
                map: map
            })
        }
        $('.js-restaurant-results').append(`
        <button for="Page Reload" id="reload" onClick="window.location.reload()">Try Again</button>`);

    } else {
        $('.js-restaurant-results').html(`<p>but, we couldn't find any restaurants! Try increasing your search distance or entering a new location.</p>`)
    }
}

// Loads Map and displays restaurant Results 
function initPlaceMap(searchCoord, searchDist) {
    let searchArea = new google.maps.LatLng(searchCoord.lat, searchCoord.lng);
    map = new google.maps.Map(document.getElementById('map'), {
        center: searchCoord,
        zoom: 10
    });

    // Set required parameters for .nearbySearch method
    var request = {
        location: searchArea,
        radius: searchDist * 1609,
        keyword: 'restaurant'
    };

    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, displayFoodResults)
}






// Listens to submit form event to display results for user
function watchGeo() {
    $('.listFood').submit(event => {
        event.preventDefault();
        let searchLoc = $('.listFood').find('#search-loc').val();
        let searchDist = $('.listFood').find('#max-distance').val();
        console.log(searchLoc, searchDist);
        validateSearchRadius(searchLoc, searchDist);
    })
};

// Validate Search Radius for between 0 and 200 miles
function validateSearchRadius(location, dist) {
    if (dist > 0 && dist <= 200) {
        convertLocToLatLong(location, dist);
    } else {
        alert('Enter a valid search radius between 1 and 200 miles.')
    }
}





//Calories Api
const myId = '36b9ac51';
const myKey = '7a8a7a9d263c994ed5ffc425f2b20dc7';
const mainUrl = 'https://api.edamam.com/api/food-database/parser';

function formatIngridients(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getCalories(searchTerm) {
    const params = {
        ingr: searchTerm,
        app_id: myId,
        app_key: myKey

    };
    const queryString = formatIngridients(params)
    const url = mainUrl + '?' + queryString
    console.log(url)
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function displayResults(responseJson) {

    $('#results-list').empty();
    for (let i = 0; i < responseJson.parsed.length; i++) {
        $('#results-list').append(
            `
      <p>Your ${responseJson.text} is worth ${responseJson.parsed[i].food.nutrients.ENERC_KCAL} calories</p>
    `
        )
    };
    $('#results').removeClass('hiddenCal');
    $('.input-before').addClass('hiddenCal');
};


function watchCal() {
    $('.calories').submit(event => {
        event.preventDefault();
        const searchTerm = $('.js-search-term').val();
        getCalories(searchTerm);
    });
}


$(function () {
    watchCal();
    watchGeo();
});
