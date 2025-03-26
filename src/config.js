// config.js
require("dotenv").config();

module.exports = {
  tcpPort: process.env.TCP_PORT || 3000,
  loginUrl: "https://trackerbe.avantlabstech.com.com/auth/adminLogin",
  apiUrl: "https://trackerbe.avantlabstech.com",
  email: process.env.ADMIN_EMAIL,
  password: process.env.PASSWORD,
};
