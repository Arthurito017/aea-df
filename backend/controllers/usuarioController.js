const Usuario = require('../models/usuarioModel');

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getTodos();
    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

exports.criarUsuario = async (req, res) => {
  const { nome, cpf, funcao, diretoria } = req.body;

  if (!nome || !cpf || !funcao) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  const dados = {
    nome,
    cpf,
    funcao,
    diretoria: funcao === 'diretorias' ? diretoria : null
  };

  try {
    await Usuario.criar(dados);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

exports.atualizarCampo = async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const camposPermitidos = ['nome', 'cpf', 'funcao', 'diretoria'];
  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: 'Campo inválido.' });
  }

  try {
    await Usuario.atualizar(id, campo, valor);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar.' });
  }
};

exports.removerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await Usuario.deletar(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
};
