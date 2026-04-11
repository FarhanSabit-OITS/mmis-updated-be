const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const authMiddleware = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware').validate;
const { createTicketSchema, updateTicketSchema } = require('../validations/support.validation');

router.use(authMiddleware);

router.post('/', validate(createTicketSchema), supportController.createTicket);
router.get('/', supportController.getTickets);
router.put('/:id', validate(updateTicketSchema), supportController.updateTicket);
router.post('/:id/summarize', supportController.summarizeTicket);
module.exports = router;
