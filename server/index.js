const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const { header } = require("express-validator");
const dashboardRouter = require("./Routes/Dashboard");
const fs = require("fs");
const path = require("path");

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created");
}

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002"], // frontend origins
  methods: ['DELETE', 'GET', 'PUT', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

app.use("/dashboard", dashboardRouter);
app.use("/dashboard", require("./Routes/Userdetails"));
app.use("/dashboard", require("./Routes/ProfileUpdate"));

app.use("/register", require("./Routes/CreatUser"));
app.use("/register", require("./Routes/Signup"));

app.use("/transactions", require("./Routes/Transactions"));
app.use("/transactions", require("./Routes/Transactions"));
app.use("/wallet", require("./Routes/Wallet"));
app.use("/assets", require("./Routes/Asset"));

//---------------mongoose connection----------------//
const Connection_url = "mongodb://localhost:27017/Cryptofolio";
const PORT = 3001;

// Set mongoose options before connecting
mongoose.set("strictQuery", true);

//here are routes for backend calls
mongoose
  .connect(Connection_url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.log("Please check your MongoDB connection string and network connection");
  });

//---------------mongoose connection----------------//

app.use((req, res, next) => {
  const allowedOrigins = ["https://cryptofolio-full-stack-1.vercel.app", "http://localhost:3000", "http://localhost:3002"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});


