const Asset = require("../models/Asset");
const jwt = require("jsonwebtoken");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

// Add or Update Asset
const addAsset = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userdata = jwt.verify(authToken, jwtSecret);
    const userId = userdata.user.id;

    const { CoinId, CoinName, CoinSymbol, Image, Quantity, CurrentPrice } = req.body;

    if (!CoinId || !CoinName || !Quantity || !CurrentPrice) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: CoinId, CoinName, Quantity, CurrentPrice" 
      });
    }

    // Handle image upload - if file is uploaded, use its path, otherwise use provided URL
    let imageUrl = Image || "";
    if (req.file) {
      // Image was uploaded, create URL for the uploaded file
      imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
      console.log("Image uploaded:", req.file.filename);
    } else if (Image) {
      console.log("Image URL provided:", Image);
    }

    // Check if asset already exists for this user
    const existingAsset = await Asset.findOne({ 
      UserId: userId, 
      CoinId: CoinId 
    });

    if (existingAsset) {
      // Update existing asset - calculate new average price
      const totalQuantity = existingAsset.Quantity + Number(Quantity);
      const totalInvested = existingAsset.TotalInvested + (Number(Quantity) * Number(CurrentPrice));
      const newAveragePrice = totalInvested / totalQuantity;

      existingAsset.Quantity = totalQuantity;
      existingAsset.TotalInvested = totalInvested;
      existingAsset.AveragePrice = newAveragePrice;
      existingAsset.CurrentPrice = Number(CurrentPrice);
      existingAsset.LastUpdated = new Date();
      // Update image if new one is provided
      if (imageUrl) {
        existingAsset.Image = imageUrl;
      }

      await existingAsset.save();

      return res.json({
        success: true,
        message: "Asset updated successfully",
        asset: existingAsset
      });
    } else {
      // Create new asset
      const newAsset = await Asset.create({
        UserId: userId,
        CoinId: CoinId,
        CoinName: CoinName,
        CoinSymbol: CoinSymbol || CoinName,
        Image: imageUrl,
        Quantity: Number(Quantity),
        AveragePrice: Number(CurrentPrice),
        TotalInvested: Number(Quantity) * Number(CurrentPrice),
        CurrentPrice: Number(CurrentPrice),
        LastUpdated: new Date()
      });

      return res.json({
        success: true,
        message: "Asset added successfully",
        asset: newAsset
      });
    }
  } catch (error) {
    console.error("Error adding asset:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error adding asset", 
      error: error.message 
    });
  }
};

// Remove Asset (completely remove from portfolio)
const removeAsset = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userdata = jwt.verify(authToken, jwtSecret);
    const userId = userdata.user.id;
    const { CoinId } = req.body;

    if (!CoinId) {
      return res.status(400).json({ 
        success: false, 
        message: "CoinId is required" 
      });
    }

    const deletedAsset = await Asset.findOneAndDelete({ 
      UserId: userId, 
      CoinId: CoinId 
    });

    if (!deletedAsset) {
      return res.status(404).json({ 
        success: false, 
        message: "Asset not found" 
      });
    }

    return res.json({
      success: true,
      message: "Asset removed successfully",
      asset: deletedAsset
    });
  } catch (error) {
    console.error("Error removing asset:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error removing asset", 
      error: error.message 
    });
  }
};

// Get All Assets with Total Portfolio Value
const getAllAssets = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userdata = jwt.verify(authToken, jwtSecret);
    const userId = userdata.user.id;

    const assets = await Asset.find({ UserId: userId });

    // Calculate total portfolio value
    let totalInvested = 0;
    let totalCurrentValue = 0;

    assets.forEach(asset => {
      totalInvested += asset.TotalInvested || 0;
      totalCurrentValue += (asset.Quantity * (asset.CurrentPrice || asset.AveragePrice));
    });

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 
      ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) 
      : 0;

    return res.json({
      success: true,
      assets: assets,
      portfolioSummary: {
        totalInvested: totalInvested.toFixed(2),
        totalCurrentValue: totalCurrentValue.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        totalProfitLossPercentage: totalProfitLossPercentage
      }
    });
  } catch (error) {
    console.error("Error getting assets:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error getting assets", 
      error: error.message 
    });
  }
};

// Update Asset Current Price (for price updates)
const updateAssetPrice = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userdata = jwt.verify(authToken, jwtSecret);
    const userId = userdata.user.id;
    const { CoinId, CurrentPrice } = req.body;

    if (!CoinId || !CurrentPrice) {
      return res.status(400).json({ 
        success: false, 
        message: "CoinId and CurrentPrice are required" 
      });
    }

    const asset = await Asset.findOneAndUpdate(
      { UserId: userId, CoinId: CoinId },
      { 
        CurrentPrice: Number(CurrentPrice),
        LastUpdated: new Date()
      },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ 
        success: false, 
        message: "Asset not found" 
      });
    }

    return res.json({
      success: true,
      message: "Asset price updated successfully",
      asset: asset
    });
  } catch (error) {
    console.error("Error updating asset price:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error updating asset price", 
      error: error.message 
    });
  }
};

module.exports = {
  addAsset,
  removeAsset,
  getAllAssets,
  updateAssetPrice
};

