// Server (node index.js in the CLI to run the server OR nodemon index.js to rerun at each change (because of the nodemon package installed globally))
// → host static files (inside /public)
// → save infos to a database + authentification
// → retrieve infos from the database an pass it to the client

// For hiding API keys into a '.env' file (at the root of the directory) that i'll not publish when deploying.
require('dotenv').config()

// Necessary for using fetch in the server side
const fetch = require('node-fetch');

// Express (framework for creating servers with Node.js) : https://expressjs.com/
const express = require('express');

// Database with NeDB (subset of MongoDB)
const Datastore = require('nedb');

// Start a server
const app = express();
// Listen the port provided by the host env, or 8080 if not defined
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Start listening at ${port}`));
// Serve all the static files in /public to the client
app.use(express.static('public'));
// Tell the server to parse incoming JSON requests
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();



// 'Route' fait référence à la détermination de la méthode dont une application répond à une demande client adressée à un noeud final spécifique

// app.METHOD(PATH, HANDLER)
// Où:
// app est une instance d’express.
// METHOD est une méthode de demande HTTP.
// PATH est un chemin sur le serveur.
// HANDLER est la fonction exécutée lorsque la route est mise en correspondance.

app.get('/api', (req, res) => {
    // Catch everything in the database
    database.find({}, (err, data) => {
        if (err) {
            res.end();
            return;
        }
        return res.json(data);
    })
})

app.post('/api', (request, response) => {
    const data = request.body;
    database.insert(data);

    // Respond something to the client that will be handled with fetch().then()
    response.json({
        status: 'success',
        data
    });
});

// See 'Route parameters' in Express docs: https://expressjs.com/en/guide/routing.html
app.get('/weather/:lat,:lng', async (req, res) => {
    const { lat, lng } = req.params;
    // Need 'node-fetch' package for using fetch here
    const apiRes = await fetch(`https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${lat},${lng}/?units=si`);
    const data = await apiRes.json();

    return res.json(data);
})

app.get('/air-quality/:lat,:lng', async (req, res) => {
    const { lat, lng } = req.params;
    const apiRes = await fetch(`https://api.openaq.org/v1/latest?coordinates=${lat},${lng}`);
    const data = await apiRes.json();

    return res.json(data.results);
})
