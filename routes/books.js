const router = require("express").Router();
const { Book, validate } = require("../models/book");
const verifyAccessToken = require("../middlewares/verifyAccessToken");
const validateObjectId = require("../middlewares/validateObjectId");

// create book
router.post("/", verifyAccessToken, async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		await new Book(req.body).save();

		res.status(201).send({ message: "Book created successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// get books by pagination
router.get("/", async (req, res) => {
	try {
		let { page, size, search } = req.query;
		if (!page) page = 1;
		if (!size) size = 10;

		const limit = parseInt(size);
		const skip = (page - 1) * size;

		const query = {
			$or: [
				{ name: { $regex: search, $options: "i" } },
				{ author: { $regex: search, $options: "i" } },
			],
		};

		let books;
		if (search) {
			books = await Book.find(query).select("-__v").limit(limit).skip(skip);
		} else {
			books = await Book.find().select("-__v").limit(limit).skip(skip);
		}
		res.status(200).send({ data: books });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// get book by id
router.get("/:id", validateObjectId, async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		res.status(200).send(book);
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// update multiple books
router.patch("/", verifyAccessToken, async (req, res) => {
	try {
		const operations = req.body.data.map(function (book) {
			return {
				updateOne: {
					filter: { _id: book._id },
					update: { $set: book },
				},
			};
		});

		await Book.bulkWrite(operations);
		res.status(200).send({ message: "Updated Successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal server error" });
		console.log(error);
	}
});

// delete book by id
router.delete(
	"/:id",
	[validateObjectId, verifyAccessToken],
	async (req, res) => {
		try {
			await Book.findByIdAndDelete(req.params.id);
			res.status(200).send({ message: "Book deleted successfully" });
		} catch (error) {
			res.status(500).send({ message: "Internal server error" });
			console.log(error);
		}
	}
);

module.exports = router;
