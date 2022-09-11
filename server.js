require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookiePaser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect to mongoDB
connectDB();

//custom middleware
app.use(logger);

//handle options credentials check before CORS
//and fetch cookies credentials requirement
app.use(credentials);

//CORS cross origin resource sharing
app.use(cors(corsOptions));

//built in middleware to handle urlencoded from data
app.use(express.urlencoded({ extended: false }));

// build in midlleware for json
app.use(express.json());

//middleware for cookie
app.use(cookiePaser());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

//public routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
//refreshToken
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
//proteted routes
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));

//catch all
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('connected to mongoDB');
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});

//
