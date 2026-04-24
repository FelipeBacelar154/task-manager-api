const taskService = require('../services/taskService');

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

async function getTasks(req, res) {
  const search = req.query.search || '';
  try {
    const tasks = await taskService.getAllTasks(req.userId, search);
    return success(res, tasks);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function createTask(req, res) {
  const { title, description, due_date, file_path } = req.body;

  if (!title || title.trim().length === 0)
    return error(res, 'Title is required');

  if (title.trim().length < 3)
    return error(res, 'Title must be at least 3 characters');

  try {
    const result = await taskService.createTask(req.userId, { title, description, due_date, file_path });
    return success(res, { message: 'Task created!', id: result.id }, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function updateTask(req, res) {
  const { title, description, status, due_date, file_path } = req.body;
  const { id } = req.params;

  if (!title || title.trim().length === 0)
    return error(res, 'Title is required');

  const validStatuses = ['pending', 'done'];
  if (status && !validStatuses.includes(status))
    return error(res, 'Invalid status');

  try {
    await taskService.updateTask(req.userId, id, { title, description, status, due_date, file_path });
    return success(res, { message: 'Task updated!' });
  } catch (err) {
    const statusCode = err.message === 'Task not found' ? 404 : 500;
    return error(res, err.message, statusCode);
  }
}

async function deleteTask(req, res) {
  const { id } = req.params;

  try {
    await taskService.deleteTask(req.userId, id);
    return success(res, { message: 'Task deleted!' });
  } catch (err) {
    const statusCode = err.message === 'Task not found' ? 404 : 500;
    return error(res, err.message, statusCode);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };