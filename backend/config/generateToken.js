const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secretKey = "AzizNaseer"; 
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "30d" }); 
};

module.exports = generateToken;
