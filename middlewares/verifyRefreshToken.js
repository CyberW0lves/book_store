const RefreshToken = require("../models/refreshToken");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		const schema = Joi.object({
			refreshToken: Joi.string().required().label("Refresh Token"),
		});
		const { error } = schema.validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		let validRefershToken;
		jwt.verify(
			req.body.refreshToken,
			process.env.REFRESHPRIVATEKEY,
			(error, validToken) => {
				if (error)
					return res
						.status(400)
						.send("Invalid Refresh Token, Please Sign in again");
				validRefershToken = validToken;
			}
		);

		const RefreshTokenExist = await RefreshToken.findOne({
			token: req.body.refreshToken,
		});
		if (!RefreshTokenExist)
			return res
				.status(400)
				.send("Invalid Refresh Token, Please Sign in again");

		req.userId = validRefershToken._id;
		req.tokenId = RefreshTokenExist._id;
		next();
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
};
