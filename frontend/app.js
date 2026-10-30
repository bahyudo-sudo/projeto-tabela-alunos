// 1. MAPEAMENTO DOS ELEMENTOS DO DOM
const formCurso = document.getElementById('form-curso');
const inputCursoNome = document.getElementById('curso-nome');
const inputCursoCarga = document.getElementById('curso-carga');
const selectCursoTurno = document.getElementById('curso-turno');
const tabelaCursos = document.getElementById('tabela-cursos');

const formAluno = document.getElementById('form-aluno');
const inputAlunoNome = document.getElementById('aluno-nome');
const inputAlunoRa = document.getElementById('aluno-ra');
const inputAlunoEmail = document.getElementById('aluno-email');
const inputAlunoTel = document.getElementById('aluno-telefone');
const inputAlunoNasc = document.getElementById('aluno-nascimento');
const selectAlunoCurso = document.getElementById('aluno-curso');
const tabelaAlunos = document.getElementById('tabela-alunos');

const statusAlunos = document.getElementById('alunos-status');
const sentinelaAlunos = document.getElementById('sentinela-alunos');

// Elementos do Modal de Edição
const modal = document.getElementById('modal');
const modalFundo = document.getElementById('modal-fundo');
const btnCancelar = document.getElementById('btn-cancelar');
const formEdicao = document.getElementById('form-edicao');
const editNome = document.getElementById('edit-nome');
const editRa = document.getElementById('edit-ra');
const editEmail = document.getElementById('edit-email');
const editCurso = document.getElementById('edit-curso');

// 2. VARIÁVEIS DE CONTROLE DE ROLAGEM / PAGINAÇÃO
const ALUNOS_POR_PAGINA = 5;
let alunosInicio = 0;
let alunosTotal = 0;
let alunosCarregando = false;
let alunosTemMais = true;

// 3. FUNÇÕES DE CURSOS

