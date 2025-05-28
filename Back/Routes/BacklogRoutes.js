const express = require('express');
const router = express.Router();
const BacklogController = require('../Controller/BacklogController');

router.post('/guardar', BacklogController.guardarBacklog);

module.exports = router;