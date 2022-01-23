const router = require("express").Router();
const { User, validate } = require("../models/user");
const {
	generateAccessToken,
	generateRefreshToken,
} = require("../helpers/jwt_helper");
const RefreshToken = require("../models/refreshToken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const verifyRefreshToken = require("../middlewares/verifyRefreshToken");
const verifyAccessToken = require("../middlewares/verifyAccessToken");

// register
router.post("/register", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already exist!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		await new User({ ...req.body, password: hashPassword }).save();
		res.status(201).send({ message: "Account created successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// login
router.post("/login", async (req, res) => {
	try {
		const { error } = loginSchema(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (!user)
			return res.status(401).send({ message: "Invalid Email or Password" });

		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validPassword)
			return res.status(401).send({ message: "Invalid Email or Password" });

		const accessToken = generateAccessToken(user._id);
		const refreshToken = generateRefreshToken(user._id);
		await RefreshToken.deleteMany({ userId: user._id });
		await new RefreshToken({ userId: user._id, token: refreshToken }).save();

		res.status(200).send({ data: { accessToken, refreshToken } });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// get new access token
router.post("/refresh-token", verifyRefreshToken, async (req, res) => {
	try {
		const accessToken = generateAccessToken(req.userId);
		const refreshToken = generateRefreshToken(req.userId);
		await RefreshToken.findByIdAndDelete(req.tokenId);
		await new RefreshToken({ userId: req.userId, token: refreshToken }).save();
		res.status(200).send({ data: { accessToken, refreshToken } });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// logout
router.delete(
	"/logout",
	[verifyAccessToken, verifyRefreshToken],
	async (req, res) => {
		try {
			await RefreshToken.deleteMany({ userId: req.userId });
			res.status(200).send({ message: "Logged out successfully" });
		} catch (error) {
			res.status(500).send({ message: "Internal server error" });
			console.log(error);
		}
	}
);

const loginSchema = (user) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
	});
	return schema.validate(user);
};

module.exports = router;
