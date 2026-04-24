const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function createUser(name, email, password) {
  return new Promise((resolve, reject) => {
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashedPassword],
      function (err) {
        if (err) reject(new Error('Email already registered'));
        else resolve({ id: this.lastID });
      }
    );
  });
}

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
      if (err) reject(new Error('Database error'));
      else resolve(user);
    });
  });
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

module.exports = { createUser, findUserByEmail, generateToken };