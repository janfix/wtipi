const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/process_results', resultController.processResults);

module.exports = router;
