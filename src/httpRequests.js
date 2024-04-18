// httpRequests.js
const axios = require("axios");
const config = require("./config");

let authToken = "";

async function login() {
  try {
    const response = await axios.post(config.loginUrl, {
      admin_email: config.email,
      password: config.password,
    });
    authToken = response.data.token;
    console.log("Logged in successfully.");
    console.log(authToken);
  } catch (error) {
    console.error("Error during login:", error);
  }
}

async function makeHttpRequest(imei, latitude, longitude) {
  const url = `${config.apiUrl}/equipment/editEquipment/${imei}`;
  const headers = { Authorization: authToken };
  const body = { longitude, latitude };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("HTTP request successful:", response.data);
  } catch (error) {
    console.error("Error making HTTP request:", error);
    if (error.response && error.response.status === 401) {
      // Unauthorized, attempt login again
      await login();
    }
  }
}
async function makeHttpRequest(imei, latitude, longitude) {
  const url = `${config.apiUrl}/equipment/editEquipment/${imei}`;
  const headers = { Authorization: authToken };
  const body = { longitude, latitude };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("HTTP request successful:", response.data);
  } catch (error) {
    console.error("Error making HTTP request:", error);
    if (error.response && error.response.status === 401) {
      // Unauthorized, attempt login again
      await login();
    }
  }
}
async function makeKeyValueHttpRequest(imei, keyValue) {
  const url = `${config.apiUrl}/equipment/editEquipment/${imei}`;
  //const url = "http://192.168.100.25:5000";
  const headers = { Authorization: authToken };
  const body = { ...keyValue };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("HTTP request successful:", response.data);
  } catch (error) {
    console.error("Error making HTTP request:", error);
    if (error.response && error.response.status === 401) {
      // Unauthorized, attempt login again
      await login();
    }
  }
}

function setOnUnauthorizedCallback(callback) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        callback();
      }
      return Promise.reject(error);
    }
  );
}

module.exports = {
  login,
  makeHttpRequest,
  makeKeyValueHttpRequest,
  setOnUnauthorizedCallback,
};
