const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token)
		return res
			.status(403)
			.send({ message: "Access denied, no token provided." });

	jwt.verify(token, process.env.ACCESSPRIVATEKEY, (error, validToken) => {
		if (error)
			return res.status(403).send({ message: "Access denied, Invalid token" });

		req.user = validToken;
		next();
	});
};
