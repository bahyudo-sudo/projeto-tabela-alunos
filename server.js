require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const {
  inserirCurso,
  listarCursos,
  excluirCurso,
  inserirAluno,
  listarAlunos,
  buscarPorRa,
  atualizarAluno,
  excluirPorRa
} = require('./supabase');

const app = express();
const ERRO_CHAVE_ESTRANGEIRA = '23503';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// --- ROTAS DE CURSOS ---

app.get('/cursos', async (req, res) => {
  try {
    const dados = await listarCursos();
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/cursos', async (req, res) => {
  try {
    const { nome, carga, turno } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Campo obrigatório: nome' });
    const curso = await inserirCurso(nome, carga, turno);
    res.status(201).json(curso);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

app.delete('/cursos/:id', async (req, res) => {
  try {
    const dados = await excluirCurso(req.params.id);
    res.json(dados);
  } catch (e) {
    if (e.code === ERRO_CHAVE_ESTRANGEIRA) {
      return res.status(409).json({ erro: 'Não é possível excluir: este curso ainda tem alunos vinculados' });
    }
    res.status(400).json({ erro: e.message });
  }
});

// --- ROTAS DE ALUNOS ---

app.get('/alunos', async (req, res) => {
  try {
    const inicio = req.query.inicio !== undefined ? Number(req.query.inicio) : undefined;
    const limite = req.query.limite !== undefined ? Number(req.query.limite) : undefined;

    const dados = await listarAlunos(inicio, limite);
    res.json(dados);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/alunos/:ra', async (req, res) => {
  try {
    const aluno = await buscarPorRa(req.params.ra);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    res.json(aluno);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/alunos', async (req, res) => {
  try {
    const { nome, ra, email, telefone, nascimento, curso_id } = req.body;
    if (!nome || !ra || !curso_id) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, ra e curso_id' });
    }
    const aluno = await inserirAluno(nome, ra, email, telefone, nascimento, curso_id);
    res.status(201).json(aluno);
  } catch (e) {
    if (e.code === ERRO_CHAVE_ESTRANGEIRA) {
      return res.status(400).json({ erro: 'O curso informado não existe' });
    }
    res.status(400).json({ erro: e.message });
  }
});

app.put('/alunos/:ra', async (req, res) => {
  try {
    const { nome, email, curso_id } = req.body;
    const dados = await atualizarAluno(req.params.ra, { nome, email, curso_id });
    res.json(dados);
  } catch (e) {
    if (e.code === ERRO_CHAVE_ESTRANGEIRA) {
      return res.status(400).json({ erro: 'O curso informado não existe' });
    }
    res.status(400).json({ erro: e.message });
  }
});

app.delete('/alunos/:ra', async (req, res) => {
  try {
    const dados = await excluirPorRa(req.params.ra);
    res.json(dados);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});