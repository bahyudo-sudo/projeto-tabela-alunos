require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLUNAS_ALUNO = 'id, nome, ra, email, telefone, nascimento, curso_id, criado_em, curso:cursos(id, nome)';

// --- CURSOS ---

async function inserirCurso(nome, carga, turno) {
  const { data, error } = await supabase
    .from('cursos')
    .insert([{ nome, carga, turno }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listarCursos() {
  const { data, error } = await supabase
    .from('cursos')
    .select('id, nome, carga, turno, alunos(count)')
    .order('nome', { ascending: true });
  if (error) throw error;

  return data.map((curso) => ({
    id: curso.id,
    nome: curso.nome,
    carga: curso.carga,
    turno: curso.turno,
    total_alunos: curso.alunos[0]?.count ?? 0
  }));
}

async function excluirCurso(id) {
  const { data, error } = await supabase
    .from('cursos')
    .delete()
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}

// --- ALUNOS ---

async function inserirAluno(nome, ra, email, telefone, nascimento, curso_id) {
  const { data, error } = await supabase
    .from('alunos')
    .insert([{ nome, ra, email, telefone, nascimento, curso_id }])
    .select(COLUNAS_ALUNO)
    .single();
  if (error) throw error;
  return data;
}

async function listarAlunos(inicio, limite) {
  let consulta = supabase
    .from('alunos')
    .select(COLUNAS_ALUNO, limite !== undefined ? { count: 'exact' } : undefined)
    .order('id', { ascending: true });

  if (limite !== undefined && inicio !== undefined) {
    consulta = consulta.range(inicio, inicio + limite - 1);
  }

  const { data, error, count } = await consulta;
  if (error) throw error;

  if (limite !== undefined) {
    return { alunos: data || [], total: count ?? 0 };
  }
  return data || [];
}

async function buscarPorRa(ra) {
  const { data, error } = await supabase
    .from('alunos')
    .select(COLUNAS_ALUNO)
    .eq('ra', ra)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function atualizarAluno(ra, { nome, email, curso_id }) {
  const campos = {};
  if (nome) campos.nome = nome;
  if (email) campos.email = email;
  if (curso_id) campos.curso_id = curso_id;

  const { data, error } = await supabase
    .from('alunos')
    .update(campos)
    .eq('ra', ra)
    .select(COLUNAS_ALUNO);
  if (error) throw error;
  return data;
}

async function excluirPorRa(ra) {
  const { data, error } = await supabase
    .from('alunos')
    .delete()
    .eq('ra', ra)
    .select();
  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  inserirCurso,
  listarCursos,
  excluirCurso,
  inserirAluno,
  listarAlunos,
  buscarPorRa,
  atualizarAluno,
  excluirPorRa
};