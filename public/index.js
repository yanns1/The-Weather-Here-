if ('geolocation' in navigator) {
    console.log('Geolocation available')

    function displayCurrentCoords({ latitude, longitude }) {
        const latSpan = document.querySelector('#current-lat');
        const lngSpan = document.querySelector('#current-lng');
        latSpan.innerHTML = latitude.toFixed(2);
        lngSpan.innerHTML = longitude.toFixed(2);
    }

    async function submitData({ latitude, longitude, timestamp }, weatherData, aqData) {
        const data = {
            latitude,
            longitude,
            timestamp,
            weatherData,
            aqData
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        }
        const serverRes = await fetch('/api', options);
        const json = await serverRes.json();
        console.log(json)
    }

    function parsePosition(position) {
        const { latitude, longitude } = position.coords;
        const { timestamp } = position;
        return {
            latitude,
            longitude,
            timestamp
        };
    }

    async function getWeather({ latitude, longitude }) {
        const response = await fetch(`/weather/${latitude},${longitude}`);
        const data = await response.json();
        return data;
    }

    function displayWeather(data) {
        console.log(data)
        const summarySpan = document.querySelector('#summary');
        summarySpan.innerHTML = data.currently.summary.toLowerCase();
        const tempSpan = document.querySelector('#temperature');
        tempSpan.innerHTML = data.currently.temperature;
        const zoneSpan = document.querySelector('#timezone');
        zoneSpan.innerHTML = data.timezone.split('/')[1];
    }

    async function getAirQuality({ latitude, longitude }) {
        const response = await fetch(`/air-quality/${latitude},${longitude}`);
        const data = await response.json();
        return data;
    }

    function displayAirQuality(aqData) {
        try {
            const measurement = aqData[0].measurements[0];
            const { value, unit, parameter, lastUpdated } = measurement;

            const valueSpan = document.querySelector('#value');
            valueSpan.innerHTML = value + unit;
            const paramSpan = document.querySelector('#parameter');
            paramSpan.innerHTML = parameter;
            const updateSpan = document.querySelector('#last-update');
            updateSpan.innerHTML = lastUpdated;
        } catch (err) {
            console.error(`Problem with the data from the Air Quality API:`, err)
            const aqPara = document.querySelector('.aq-para');
            aqPara.innerHTML = 'No air quality measurements for that location! Sorry!';
        }
    }

    // At each render
    navigator.geolocation.getCurrentPosition(async position => {
        displayCurrentCoords( parsePosition(position) );
        displayWeather( await getWeather( parsePosition(position) ) );
        displayAirQuality( await getAirQuality(parsePosition(position)) );
    });

    const submitButton = document.querySelector('.submit');
    submitButton.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(async position => {
            submitData(
                parsePosition(position),
                await getWeather(parsePosition(position) ),
                await getAirQuality( parsePosition(position) )
            );
        })
    });

} else {
    console.log('Geolocation not available')
}



