const router = require('express').Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const movieController = require('../controllers/movieController');

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);
router.post('/', protect, role('Admin', 'Manager'), movieController.addMovie);
router.put('/:id', protect, role('Admin', 'Manager'), movieController.updateMovie);
router.delete('/:id', protect, role('Admin', 'Manager'), movieController.deleteMovie);

module.exports = router;
