const express = require('express');
const router = express.Router();
const inquiriesCtrl = require('../controllers/inquiriesController');

// Public routes (tidak perlu auth)
router.post('/', inquiriesCtrl.create);

// Admin routes (perlu auth)
router.get('/', inquiriesCtrl.getAll);
router.get('/unread-count', inquiriesCtrl.getUnreadCount);
router.get('/:id', inquiriesCtrl.getById);
router.put('/:id', inquiriesCtrl.update);
router.patch('/:id/mark-read', inquiriesCtrl.markAsRead);
router.delete('/:id', inquiriesCtrl.deleteInquiry);

module.exports = router;
