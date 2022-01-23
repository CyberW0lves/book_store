const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
	token: { type: String, required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
	createdAt: { type: Date, default: Date.now, expires: 30 * 86400 },
});

module.exports = mongoose.model("refreshToken", refreshTokenSchema);
