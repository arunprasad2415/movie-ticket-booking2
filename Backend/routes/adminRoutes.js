const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const admin = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/authController');

router.use(protect, role('Admin'));
router.get('/users', getAllUsers);
router.post('/users', admin.createUser);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

module.exports = router;