async function listarCursos() {
  try {
    const resposta = await fetch('/cursos');
    const cursos = await resposta.json();

    if (!resposta.ok) throw new Error(cursos.erro || 'Erro ao carregar cursos');

    selectAlunoCurso.innerHTML = '<option value="">Selecione um Curso</option>';
    
    if (cursos.length === 0) {
      tabelaCursos.innerHTML = '<tr><td colspan="4">Nenhum curso registrado.</td></tr>';
      return;
    }

    tabelaCursos.innerHTML = '';
    cursos.forEach((curso) => {
      selectAlunoCurso.appendChild(new Option(curso.nome, curso.id));

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${curso.nome}</td>
        <td>${curso.carga || '-'} h</td>
        <td>${curso.turno || '-'}</td>
        <td>
          <button type="button" onclick="excluirCurso(${curso.id})">Excluir</button>
        </td>
      `;
      tabelaCursos.appendChild(tr);
    });
  } catch (erro) {
    tabelaCursos.innerHTML = `<tr><td colspan="4" style="color:red">${erro.message}</td></tr>`;
  }
}

async function salvarCurso(evento) {
  evento.preventDefault();

  const novoCurso = {
    nome: inputCursoNome.value.trim(),
    carga: Number(inputCursoCarga.value),
    turno: selectCursoTurno.value
  };

  try {
    const resposta = await fetch('/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoCurso)
    });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao salvar curso');

    formCurso.reset();
    await listarCursos();
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirCurso(id) {
  if (!confirm('Deseja realmente excluir este curso?')) return;

  try {
    const resposta = await fetch(`/cursos/${id}`, { method: 'DELETE' });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao excluir curso');

    await listarCursos();
  } catch (erro) {
    alert(erro.message);
  }
}

// 4. FUNÇÕES DE ALUNOS (COM TABELA DINÂMICA)

async function listarAlunos(acrescentar = false) {
  if (acrescentar && (alunosCarregando || !alunosTemMais)) return;

  alunosCarregando = true;

  if (!acrescentar) {
    alunosInicio = 0;
    tabelaAlunos.innerHTML = '';
    statusAlunos.textContent = 'Carregando...';
  }

  try {
    const url = `/alunos?inicio=${alunosInicio}&limite=${ALUNOS_POR_PAGINA}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao carregar alunos');

    const lista = dados.alunos || [];
    alunosTotal = dados.total || 0;

    if (lista.length === 0 && !acrescentar) {
      tabelaAlunos.innerHTML = '<tr><td colspan="5">Nenhum aluno registrado.</td></tr>';
      statusAlunos.textContent = '';
      alunosTemMais = false;
      return;
    }

    lista.forEach((aluno) => {
      const tr = document.createElement('tr');
      const alunoJson = JSON.stringify(aluno).replace(/'/g, "&apos;");
      tr.innerHTML = `
        <td>${aluno.nome}</td>
        <td>${aluno.ra}</td>
        <td>${aluno.email || '-'}</td>
        <td>${aluno.curso ? aluno.curso.nome : '-'}</td>
        <td>
          <button type="button" onclick='abrirModalEditar(${alunoJson})'>Editar</button>
          <button type="button" onclick="excluirAluno('${aluno.ra}')">Excluir</button>
        </td>
      `;
      tabelaAlunos.appendChild(tr);
    });

    alunosInicio += lista.length;
    alunosTemMais = alunosInicio < alunosTotal;

    if (alunosTemMais) {
      statusAlunos.textContent = `Mostrando ${alunosInicio} de ${alunosTotal}. Role a tela para carregar mais.`;
    } else {
      statusAlunos.textContent = `Mostrando ${alunosTotal} de ${alunosTotal}. Fim da lista.`;
    }
  } catch (erro) {
    statusAlunos.textContent = 'Erro ao carregar alunos.';
  } finally {
    alunosCarregando = false;
  }
}

async function salvarAluno(evento) {
  evento.preventDefault();

  const novoAluno = {
    nome: inputAlunoNome.value.trim(),
    ra: inputAlunoRa.value.trim(),
    email: inputAlunoEmail.value.trim(),
    telefone: inputAlunoTel.value.trim(),
    nascimento: inputAlunoNasc.value,
    curso_id: Number(selectAlunoCurso.value)
  };

  try {
    const resposta = await fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoAluno)
    });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao salvar aluno');

    formAluno.reset();
    await listarAlunos(false);
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirAluno(ra) {
  if (!confirm(`Deseja excluir o aluno com RA ${ra}?`)) return;

  try {
    const resposta = await fetch(`/alunos/${encodeURIComponent(ra)}`, { method: 'DELETE' });
    const dados = await resposta.json();

    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao excluir aluno');

    await listarAlunos(false);
  } catch (erro) {
    alert(erro.message);
  }
}

// 5. FUNÇÕES DO MODAL (EDIÇÃO PUT)

function abrirModalEditar(aluno) {
  editNome.value = aluno.nome;
  editRa.value = aluno.ra;
  editEmail.value = aluno.email || '';
  
  editCurso.innerHTML = selectAlunoCurso.innerHTML;
  editCurso.value = aluno.curso_id;

  modal.hidden = false;
}

function fecharModal() {
  modal.hidden = true;
  formEdicao.reset();
}

async function salvarEdicaoAluno(evento) {
  evento.preventDefault();

  const ra = editRa.value;
  const dadosAtualizados = {
    nome: editNome.value.trim(),
    email: editEmail.value.trim(),
    curso_id: Number(editCurso.value)
  };

  try {
    const resposta = await fetch(`/alunos/${encodeURIComponent(ra)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    });

    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || 'Erro ao atualizar aluno');

    fecharModal();
    await listarAlunos(false);
  } catch (erro) {
    alert(erro.message);
  }
}

// 6. DETECÇÃO DE ROLAGEM DA TELA
function verificarRolagem() {
  if (!sentinelaAlunos) return;
  const posicao = sentinelaAlunos.getBoundingClientRect().top;
  if (posicao < window.innerHeight + 100) {
    listarAlunos(true);
  }
}

// 7. INICIALIZAÇÃO E EVENTOS
function iniciar() {
  formCurso.addEventListener('submit', salvarCurso);
  formAluno.addEventListener('submit', salvarAluno);
  
  btnCancelar.addEventListener('click', fecharModal);
  modalFundo.addEventListener('click', fecharModal);
  formEdicao.addEventListener('submit', salvarEdicaoAluno);

  window.addEventListener('scroll', verificarRolagem);
  window.addEventListener('resize', verificarRolagem);

  listarCursos();
  listarAlunos(false);
}

iniciar();