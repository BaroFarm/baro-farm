// server/controllers/sProduct/index.js
const basic = require('./basic');
const image = require('./image');
const AIDescription = require('./AIDescription');

module.exports = {
  ...basic,
  ...image,
  ...AIDescription,
};