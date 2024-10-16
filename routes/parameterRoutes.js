const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController.js');

router.get('/', parameterController.parametersList);

module.exports = router;

