module.exports = {
  apps: [
    {
      name: "nodeServer",
      script: "./src/server.js",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      combine_logs: true,
      time: true,
    },
  ],
};
