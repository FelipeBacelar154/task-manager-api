const db = require('../config/database');

function getAllTasks(userId, search = '') {
  return new Promise((resolve, reject) => {
    const query = search
      ? `SELECT * FROM tasks WHERE user_id = ? AND title LIKE ? ORDER BY due_date ASC, created_at DESC`
      : `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC, created_at DESC`;

    const params = search ? [userId, `%${search}%`] : [userId];

    db.all(query, params, (err, tasks) => {
      if (err) reject(new Error('Error fetching tasks'));
      else resolve(tasks);
    });
  });
}

function createTask(userId, { title, description, due_date, file_path }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tasks (title, description, due_date, file_path, user_id) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), description, due_date || null, file_path || null, userId],
      function (err) {
        if (err) reject(new Error('Error creating task'));
        else resolve({ id: this.lastID });
      }
    );
  });
}

function updateTask(userId, taskId, { title, description, status, due_date, file_path }) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ?, file_path = ? WHERE id = ? AND user_id = ?',
      [title.trim(), description, status, due_date || null, file_path || null, taskId, userId],
      function (err) {
        if (err) reject(new Error('Error updating task'));
        else if (this.changes === 0) reject(new Error('Task not found'));
        else resolve({ updated: true });
      }
    );
  });
}

function deleteTask(userId, taskId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId],
      function (err) {
        if (err) reject(new Error('Error deleting task'));
        else if (this.changes === 0) reject(new Error('Task not found'));
        else resolve({ deleted: true });
      }
    );
  });
}

module.exports = { getAllTasks, createTask, updateTask, deleteTask };