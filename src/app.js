const express = require('express');

const app = express();

app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

module.exports = app;