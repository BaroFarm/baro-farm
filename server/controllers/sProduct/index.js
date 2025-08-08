// server/controllers/sProduct/index.js
const basic = require('./basic');
const image = require('./image');
const AIDescription = require('./AIDescription');
const manualDescription = require('./manualDescription');
const AISummary = require('./AISummary');

module.exports = {
  ...basic,
  ...image,
  ...AIDescription,
  ...manualDescription,
  ...AISummary
};