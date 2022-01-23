const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
	const token = jwt.sign({ _id: userId }, process.env.ACCESSPRIVATEKEY, {
		expiresIn: "15m",
	});
	return token;
};

const generateRefreshToken = (userId) => {
	const token = jwt.sign({ _id: userId }, process.env.REFRESHPRIVATEKEY, {
		expiresIn: "30d",
	});
	return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
