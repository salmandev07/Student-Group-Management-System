const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-progress', submissionController.myProgress);
router.post('/', submissionController.confirmSubmission);
router.get('/assignment/:assignmentId', submissionController.listForAssignment);
router.delete('/:assignmentId/:groupId', submissionController.withdrawSubmission);

module.exports = router;
