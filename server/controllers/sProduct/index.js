// server/controllers/sProduct/index.js
const basic = require('./basic');
const image = require('./image');
const AIDescription = require('./AIDescription');
const manualDescription = require('./manualDescription');
const AISummary = require('./AISummary');
const AIVideo = require('./AIVideo');
const detailPage = require('./detailPage');

module.exports = {
  ...basic,
  ...image,
  ...AIDescription,
  ...manualDescription,
  ...AISummary,
  ...AIVideo,
  ...detailPage,
};