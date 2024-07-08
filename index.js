const express = require("express");
const body_parser = require("body-parser");
const userRouter = require("./router.js")
const cors = require('cors');
const app = express();

const port =  5000;

app.use(cors({
    origin: `http://localhost:${port}/` 
}));

app.use(body_parser.json());

app.use("/", userRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;