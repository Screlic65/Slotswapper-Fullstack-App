const db = require('../db');

exports.getAllEvents = async (req, res) => {
  const { status } = req.query; // Check for a status query parameter
  let query = "SELECT id, title, start_time, end_time, status FROM events WHERE user_id = $1";
  const queryParams = [req.user.id];

  if (status) {
    query += " AND status = $2";
    queryParams.push(status);
  }
  query += " ORDER BY start_time ASC";

  try {
    const allEvents = await db.query(query, queryParams);
    res.json(allEvents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createEvent = async (req, res) => {
  const { title, startTime, endTime } = req.body;
  const userId = req.user.id;
  try {
    const newEvent = await db.query(
      "INSERT INTO events (user_id, title, start_time, end_time, status) VALUES ($1, $2, $3, $4, 'BUSY') RETURNING *",
      [userId, title, startTime, endTime]
    );
    res.status(201).json(newEvent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateEventStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const allowedStatus = ['BUSY', 'SWAPPABLE'];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status value.' });
  }
  try {
    const result = await db.query(
      "UPDATE events SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [status, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Event not found or user not authorized.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};