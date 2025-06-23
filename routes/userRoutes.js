const express = require('express');
const router = express.Router();

const protect= require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { requestUpgrade, getUpgradeRequests, approveUpgrade } = require('../controllers/userController');

router.post('/upgrade/request', protect, authorize('renter'), requestUpgrade);
router.get('/upgrade/requests', protect, authorize('admin'), getUpgradeRequests);
router.put('/upgrade/approve/:id', protect, authorize('admin'), approveUpgrade);

module.exports = router;
