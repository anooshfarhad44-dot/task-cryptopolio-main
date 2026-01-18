import axios from "axios";
import React, { useEffect, useState } from "react";

export default function AssetManagement() {
  const login = localStorage.getItem("authToken");
  const [assets, setAssets] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvested: "0.00",
    totalCurrentValue: "0.00",
    totalProfitLoss: "0.00",
    totalProfitLossPercentage: "0.00"
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    CoinId: "",
    CoinName: "",
    CoinSymbol: "",
    Image: "",
    Quantity: "",
    CurrentPrice: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch all assets
  const getAllAssets = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: "POST",
        url: "http://localhost:3001/assets/getall",
        data: {
          login: login,
        },
        headers: {
          "Content-type": "application/json",
        },
      });

      if (response.data.success) {
        setAssets(response.data.assets);
        setPortfolioSummary(response.data.portfolioSummary);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      alert("Error loading assets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (login) {
      getAllAssets();
    }
  }, [login]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        e.target.value = ""; // Reset input
        return;
      }
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        e.target.value = ""; // Reset input
        return;
      }
      
      setSelectedImage(file);
      // Clear URL input if file is selected
      setNewAsset({ ...newAsset, Image: "" });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        alert("Error reading image file");
        e.target.value = ""; // Reset input
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Asset
  const handleAddAsset = async (e) => {
    e.preventDefault();
    
    if (!newAsset.CoinId || !newAsset.CoinName || !newAsset.Quantity || !newAsset.CurrentPrice) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("login", login);
      formData.append("CoinId", newAsset.CoinId);
      formData.append("CoinName", newAsset.CoinName);
      formData.append("CoinSymbol", newAsset.CoinSymbol || newAsset.CoinName);
      formData.append("Quantity", Number(newAsset.Quantity));
      formData.append("CurrentPrice", Number(newAsset.CurrentPrice));
      
      // Add image if uploaded, otherwise add image URL if provided
      if (selectedImage) {
        formData.append("image", selectedImage);
      } else if (newAsset.Image) {
        formData.append("Image", newAsset.Image);
      }

      const response = await axios({
        method: "POST",
        url: "http://localhost:3001/assets/add",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert(response.data.message);
        setShowAddModal(false);
        setNewAsset({
          CoinId: "",
          CoinName: "",
          CoinSymbol: "",
          Image: "",
          Quantity: "",
          CurrentPrice: ""
        });
        setSelectedImage(null);
        setImagePreview(null);
        getAllAssets(); // Refresh assets list
      } else {
        alert(response.data.message || "Error adding asset");
      }
    } catch (error) {
      console.error("Error adding asset:", error);
      alert("Error adding asset. Please try again.");
    }
  };

  // Remove Asset
  const handleRemoveAsset = async (coinId, coinName) => {
    if (!window.confirm(`Are you sure you want to remove ${coinName} from your portfolio?`)) {
      return;
    }

    try {
      const response = await axios({
        method: "POST",
        url: "http://localhost:3001/assets/remove",
        data: {
          login: login,
          CoinId: coinId,
        },
        headers: {
          "Content-type": "application/json",
        },
      });

      if (response.data.success) {
        alert(response.data.message);
        getAllAssets(); // Refresh assets list
      } else {
        alert(response.data.message || "Error removing asset");
      }
    } catch (error) {
      console.error("Error removing asset:", error);
      alert("Error removing asset. Please try again.");
    }
  };

  // Calculate individual asset profit/loss
  const calculateProfitLoss = (asset) => {
    const currentValue = asset.Quantity * (asset.CurrentPrice || asset.AveragePrice);
    const profitLoss = currentValue - asset.TotalInvested;
    const profitLossPercentage = asset.TotalInvested > 0 
      ? ((profitLoss / asset.TotalInvested) * 100).toFixed(2) 
      : 0;
    return { profitLoss, profitLossPercentage };
  };

  if (loading) {
    return (
      <div className="w-[90%] mx-auto bg-[#272e41] p-5 rounded-lg">
        <div className="text-white text-center">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="w-[90%] mx-auto bg-[#272e41] p-5 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-white text-[20px] md:text-[22px]">
          Asset Management
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#209fe4] px-4 py-2 rounded-md font-semibold text-white text-sm md:text-base hover:bg-[#1a8bc7] transition"
        >
          + Add Asset
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-[#171b26] rounded-lg p-4 mb-4">
        <div className="font-bold text-white text-center text-[18px] md:text-[20px] mb-3">
          Portfolio Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-[#dedddd] text-sm md:text-base mb-1">Total Invested</div>
            <div className="text-white font-semibold text-base md:text-lg">
              ₹{parseFloat(portfolioSummary.totalInvested).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#dedddd] text-sm md:text-base mb-1">Current Value</div>
            <div className="text-white font-semibold text-base md:text-lg">
              ₹{parseFloat(portfolioSummary.totalCurrentValue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#dedddd] text-sm md:text-base mb-1">Profit/Loss</div>
            <div className={`font-semibold text-base md:text-lg ${
              parseFloat(portfolioSummary.totalProfitLoss) >= 0 ? 'text-[#26a69a]' : 'text-[#c12f3d]'
            }`}>
              ₹{parseFloat(portfolioSummary.totalProfitLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#dedddd] text-sm md:text-base mb-1">P/L %</div>
            <div className={`font-semibold text-base md:text-lg ${
              parseFloat(portfolioSummary.totalProfitLossPercentage) >= 0 ? 'text-[#26a69a]' : 'text-[#c12f3d]'
            }`}>
              {portfolioSummary.totalProfitLossPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="max-h-[500px] overflow-y-auto">
        {assets.length === 0 ? (
          <div className="text-white text-center py-8">
            No assets in your portfolio. Click "Add Asset" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset, index) => {
              const { profitLoss, profitLossPercentage } = calculateProfitLoss(asset);
              const currentValue = asset.Quantity * (asset.CurrentPrice || asset.AveragePrice);
              
              return (
                <div
                  key={index}
                  className="bg-[#171b26] rounded-lg p-4 text-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Coin Info */}
                    <div className="flex items-center space-x-3">
                      {asset.Image && (
                        <img
                          src={asset.Image}
                          alt={asset.CoinName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-base md:text-lg">
                          {asset.CoinName}
                        </div>
                        <div className="text-sm text-[#dedddd]">
                          {asset.CoinSymbol}
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <div className="text-sm text-[#dedddd] mb-1">Quantity</div>
                      <div className="font-semibold">{asset.Quantity}</div>
                    </div>

                    {/* Current Value */}
                    <div>
                      <div className="text-sm text-[#dedddd] mb-1">Current Value</div>
                      <div className="font-semibold">
                        ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Profit/Loss */}
                    <div>
                      <div className="text-sm text-[#dedddd] mb-1">P/L</div>
                      <div className={`font-semibold ${
                        profitLoss >= 0 ? 'text-[#26a69a]' : 'text-[#c12f3d]'
                      }`}>
                        ₹{profitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        <span className="text-xs ml-1">({profitLossPercentage}%)</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex justify-center md:justify-end">
                      <button
                        onClick={() => handleRemoveAsset(asset.CoinId, asset.CoinName)}
                        className="bg-[#c12f3d] px-4 py-2 rounded-md font-semibold text-white text-sm hover:bg-[#a02833] transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1d2230] rounded-lg p-6 w-[90%] md:w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-xl">Add New Asset</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="text-white text-2xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddAsset}>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Coin ID *
                  </label>
                  <input
                    type="text"
                    value={newAsset.CoinId}
                    onChange={(e) => setNewAsset({ ...newAsset, CoinId: e.target.value })}
                    className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                    placeholder="e.g., bitcoin"
                    required
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Coin Name *
                  </label>
                  <input
                    type="text"
                    value={newAsset.CoinName}
                    onChange={(e) => setNewAsset({ ...newAsset, CoinName: e.target.value })}
                    className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Coin Symbol
                  </label>
                  <input
                    type="text"
                    value={newAsset.CoinSymbol}
                    onChange={(e) => setNewAsset({ ...newAsset, CoinSymbol: e.target.value })}
                    className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                    placeholder="e.g., BTC"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Image (Upload or URL)
                  </label>
                  
                  {/* File Upload Section */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">
                      Upload Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#209fe4] file:text-white hover:file:bg-[#1a8bc7] cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded border-2 border-[#209fe4]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            // Reset file input
                            const fileInput = document.querySelector('input[type="file"]');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="text-gray-400 text-xs mx-2">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                  </div>

                  {/* URL Input Section */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Enter Image URL
                    </label>
                    <input
                      type="text"
                      value={newAsset.Image}
                      onChange={(e) => {
                        setNewAsset({ ...newAsset, Image: e.target.value });
                        // Clear file selection if URL is entered
                        if (e.target.value) {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }
                      }}
                      className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                      placeholder="https://example.com/image.jpg"
                    />
                    {newAsset.Image && !imagePreview && (
                      <div className="mt-2">
                        <img
                          src={newAsset.Image}
                          alt="URL Preview"
                          className="w-24 h-24 object-cover rounded border-2 border-[#209fe4]"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newAsset.Quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, Quantity: e.target.value })}
                    className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1 block">
                    Current Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newAsset.CurrentPrice}
                    onChange={(e) => setNewAsset({ ...newAsset, CurrentPrice: e.target.value })}
                    className="w-full p-2 rounded bg-[#171b26] text-white border border-gray-600"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#209fe4] py-2 rounded-md font-semibold text-white hover:bg-[#1a8bc7] transition"
                >
                  Add Asset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 bg-gray-600 py-2 rounded-md font-semibold text-white hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

