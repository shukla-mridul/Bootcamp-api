const NodeGeoCoder = require("node-geocoder");
const dotenv = require("dotenv");
dotenv.config({ path: "../config/config.env" });
const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: "L8pCeXBHukfywiDNgwMIUjTq3M4mTHjX",

  formatter: null,
};

const geodcoder = NodeGeoCoder(options);

module.exports = geodcoder;
