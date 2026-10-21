const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const bookingCtrl = require('../controllers/bookingController');

router.post('/', protect, role('User','Manager','Admin'), bookingCtrl.book);
router.get('/my', protect, bookingCtrl.getMy);
router.get('/movie/:id/seats', protect, bookingCtrl.getTakenSeats);
router.get('/', protect, role('Admin','Manager'), bookingCtrl.getAllBookings);
router.put('/cancel/:id', protect, bookingCtrl.cancelBooking);

module.exports = router;
