const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = "abcdefghijklmnopqrstuvwxyz";

const { body, validationResult } = require("express-validator");

router.post(
  "/Signup",
  body("email", "invalid email").isEmail(),
  body("password", "too small").isLength({ min: 5 }),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //logic for signin
      const username = req.body.email;
      const pswd = req.body.password;
      console.log("Login attempt for:", username);
      
      let userdata = await User.findOne({ email: username });
      console.log({ userdata });

      // Check if user exists first
      if (!userdata) {
        return res.send("No such user found");
      }

      // Verify password
      const comparepswd = await bcrypt.compare(pswd, userdata.password);
      console.log("Password match:", comparepswd);
      
      if (comparepswd) {
        // Create JWT token only if user exists and password is correct
        const data = {
          user: {
            id: userdata._id,
          },
        };
        const authToken = jwt.sign(data, jwtSecret);
        res.send({ userdata, authToken });
      } else {
        res.send("No such user found");
      }
    } catch (error) {
      console.error("Signup route error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
