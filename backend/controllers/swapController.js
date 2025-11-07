const { initSocket } = require('../middleware/socketMiddleware'); // We don't need this here
const db = require('../db');

// This function is correct and does not need changes.
exports.getSwappableSlots = async (req, res) => {
  try {
    const slots = await db.query(
      `SELECT events.id, events.title, events.start_time, events.end_time, users.name as owner_name 
       FROM events 
       JOIN users ON events.user_id = users.id 
       WHERE events.status = 'SWAPPABLE' AND events.user_id != $1`,
      [req.user.id]
    );
    res.json(slots.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// This function is also correct now.
exports.createSwapRequest = async (req, res) => {
    const mySlotId = parseInt(req.body.mySlotId, 10);
    const theirSlotId = parseInt(req.body.theirSlotId, 10);
    const requesterUserId = req.user.id;
    if (isNaN(mySlotId) || isNaN(theirSlotId)) {
        return res.status(400).json({ msg: "Invalid slot ID provided." });
    }
    try {
        const slotsResult = await db.query("SELECT id, user_id, status FROM events WHERE id = $1 OR id = $2", [mySlotId, theirSlotId]);
        const mySlot = slotsResult.rows.find(s => s.id === mySlotId);
        const theirSlot = slotsResult.rows.find(s => s.id === theirSlotId);
        if (!mySlot || !theirSlot) {
            return res.status(404).json({ msg: "One or both slots could not be found." });
        }
        if (mySlot.user_id !== requesterUserId || mySlot.status !== 'SWAPPABLE') {
            return res.status(400).json({ msg: "Your selected slot is not valid or not swappable." });
        }
        if (theirSlot.status !== 'SWAPPABLE') {
            return res.status(400).json({ msg: "The desired slot is no longer available for swapping." });
        }
        await db.query("INSERT INTO swap_requests (requester_slot_id, requested_slot_id) VALUES ($1, $2)", [mySlotId, theirSlotId]);
        await db.query("UPDATE events SET status = 'SWAP_PENDING' WHERE id = $1 OR id = $2", [mySlotId, theirSlotId]);
        
        
        console.log('--- SENDING REAL-TIME NOTIFICATION ---');
        const targetUserId = theirSlot.user_id;
        console.log(`Target User ID for notification: ${targetUserId}`);

        // Log the entire onlineUsers map at the moment of sending
        console.log(`Current online users map: ${JSON.stringify(req.onlineUsers, null, 2)}`);

        const targetSocketId = req.onlineUsers[targetUserId];

        if (targetSocketId) {
            console.log(`SUCCESS: Found target socket ID: ${targetSocketId}. Emitting 'new_request'...`);
            req.io.to(targetSocketId).emit('new_request', { message: `You have a new swap request!` });
        } else {
            // This is the most important log for debugging
            console.log(`INFO: Target User ID ${targetUserId} is not currently online. No notification sent.`);
        }

        res.status(201).json({ msg: "Swap request created successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// *** THIS IS THE CORRECTED FUNCTION ***
exports.getSwapRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    // The query now uses distinct aliases (req_user, res_user) for the two joins to the users table.
    // This resolves the "table name specified more than once" error.
    const query = `
      SELECT
        sr.id, sr.status,
        req_event.id AS requester_slot_id,
        req_event.title AS requester_slot_title,
        req_user.id AS requester_id,
        req_user.name AS requester_name,
        res_event.id AS requested_slot_id,
        res_event.title AS requested_slot_title,
        res_user.id AS requested_id,
        res_user.name AS requested_name
      FROM swap_requests sr
      JOIN events AS req_event ON sr.requester_slot_id = req_event.id
      JOIN users AS req_user ON req_event.user_id = req_user.id
      JOIN events AS res_event ON sr.requested_slot_id = res_event.id
      JOIN users AS res_user ON res_event.user_id = res_user.id
      WHERE sr.status = 'PENDING' AND (req_user.id = $1 OR res_user.id = $1)
    `;
    const { rows } = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching swap requests:", err.message);
    res.status(500).send('Server Error');
  }
};

// This function is correct and does not need changes.
exports.respondToSwapRequest = async (req, res) => {
    const { requestId } = req.params;
    const { accept } = req.body;
    const currentUserId = req.user.id;
    try {
        const requestResult = await db.query(
            `SELECT sr.requester_slot_id, sr.requested_slot_id, e.user_id
             FROM swap_requests sr JOIN events e ON sr.requested_slot_id = e.id
             WHERE sr.id = $1 AND sr.status = 'PENDING'`,
            [requestId]
        );
        if (requestResult.rows.length === 0) {
            return res.status(404).json({ msg: "Request not found or already handled." });
        }
        if (requestResult.rows[0].user_id !== currentUserId) {
            return res.status(403).json({ msg: "You are not authorized to respond to this request." });
        }
        const { requester_slot_id, requested_slot_id } = requestResult.rows[0];
        const requesterSlotOwnerResult = await db.query('SELECT user_id FROM events WHERE id = $1', [requester_slot_id]);
        const originalRequesterId = requesterSlotOwnerResult.rows[0].user_id;

        if (accept) {
            const requestedSlotOwnerResult = await db.query('SELECT user_id FROM events WHERE id = $1', [requested_slot_id]);
            const requesterOwnerId = originalRequesterId;
            const requestedOwnerId = requestedSlotOwnerResult.rows[0].user_id;
            await db.query('UPDATE events SET user_id = $1 WHERE id = $2', [requestedOwnerId, requester_slot_id]);
            await db.query('UPDATE events SET user_id = $1 WHERE id = $2', [requesterOwnerId, requested_slot_id]);
            await db.query("UPDATE events SET status = 'BUSY' WHERE id = $1 OR id = $2", [requester_slot_id, requested_slot_id]);
            await db.query("UPDATE swap_requests SET status = 'ACCEPTED' WHERE id = $1", [requestId]);
            
            const targetSocketId = req.onlineUsers[originalRequesterId];
            if (targetSocketId) {
                req.io.to(targetSocketId).emit('request_response', { message: 'Your swap request was ACCEPTED!' });
            }
            res.json({ msg: "Swap accepted successfully. Calendars updated." });
        } else {
            await db.query("UPDATE events SET status = 'SWAPPABLE' WHERE id = $1 OR id = $2", [requester_slot_id, requested_slot_id]);
            await db.query("UPDATE swap_requests SET status = 'REJECTED' WHERE id = $1", [requestId]);
            
            const targetSocketId = req.onlineUsers[originalRequesterId];
            if (targetSocketId) {
                req.io.to(targetSocketId).emit('request_response', { message: 'Your swap request was REJECTED.' });
            }
            res.json({ msg: "Swap rejected. Slots are now available again." });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};