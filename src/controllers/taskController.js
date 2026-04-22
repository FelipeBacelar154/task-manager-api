const db = require('../config/database');

function getTasks(req, res) {
  db.all('SELECT * FROM tasks WHERE user_id = ?', [req.userId], (err, tasks) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar tarefas' });
    return res.json(tasks);
  });
}

function createTask(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Título obrigatório' });

  db.run(
    'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar tarefa' });
      return res.status(201).json({ message: 'Tarefa criada!', id: this.lastID });
    }
  );
}

function updateTask(req, res) {
  const { title, description, status } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
    [title, description, status, id, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      return res.json({ message: 'Tarefa atualizada!' });
    }
  );
}

function deleteTask(req, res) {
  const { id } = req.params;

  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [id, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar tarefa' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });
      return res.json({ message: 'Tarefa deletada!' });
    }
  );
}

module.exports = { getTasks, createTask, updateTask, deleteTask };