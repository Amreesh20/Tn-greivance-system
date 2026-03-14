const express = require('express');
const { testMLFlow } = require('../controllers/testController');
const router = express.Router();

router.get('/test-ml-flow', testMLFlow);

module.exports = router;
