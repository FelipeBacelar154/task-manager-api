const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      return res.status(201).json({
        message: 'Usuário criado com sucesso!',
        id: this.lastID
      });
    }
  );
}

function login(req, res) {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'segredo',
      { expiresIn: '1d' }
    );

    return res.json({ token });
  });
}

module.exports = { register, login };