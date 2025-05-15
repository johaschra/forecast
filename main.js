/* Wind & Wetter Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], 5);

// thematische Layer
let overlays = {
    forecast: L.featureGroup().addTo(map),
    wind: L.featureGroup().addTo(map)
}

// Layer Control
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery").addTo(map)
}, {
    "Wettervorhersage MET Norway": overlays.forecast,
    "ECMWF Windvorhersage": overlays.wind,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Ortname von latlong über  OpenStreetMap reverse geocoging erstellen
async function getPlaceName(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    
    return jsondata.display_name;
}



// MET NOrway Vorhersage visualisieren
async function showForecast(latlng) {
    
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latlng.lat}&lon=${latlng.lng}`;
    let response = await fetch(url);
    let jsondata = await response.json();
    console.log(jsondata);
    let details  = jsondata.properties.timeseries[0].data.instant.details;
    let timestamp = new Date(jsondata.properties.meta.updated_at);
    //Popup erzeugen
    let markup = `
    <ul>
    Vorhersage für ${timestamp.toLocaleString()} Uhr
        <li>Luftdruck (hPa): ${details.air_pressure_at_sea_level}</li>
        <li>Lufttemperature (°C): ${details.air_temperature}</li>
        <li>Bewölkungsgrad (%): ${details.cloud_area_fraction}</li>
        <li>Luftfeuchtigkeit: ${details.relative_humidity}</li>
        <li>Windrichtung (°): ${details.wind_from_direction}</li>
        <li>Windgeschwindigkeit (km/h): ${details.wind_speed*3.6}</li>
    </ul>`;

    
    //Wettericons für die nächten 24 stunden in 3 stunden schritten
    for (let i=0; i<=24; i+=3) {
        let symbol = jsondata.properties.timeseries[i].data.next_1_hours.summary.symbol_code
        console.log(symbol);
        let time = new Date(jsondata.properties.timeseries[i].time);
        markup += `<img src= "icons/${symbol}.svg" style="width: 32px; height: 32px;" title = "${time.toLocaleString(time)}">`;
    }
    

    L.popup([
        latlng.lat, latlng.lng 
    ], {
        content: markup
    }).openOn(overlays.forecast);
}

// auf Kartenklick reagieren
map.on("click", function(evt) {    
    showForecast(evt.latlng);
})

// Klick auf Innsbruck simulieren
map.fire("click", {latlng: {lat: ibk.lat, lng: ibk.lng,}})