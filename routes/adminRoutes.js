const express = require('express');
const router = express.Router();

const { createAdminUser } = require('../controllers/adminController');
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/create', protect, authorize('admin'), createAdminUser);

module.exports = router;
