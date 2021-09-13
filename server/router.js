const express = require("express");
const router = express.Router();


router.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "https://quizzical-borg-ced3aa.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});
router.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});


module.exports = router;