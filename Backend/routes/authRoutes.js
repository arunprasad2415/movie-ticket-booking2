const router = require('express').Router();
const { register, login, getAllUsers, getMe, updateMe, changePassword } = require('../controllers/authController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, changePassword);

router.get('/users', protect, role('Admin'), getAllUsers);

module.exports = router;
