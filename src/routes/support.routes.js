const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');

router.post('/', supportController.createTicket);
router.get('/', supportController.getTickets);
router.put('/:id', supportController.updateTicket);
router.post('/:id/summarize', supportController.summarizeTicket);
module.exports = router;
