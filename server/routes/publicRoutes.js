const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/:publicId', fileController.getPublicFile);

module.exports = router;
