const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const transaction = require("../models/Transactions"); //we select the table
const Wallet = require("../models/Wallet"); //we select the table
const Asset = require("../models/Asset"); //we select the asset table
const jwt = require("jsonwebtoken");
const Transactions = require("../models/Transactions");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

const UserSellTransactions = async (req, res) => {
  console.log(req.body);
  console.log("======================================================");
  const transactiondetails = req.body.Transaction;
  console.log(transactiondetails);
  const authToken = req.body.login;
  const data = jwt.verify(authToken, jwtSecret);
  console.log("data come for buy/sell");
  console.log(data.user.id);

  //------------send transactions-------------//

  //--------------------get balance to change wallet money-------------------//

  let invested = 0;
  await Wallet.find({ UserId: data.user.id }).then(async (data) => {
    console.log(data);
    invested = data[0].Invested;
    amount = data[0].Amount;
    console.log(amount);
  });

  let Tdata = [];

  let quantity = 0;
  await Transactions.find({ UserId: data.user.id }).then(async (data) => {
    Tdata = data[0].Transaction;
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    console.log(Tdata);
    // console.log(Tdata.length);
  });

  for (let i = 0; i < Tdata.length; i++) {
    quantity = quantity + Tdata[i].Quantity;
  }
  console.log(quantity);

  if (quantity >= req.body.Quantity) {
    console.log(
      "______________________________hogaya transaction--------------------"
    );
    await Wallet.findOneAndUpdate(
      { UserId: data.user.id },
      {
        Invested: Number(invested) - Number(req.body.Amount),
        Amount: Number(amount) + Number(req.body.Amount),
      }
    ).then(async (data) => {
      console.log("balance updated");
      console.log("value after brought");
      console.log(Number(amount) + Number(req.body.Amount));
    });

    const transactiondata = await transaction.find({ UserId: data.user.id });
    if (transactiondata.length !== 0) {
      await transaction
        .findOneAndUpdate(
          { UserId: data.user.id },
          {
            Transaction: transactiondetails,
          }
        )
        .then(async (data) => {
          console.log("transaction added");
        });
    } else {
      await transaction
        .create({
          UserId: data.user.id,
          Transaction: transactiondetails,
        })
        .then(console.log("transaction created"));
    }

    // Auto-update asset when selling
    try {
      // Get the latest transaction to extract coin details
      const latestTransaction = transactiondetails[transactiondetails.length - 1];
      if (latestTransaction && latestTransaction.type === "Sell") {
        const coinId = latestTransaction.CoinId;
        const sellQuantity = Number(latestTransaction.Quantity);
        const currentPrice = Number(latestTransaction.Prise);

        // Find the asset
        const existingAsset = await Asset.findOne({ 
          UserId: data.user.id, 
          CoinId: coinId 
        });

        if (existingAsset && existingAsset.Quantity >= sellQuantity) {
          // Calculate proportional reduction in invested amount
          const proportionSold = sellQuantity / existingAsset.Quantity;
          const investedReduction = existingAsset.TotalInvested * proportionSold;
          
          const newQuantity = existingAsset.Quantity - sellQuantity;
          const newTotalInvested = existingAsset.TotalInvested - investedReduction;
          
          if (newQuantity > 0) {
            // Update asset with reduced quantity
            existingAsset.Quantity = newQuantity;
            existingAsset.TotalInvested = newTotalInvested;
            existingAsset.CurrentPrice = currentPrice;
            existingAsset.LastUpdated = new Date();
            await existingAsset.save();
            console.log("Asset updated after sell");
          } else {
            // Remove asset if quantity becomes zero
            await Asset.findOneAndDelete({ 
              UserId: data.user.id, 
              CoinId: coinId 
            });
            console.log("Asset removed after complete sell");
          }
        }
      }
    } catch (assetError) {
      console.error("Error updating asset on sell:", assetError);
      // Don't fail the transaction if asset update fails
    }

    res.send("YES");
  } else {
    console.log(
      "______________________________nhi hua transaction--------------------"
    );
    res.send("NO");
  }

  // res.send(data);
  // await Transaction.findOneAndUpdate(
  //   { email: req.body.email },
  //   {
  //     name: req.body.name,
  //     description: req.body.description,
  //   }
  // )
  //   .then(async(data) => {
  //     console.log("updated");
  //     console.log(data);
  //   })
  //   .catch();
};

module.exports = { UserSellTransactions };
