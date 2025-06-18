const db = require('../config/database'); // <- já exportando com .promise()

// 🔹 Buscar todos os atendimentos
exports.getTodosAtendimentos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM atendimentos ORDER BY data_hora DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar atendimentos:', err);
        res.status(500).json({ erro: 'Erro ao buscar atendimentos' });
    }
};

// 🔹 Criar um novo atendimento
exports.criarAtendimento = async (req, res) => {
    const {
        departamento_destino,
        diretoria,
        atendente,
        solicitante,
        assunto,
        data_hora,
        data_hora_fim,
        canal,
        observacoes
    } = req.body;

    if (!departamento_destino || !atendente || !solicitante || !assunto || !data_hora || !canal) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }

    const sql = `
        INSERT INTO atendimentos (
            departamento_destino,
            diretoria,
            atendente,
            solicitante,
            assunto,
            data_hora,
            data_hora_fim,
            canal,
            observacoes,
            situacao,
            data_criado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Agendado', NOW())
        RETURNING id
    `;

    try {
        const result = await db.query(sql, [
            departamento_destino,
            diretoria || null,
            atendente,
            solicitante,
            assunto,
            data_hora,
            data_hora_fim || null,
            canal,
            observacoes || ''
        ]);

        res.json({ id: result.rows[0].id, mensagem: 'Atendimento criado com sucesso' });
    } catch (err) {
        console.error('Erro ao inserir atendimento:', err);
        res.status(500).json({ erro: 'Erro ao salvar atendimento' });
    }
};



