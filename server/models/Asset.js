// Asset Model - Stores user's crypto portfolio assets
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  UserId: {
    type: String,
    require: true,
  },
  CoinId: {
    type: String,
    require: true,
  },
  CoinName: {
    type: String,
    require: true,
  },
  CoinSymbol: {
    type: String,
    require: true,
  },
  Image: {
    type: String,
    require: true,
  },
  Quantity: {
    type: Number,
    require: true,
    default: 0,
  },
  AveragePrice: {
    type: Number,
    require: true,
    default: 0,
  },
  TotalInvested: {
    type: Number,
    require: true,
    default: 0,
  },
  CurrentPrice: {
    type: Number,
    default: 0,
  },
  LastUpdated: {
    type: Date,
    default: Date.now,
  },
});

//we have created the table now we will export this table
module.exports = mongoose.model("asset", assetSchema);

