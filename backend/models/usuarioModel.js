const db = require('../config/database');
const camposPermitidos = ['nome', 'cpf', 'funcao', 'diretoria'];

exports.getTodos = async () => {
  const result = await db.query('SELECT * FROM usuarios ORDER BY id DESC');
  return result.rows;
};

exports.criar = async (usuario) => {
  const { nome, cpf, funcao, diretoria } = usuario;
  await db.query(
    'INSERT INTO usuarios (nome, cpf, funcao, diretoria) VALUES ($1, $2, $3, $4)',
    [nome, cpf, funcao, diretoria]
  );
};

exports.atualizar = async (id, campo, valor) => {
  if (!camposPermitidos.includes(campo)) {
    throw new Error('Campo inválido');
  }

  const query = `UPDATE usuarios SET ${campo} = $1 WHERE id = $2 RETURNING *`;
  const result = await db.query(query, [valor, id]);

  return result.rows[0]; // Retorna o usuário atualizado
};


exports.deletar = async (id) => {
  await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
};
