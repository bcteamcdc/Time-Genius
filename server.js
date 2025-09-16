const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://vishwa:vishwa1214@cluster0.7tfnvps.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
    res.send('Hello, this is the Time Management App backend!');
});

// User registration route
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    // Implement user registration logic here
    res.json({ message: 'User registered successfully!' });
});

// User login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Implement user login logic here
    res.json({ message: 'User logged in successfully!' });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
