const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');

router.post('/', supportController.createTicket);
router.get('/', supportController.getTickets);
router.put('/:id', supportController.updateTicket);

module.exports = router;
