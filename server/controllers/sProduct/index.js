// server/controllers/sProduct/index.js
const basic = require('./basic');
const image = require('./image');

module.exports = {
  ...basic,
  ...image,
};