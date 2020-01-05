// Instantiate the map
const map = L.map('map').setView([0, 0], 2);

// Adding the tiles to the map
// OpenStreetMap (tiles provider) : https://www.openstreetmap.org/
const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileURL, { attribution });
tiles.addTo(map);

async function mapData(data) {
    data.forEach(item => {
        const { latitude, longitude, weatherData, aqData } = item;
        const timezone = weatherData.timezone.split('/')[1];
        const summary = weatherData.currently.summary.toLowerCase();
        const temperature = weatherData.currently.temperature;

        if (aqData.length > 0) {
            const measurement = aqData[0].measurements[0];
            const { value, unit, parameter, lastUpdated } = measurement;

            const popup = L.popup()
                .setContent(`
                <p>
                    The weather in ${timezone} is ${summary} with a temperature ${temperature}°C.
                </p>
                <p>
                    The concentration of particulate matter (${parameter}) in
                    this city is ${value + unit}. Last read on
                    ${lastUpdated}
                </p>
            `)
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(popup).openPopup();
        } else {
            console.error(`No aqData!`)
            const popup = L.popup()
                .setContent(`
                <p>
                    The weather in ${timezone} is ${summary} with a temperature ${temperature}°C.
                </p>
                <p>
                    No air quality measurements for that location! Sorry!
                </p>
            `)
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(popup).openPopup();
        }
    })
}

async function getData() {
    const response = await fetch('/api');
    const data = await response.json();
    return data;
}

(async () => {
    mapData(await getData());
})();

// Error handling in case of no data from the server ?...

