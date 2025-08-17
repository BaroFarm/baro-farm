require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id: 1, email: "seller.test@baro-farm.com", user_type: "seller" },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

console.log("✅ 새 토큰:", token);
