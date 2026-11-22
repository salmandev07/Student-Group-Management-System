const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');


router.use(protect, authorize('admin'));

router.get('/overview', adminController.overview);
router.get('/analytics', adminController.analytics);
router.get('/groups', adminController.allGroups);
router.get('/students', adminController.allStudents);

module.exports = router;
