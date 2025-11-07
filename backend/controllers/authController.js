const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Save the new user to the database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [name, email, passwordHash]
    );

    // 4. Respond with success (we won't log them in automatically here)
    res.status(201).json({
      message: 'User created successfully!',
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Does the user exist?
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // If no user, it returns an error. This is OK.
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    // 2. Does the password match?
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // If password doesn't match, it returns an error. This is OK.
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // 3. If everything is OK, it creates the token.
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' }, (err, token) => {
      if (err) throw err; // If JWT signing fails, it would crash (unlikely)

      // 4. This is the success response!
      res.json({ token, user: { id: user.id, name: user.name } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};