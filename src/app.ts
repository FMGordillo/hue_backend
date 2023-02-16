import indexRouter from "./routes/index";
import lightsRouter from "./routes/lights";
import dotenv from "dotenv";
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

dotenv.config();

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/lights", lightsRouter);

module.exports = app;
