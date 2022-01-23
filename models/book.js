const mongoose = require("mongoose");
const Joi = require("joi");

const bookSchema = new mongoose.Schema({
	name: { type: String, required: true },
	author: { type: String, required: true },
	price: { type: Number, required: true },
	isbn: { type: String, required: true },
});

const Book = mongoose.model("book", bookSchema);

const validate = (book) => {
	const schema = Joi.object({
		name: Joi.string().required().label("Name"),
		author: Joi.string().required().label("Author"),
		price: Joi.number().required().label("Price"),
		isbn: Joi.string().required().label("ISBN"),
	});
	return schema.validate(book);
};

module.exports = { Book, validate };
