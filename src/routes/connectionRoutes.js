const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  listConnections,
  listPendingRequests
} = require('../controllers/connectionController');

const router = express.Router();

router.use(protect); // All routes below are protected

router.get('/', listConnections);
router.get('/pending', listPendingRequests);

router.post('/send/:userId', sendConnectionRequest);
router.post('/accept/:userId', acceptConnectionRequest);
router.post('/reject/:userId', rejectConnectionRequest);
router.delete('/remove/:userId', removeConnection);

module.exports = router;
