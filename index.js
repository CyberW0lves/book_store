require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./db");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");

// connect to DB
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/books/", bookRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
