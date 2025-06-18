// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Sessão para guardar o login do usuário
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// 📦 Rotas de atendimento
const atendimentoRoutes = require('./routes/atendimentoRoutes');
app.use('/api/atendimentos', atendimentoRoutes);

// 🔐 Rotas de autenticação (login por CPF)
const authRoutes = require('./routes/authRoutes'); // <- crie este arquivo
app.use('/api', authRoutes);


const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes); // ✅ monta como /api/usuarios
const atendimentoController = require('./controllers/atendimentoController');
app.put("/api/atendimentos/:id/status", atendimentoController.atualizarStatus);


// ✅ Rota base de verificação
app.get('/', (req, res) => {
  res.send('API da AEA-DF funcionando corretamente!');
});

// ▶️ Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// ✅ Servir o frontend por último
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));
