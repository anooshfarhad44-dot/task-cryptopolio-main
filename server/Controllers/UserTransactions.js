const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const transaction = require("../models/Transactions"); //we select the table
const Wallet = require("../models/Wallet"); //we select the table
const Asset = require("../models/Asset"); //we select the asset table
const jwt = require("jsonwebtoken");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

const UserTransactions = async (req, res) => {
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

  let amount = 0;
  let invested = 0;
  await Wallet.find({ UserId: data.user.id }).then(async (data) => {
    console.log(data);
    invested = data[0].Invested;
    amount = data[0].Amount;
    console.log(amount);
  });

  if (amount >= req.body.Amount) {
    await Wallet.findOneAndUpdate(
      { UserId: data.user.id },
      {
        Invested: Number(invested) + Number(req.body.Amount),
        Amount: Number(amount) - Number(req.body.Amount),
      }
    ).then(async (data) => {
      console.log("balance updated");
      console.log("value after brought");
      console.log(Number(amount) - Number(req.body.Amount));
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

    // Auto-add/update asset when buying
    try {
      // Get the latest transaction to extract coin details
      const latestTransaction = transactiondetails[transactiondetails.length - 1];
      if (latestTransaction && latestTransaction.type === "Buy") {
        const coinId = latestTransaction.CoinId;
        const coinName = latestTransaction.CoinName;
        const quantity = Number(latestTransaction.Quantity);
        const currentPrice = Number(latestTransaction.Prise);
        const image = latestTransaction.img || "";

        // Check if asset already exists
        const existingAsset = await Asset.findOne({ 
          UserId: data.user.id, 
          CoinId: coinId 
        });

        if (existingAsset) {
          // Update existing asset - calculate new average price
          const totalQuantity = existingAsset.Quantity + quantity;
          const totalInvested = existingAsset.TotalInvested + (quantity * currentPrice);
          const newAveragePrice = totalInvested / totalQuantity;

          existingAsset.Quantity = totalQuantity;
          existingAsset.TotalInvested = totalInvested;
          existingAsset.AveragePrice = newAveragePrice;
          existingAsset.CurrentPrice = currentPrice;
          existingAsset.LastUpdated = new Date();

          await existingAsset.save();
          console.log("Asset updated automatically");
        } else {
          // Create new asset
          await Asset.create({
            UserId: data.user.id,
            CoinId: coinId,
            CoinName: coinName,
            CoinSymbol: coinName, // Default to coin name if symbol not available
            Image: image,
            Quantity: quantity,
            AveragePrice: currentPrice,
            TotalInvested: quantity * currentPrice,
            CurrentPrice: currentPrice,
            LastUpdated: new Date()
          });
          console.log("Asset added automatically");
        }
      }
    } catch (assetError) {
      console.error("Error updating asset:", assetError);
      // Don't fail the transaction if asset update fails
    }

    res.send("YES");
  } else {
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

module.exports = { UserTransactions };
