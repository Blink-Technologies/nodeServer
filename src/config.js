// config.js
require("dotenv").config();

module.exports = {
  tcpPort: process.env.TCP_PORT || 3000,
  loginUrl: "https://platinobe.adaptable.app/auth/adminLogin",
  apiUrl: "https://platinobe.adaptable.app",
  email: process.env.ADMIN_EMAIL,
  password: process.env.PASSWORD,
};
