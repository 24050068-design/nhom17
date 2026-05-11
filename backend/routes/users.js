const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// User - own profile
router.get('/me', auth, ctrl.getMe);
router.put('/me', auth, ctrl.updateMe);

// Admin
router.get('/', auth, admin, ctrl.getAllUsers);
router.get('/:id', auth, admin, ctrl.getUserById);
router.put('/:id/role', auth, admin, ctrl.updateUserRole);
router.delete('/:id', auth, admin, ctrl.deleteUser);

module.exports = router;
