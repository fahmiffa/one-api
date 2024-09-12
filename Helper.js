const { Contest, Qey } = require("./model/dataModel");
const crypto = require("crypto");

function generateRandomKey() {
  return crypto
    .randomBytes(5)
    .toString("base64") 
    .replace(/\+/g, "0") 
    .replace(/\//g, "0") 
    .replace(/=+$/, "")
    .substr(0, 5);
}

async function getUniqueQey() {
  let uniqueKey;
  let isUnique = false;

  while (!isUnique) {
    uniqueKey = generateRandomKey();

    // Cek apakah kunci sudah ada di database
    const existingKey = await Contest.findOne({ where: { qey: uniqueKey } });

    if (!existingKey) {
      isUnique = true;
    }
  }

  return uniqueKey;
}

async function getUniqueTimer() {
  let uniqueKey;
  let isUnique = false;

  while (!isUnique) {
    uniqueKey = generateRandomKey();

    // Cek apakah kunci sudah ada di database
    const existingKey = await Contest.findOne({ where: { timer: uniqueKey } });

    if (!existingKey) {
      isUnique = true;
    }
  }

  return uniqueKey;
}

async function getUniqueKey() {
  let uniqueKey;
  let isUnique = false;

  while (!isUnique) {
    uniqueKey = generateRandomKey();

    // Cek apakah kunci sudah ada di database
    const existingKey = await Qey.findOne({ where: { key: uniqueKey } });

    if (!existingKey) {
      isUnique = true;
    }
  }

  return uniqueKey;
}

module.exports = { getUniqueQey, getUniqueTimer, getUniqueKey };
