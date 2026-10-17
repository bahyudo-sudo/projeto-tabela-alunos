require('dotenv').config();
const express = require('express');
const path = require('path');
const supabase = require('./supabase');

const app = express();
app.use(express.json());

// Servir ficheiros estáticos da pasta frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// --- ROTAS CURSOS ---
app.get('/api/cursos', async (req, res) => {
  const { data, error } = await supabase.from('cursos').select('*').order('nome');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/cursos', async (req, res) => {
  const { nome, carga_horaria, turno } = req.body;
  const { data, error } = await supabase
    .from('cursos')
    .insert([{ nome, carga_horaria, turno }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.delete('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('cursos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Curso removido com sucesso' });
});

// --- ROTAS ALUNOS ---
app.get('/api/alunos', async (req, res) => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*, cursos(nome)')
    .order('nome');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/alunos', async (req, res) => {
  const { nome, ra, email, telefone, data_nascimento, curso_id } = req.body;
  const { data, error } = await supabase
    .from('alunos')
    .insert([{ nome, ra, email, telefone, data_nascimento, curso_id }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.delete('/api/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('alunos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Aluno removido com sucesso' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});