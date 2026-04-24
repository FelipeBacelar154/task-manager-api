const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, generateToken } = require('../services/userService');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return error(res, 'All fields are required');

  if (name.trim().length < 2)
    return error(res, 'Name must be at least 2 characters');

  if (!isValidEmail(email))
    return error(res, 'Invalid email address');

  if (password.length < 6)
    return error(res, 'Password must be at least 6 characters');

  try {
    const result = await createUser(name, email, password);
    return success(res, { message: 'Account created successfully', id: result.id }, 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return error(res, 'Email and password are required');

  if (!isValidEmail(email))
    return error(res, 'Invalid email address');

  try {
    const user = await findUserByEmail(email);

    if (!user)
      return error(res, 'User not found', 404);

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return error(res, 'Incorrect password', 401);

    const token = generateToken(user);
    return success(res, { token, name: user.name });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { register, login };