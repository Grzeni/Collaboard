const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true);
  res.send({ response: "Server is up and running." }).status(200);
});

module.exports = router;