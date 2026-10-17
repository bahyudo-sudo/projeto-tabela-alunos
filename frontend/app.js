document.addEventListener('DOMContentLoaded', () => {
  carregarCursos();
  carregarAlunos();

  document.getElementById('form-curso').addEventListener('submit', cadastrarCurso);
  document.getElementById('form-aluno').addEventListener('submit', cadastrarAluno);
});

async function carregarCursos() {
  const res = await fetch('/api/cursos');
  const cursos = await res.json();

  const listaCursos = document.getElementById('lista-cursos');
  const selectCurso = document.getElementById('aluno-curso');

  listaCursos.innerHTML = '';
  selectCurso.innerHTML = '<option value="">Selecione um Curso</option>';

  cursos.forEach(curso => {
    const li = document.createElement('li');
    const carga = curso.carga_horaria ? `${curso.carga_horaria}h` : 'N/A';
    const turno = curso.turno || 'N/A';
    li.innerHTML = `
      <div>
        <strong>${curso.nome}</strong> <br>
        <small>Carga: ${carga} | Turno: ${turno}</small>
      </div>
      <button onclick="deletarCurso(${curso.id})">Excluir</button>
    `;
    listaCursos.appendChild(li);

    const option = document.createElement('option');
    option.value = curso.id;
    option.textContent = `${curso.nome} (${turno})`;
    selectCurso.appendChild(option);
  });
}

async function cadastrarCurso(e) {
  e.preventDefault();
  const nome = document.getElementById('curso-nome').value.trim();
  const carga_horaria = document.getElementById('curso-carga').value;
  const turno = document.getElementById('curso-turno').value;

  if (!nome || !carga_horaria || !turno) return;

  const res = await fetch('/api/cursos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, carga_horaria, turno })
  });

  if (res.ok) {
    document.getElementById('form-curso').reset();
    carregarCursos();
  } else {
    const err = await res.json();
    alert('Erro ao salvar curso: ' + err.error);
  }
}

async function deletarCurso(id) {
  if (!confirm('Deseja realmente excluir este curso?')) return;
  const res = await fetch(`/api/cursos/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarCursos();
    carregarAlunos();
  } else {
    const err = await res.json();
    alert('Erro ao excluir curso: ' + err.error);
  }
}

async function carregarAlunos() {
  const res = await fetch('/api/alunos');
  const alunos = await res.json();

  const listaAlunos = document.getElementById('lista-alunos');
  listaAlunos.innerHTML = '';

  alunos.forEach(aluno => {
    const li = document.createElement('li');
    const nomeCurso = aluno.cursos ? aluno.cursos.nome : 'Sem Curso';
    const email = aluno.email ? ` | ${aluno.email}` : '';
    const tel = aluno.telefone ? ` | Tel: ${aluno.telefone}` : '';
    const nascio = aluno.data_nascimento ? ` | Nasc: ${aluno.data_nascimento}` : '';

    li.innerHTML = `
      <div>
        <strong>${aluno.nome}</strong> (RA: ${aluno.ra})<br>
        <small>Curso: ${nomeCurso}${email}${tel}${nascio}</small>
      </div>
      <button onclick="deletarAluno(${aluno.id})">Excluir</button>
    `;
    listaAlunos.appendChild(li);
  });
}

async function cadastrarAluno(e) {
  e.preventDefault();
  const nome = document.getElementById('aluno-nome').value.trim();
  const ra = document.getElementById('aluno-ra').value.trim();
  const email = document.getElementById('aluno-email').value.trim();
  const telefone = document.getElementById('aluno-telefone').value.trim();
  const data_nascimento = document.getElementById('aluno-nascimento').value;
  const curso_id = document.getElementById('aluno-curso').value;

  if (!nome || !ra || !curso_id) return;

  const res = await fetch('/api/alunos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, ra, email, telefone, data_nascimento, curso_id })
  });

  if (res.ok) {
    document.getElementById('form-aluno').reset();
    carregarAlunos();
  } else {
    const err = await res.json();
    alert('Erro ao salvar aluno: ' + err.error);
  }
}

async function deletarAluno(id) {
  if (!confirm('Deseja realmente excluir este aluno?')) return;
  const res = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
  if (res.ok) {
    carregarAlunos();
  } else {
    const err = await res.json();
    alert('Erro ao excluir aluno: ' + err.error);
  }
}