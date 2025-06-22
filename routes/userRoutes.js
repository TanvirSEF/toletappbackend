const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/authMiddleware');
const { requestUpgrade, getUpgradeRequests, approveUpgrade } = require('../controllers/userController');

router.post('/upgrade/request', protect, authorize('renter'), requestUpgrade);
router.get('/upgrade/requests', protect, authorize('admin'), getUpgradeRequests);
router.put('/upgrade/approve/:id', protect, authorize('admin'), approveUpgrade);

module.exports = router;
