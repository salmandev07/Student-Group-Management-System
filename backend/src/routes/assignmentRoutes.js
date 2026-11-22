const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', assignmentController.listAssignments);
router.get('/:id', assignmentController.getAssignment);
router.post('/', authorize('admin'), assignmentController.createAssignment);
router.put('/:id', authorize('admin'), assignmentController.updateAssignment);
router.delete('/:id', authorize('admin'), assignmentController.deleteAssignment);

module.exports = router;
