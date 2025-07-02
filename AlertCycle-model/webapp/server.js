// server.js

const express = require('express');
const app = express();
const cors = require('cors');


const port = 3000;
// Middleware to parse incoming JSON data
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST'], // Allowed methods
  allowedHeaders: ['Content-Type'] // Allowed headers
}));

// Serve static files (index.html) from the 'public' folder
app.use(express.static('public'));

// Handle POST request from Python script to receive detected object coordinates
let detectedData = {};

app.post('/api/data', (req, res) => {
    detectedData = req.body;  // Store the received data
    console.log("🔹 Received Data:", JSON.stringify(detectedData, null, 2));
    res.status(200);
});



// Endpoint to serve the received data to the front end
app.get('/api/data', (req, res) => {
    res.json(detectedData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
