const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', groupController.listMyGroups);
router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroup);
router.put('/:id', groupController.renameGroup);
router.delete('/:id', groupController.deleteGroup);
router.post('/:id/members', groupController.addMember);
router.delete('/:id/members/:userId', groupController.removeMember);

module.exports = router;
