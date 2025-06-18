const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

router.get('/', atendimentoController.getTodosAtendimentos);
router.post('/', atendimentoController.criarAtendimento);
router.put('/:id', atendimentoController.editarAtendimento);
router.delete('/:id', atendimentoController.deletarAtendimento);
router.get('/resumo', atendimentoController.obterResumo);
router.get('/grafico-data', atendimentoController.obterDistribuicaoPorData);


module.exports = router;
    