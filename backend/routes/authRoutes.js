const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Login via CPF
router.post('/login', async (req, res) => {
  const { cpf } = req.body;

 try {
    const [results] = await db.query('SELECT nome, funcao, diretoria FROM usuarios WHERE cpf = ?', [cpf]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'CPF não encontrado' });
    }

    const user = results[0];
    req.session.user = {
      nome: user.nome,
      funcao: user.funcao
    };

    res.json({
      success: true,
      nome: user.nome,
      funcao: user.funcao,
      diretoria: user.diretoria
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
