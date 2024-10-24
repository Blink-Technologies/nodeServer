// config.js
require("dotenv").config();

module.exports = {
  tcpPort: process.env.TCP_PORT || 3000,
  loginUrl: "https://trackerbe.onrender.com/auth/adminLogin",
  apiUrl: "https://trackerbe.onrender.com",
  email: process.env.ADMIN_EMAIL,
  password: process.env.PASSWORD,
};
