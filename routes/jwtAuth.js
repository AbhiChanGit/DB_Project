const router = require("express").Router();
const db = require("../index");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorization = require("../middleware/authorization");
const nodemailer = require("nodemailer");
const generateQRCode = require("../utils/qrcodeGenerator");

const userDataStorage = {};

