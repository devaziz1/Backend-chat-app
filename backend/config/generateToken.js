const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  console.log("Inside generate token function");
  const secretKey = "AzizNaseer"; 
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "30d" }); 
};

module.exports = generateToken;