// 🔹 Atualizar atendimento
exports.editarAtendimento = async (req, res) => {
    const id = req.params.id;
    const {
        departamento_destino,
        diretoria,
        atendente,
        solicitante,
        assunto,
        data_hora,
        data_hora_fim,
        canal,
        observacoes
    } = req.body;

    const sql = `
    UPDATE atendimentos 
    SET departamento_destino = $1, diretoria = $2, atendente = $3, solicitante = $4, assunto = $5, 
        data_hora = $6, data_hora_fim = $7, situacao = $8, canal = $9, observacoes = $10
    WHERE id = $11
`;

    try {
        await db.query(sql, [
            departamento_destino,
            diretoria,
            atendente,
            solicitante,
            assunto,
            data_hora,
            data_hora_fim,
            'Agendado',
            canal,
            observacoes,
            id
        ]);

        res.json({ mensagem: 'Atendimento atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar atendimento:', err);
        res.status(500).json({ erro: 'Erro ao atualizar atendimento' });
    }
};

// 🔹 Deletar atendimento
exports.deletarAtendimento = async (req, res) => {
    const id = req.params.id;

    try {
        await db.query('DELETE FROM atendimentos WHERE id = $1', [id]);
        res.json({ mensagem: 'Atendimento removido com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar atendimento:', err);
        res.status(500).json({ erro: 'Erro ao deletar atendimento' });
    }
};

// 🔹 Atualizar status + observações extras
exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    let { situacao, observacoes_extra, nome_usuario } = req.body;

    if (situacao === "Concluído") {
        situacao = "Agendado - Confirmado";
    } else if (situacao === "Cancelado") {
        situacao = "Cancelado";
    }

    const observacaoFormatada = observacoes_extra
        ? `\nMensagem enviada de ${nome_usuario || 'Usuário'}:\n${observacoes_extra}`
        : '';

    try {
        await db.query(
            `UPDATE atendimentos 
     SET situacao = $1, 
         observacoes = COALESCE(observacoes, '') || $2 
     WHERE id = $3`,
            [situacao, observacaoFormatada, id]
        );

        res.json({ mensagem: "Status atualizado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao atualizar atendimento:", erro);
        res.status(500).json({ erro: "Erro ao atualizar status do atendimento." });
    }
};

exports.obterResumo = async (req, res) => {
    let contador = 1;
    const { periodo, diretoria, situacao, funcao, loginDiretoria } = req.query;

    let filtro = '';
    const valores = [];

    // 🔹 Filtro por período — usando data_criado (APENAS NO RESUMO GERAL)
    if (periodo === '24h') filtro += ' AND data_criado >= NOW() - INTERVAL 1 DAY';
    else if (periodo === '7d') filtro += ' AND data_criado >= NOW() - INTERVAL 7 DAY';
    else if (periodo === '30d') filtro += ' AND data_criado >= NOW() - INTERVAL 30 DAY';
    else if (periodo === 'ano') {
        filtro += ' AND EXTRACT(YEAR FROM data_criado) = EXTRACT(YEAR FROM CURRENT_DATE)';
    }
    else if (periodo === 'anterior') {
        filtro += ' AND EXTRACT(YEAR FROM data_criado) = EXTRACT(YEAR FROM CURRENT_DATE) - 1';
    }

    else if (!isNaN(parseInt(periodo))) {
        filtro += ` AND EXTRACT(YEAR FROM data_criado) = $${contador}`;
        valores.push(parseInt(periodo));
        contador++;
    }

    // 🔹 Filtro por situação
    if (situacao) {
        filtro += ` AND situacao = $${contador}`;
        valores.push(situacao);
        contador++;
    }

    // 🔹 Filtro por perfil de usuário
    if (funcao !== 'administrativo') {
        if (funcao === 'diretorias' && loginDiretoria) {
            filtro += ` AND diretoria = $${contador}`;
            valores.push(loginDiretoria);
            contador++;
        } else if (funcao) {
            filtro += ` AND LOWER(departamento_destino) = $${contador}`;
            valores.push(funcao.toLowerCase());
            contador++;
        }
    } else if (diretoria) {
        filtro += ` AND diretoria = $${contador}`;
        valores.push(diretoria);
        contador++;
    }

    try {
        const result = await db.query(`
    SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN situacao = 'Agendado' THEN 1 ELSE 0 END) AS agendado,
        SUM(CASE WHEN situacao = 'Agendado - Confirmado' THEN 1 ELSE 0 END) AS confirmado,
        SUM(CASE WHEN situacao = 'Cancelado' THEN 1 ELSE 0 END) AS cancelado
    FROM atendimentos
    WHERE 1=1 ${filtro}
`, valores);

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao obter resumo:', err);
        res.status(500).json({ error: 'Erro ao gerar resumo' });
    }
};

// 🔥 Gráfico Temporal
exports.obterDistribuicaoPorData = async (req, res) => {
    let contador = 1;
    const { funcao, loginDiretoria, periodo } = req.query;

    let filtro = '';
    const valores = [];

    if (funcao !== 'administrativo') {
        if (funcao === 'diretorias' && loginDiretoria) {
            filtro += ` AND diretoria = $${contador}`;
            valores.push(loginDiretoria);
            contador++;
        } else if (funcao) {
            filtro += ` AND LOWER(departamento_destino) = $${contador}`;
            valores.push(funcao.toLowerCase());
            contador++;
        }
    }

    if (periodo === '1d') {
        filtro += ' AND data_criado >= NOW() - INTERVAL 1 DAY';
    } else if (periodo === '1s') {
        filtro += ' AND data_criado >= NOW() - INTERVAL 7 DAY';
    } else if (periodo === '1m') {
        filtro += ' AND data_criado >= NOW() - INTERVAL 1 MONTH';
    } else if (periodo === '1a') {
        filtro += ' AND data_criado >= NOW() - INTERVAL 1 YEAR';
    }

    try {
        const result = await db.query(`
            SELECT DATE(data_criado) AS dia, COUNT(*) AS total
            FROM atendimentos
            WHERE 1=1 ${filtro}
            GROUP BY dia
            ORDER BY dia
        `, valores);

        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao obter gráfico por data:', err);
        res.status(500).json({ error: 'Erro ao obter dados' });
    }
};









