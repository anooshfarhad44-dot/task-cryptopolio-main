const express = require("express");
const router = express.Router();
const {
  addAsset,
  removeAsset,
  getAllAssets,
  updateAssetPrice
} = require("../Controllers/Asset");
const upload = require("../middleware/upload");

// Add or Update Asset (with image upload support)
router.post("/add", upload.single("image"), addAsset);

// Remove Asset
router.post("/remove", removeAsset);

// Get All Assets with Portfolio Summary
router.post("/getall", getAllAssets);

// Update Asset Current Price
router.post("/updateprice", updateAssetPrice);

module.exports = router;

