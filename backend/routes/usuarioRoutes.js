const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/usuarios', usuarioController.listarUsuarios);
router.post('/usuarios', usuarioController.criarUsuario);
router.put('/usuarios/:id', usuarioController.atualizarCampo);
router.delete('/usuarios/:id', usuarioController.removerUsuario);

module.exports = router;
