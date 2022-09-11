const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    req.headers('Acess-Control-Allow-Credentials', true);
  }
  next();
};

module.exports = credentials;
