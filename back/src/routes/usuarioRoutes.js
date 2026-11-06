const router = require('express').Router();
const ctrl = require('../controllers/UsuarioController.js');
const autenticar = require('../middleware/auth.js');

router.use(autenticar);

router.get('/', ctrl.listarTodos);
router.get('/:id', ctrl.buscarPorId);

module.exports = router;
