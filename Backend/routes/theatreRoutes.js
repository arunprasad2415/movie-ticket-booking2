const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const ctrl = require('../controllers/theatreController');

router.get('/', ctrl.getAllTheatres);
router.get('/:id', ctrl.getTheatre);
router.post('/', protect, role('Admin', 'Manager'), ctrl.createTheatre);
router.put('/:id', protect, role('Admin', 'Manager'), ctrl.updateTheatre);
router.delete('/:id', protect, role('Admin', 'Manager'), ctrl.deleteTheatre);

module.exports = router;
