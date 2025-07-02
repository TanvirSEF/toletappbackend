const express = require('express');
const router = express.Router();

const protect= require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { requestUpgrade, getUpgradeRequests, approveUpgrade, toggleFavorite, getFavorites } = require('../controllers/userController');

router.post('/upgrade/request', protect, authorize('renter'), requestUpgrade);
router.get('/upgrade/requests', protect, authorize('admin'), getUpgradeRequests);
router.put('/upgrade/approve/:id', protect, authorize('admin'), approveUpgrade);
router.post("/favorites/:propertyId", protect, authorize("renter"), toggleFavorite);
router.get("/favorites", protect, authorize("renter"), getFavorites);

module.exports = router;
