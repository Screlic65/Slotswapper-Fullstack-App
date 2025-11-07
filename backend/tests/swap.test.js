// Import necessary modules
const request = require('supertest');
const express = require('express');
const db = require('../db'); // Our database connection

// --- We need to build a minimal version of our app for testing ---
const app = express();
app.use(express.json()); // So our app can read JSON bodies in tests

// Import and use the routes we want to test
const authRoutes = require('../routes/auth');
const eventRoutes = require('../routes/events');
const swapRoutes = require('../routes/swap');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/swaps', swapRoutes);
// -----------------------------------------------------------------


// The main test suite for Swap Logic
describe('Swap API Endpoints', () => {

    // We'll store tokens and IDs here to use across different tests
    let userAToken, userBToken;
    let userAId, userBId;
    let userASlotId, userBSlotId;

    // beforeAll runs once before any tests in this file
    beforeAll(async () => {
        // Clean the tables to ensure a fresh start
        await db.query('DELETE FROM swap_requests');
        await db.query('DELETE FROM events');
        await db.query('DELETE FROM users');

        // 1. Create User A
        await request(app)
            .post('/api/auth/signup')
            .send({ name: 'User A', email: 'usera@test.com', password: 'password123' });

        // 2. Create User B
        await request(app)
            .post('/api/auth/signup')
            .send({ name: 'User B', email: 'userb@test.com', password: 'password123' });

        // 3. Log in User A to get their token
        const resA = await request(app)
            .post('/api/auth/login')
            .send({ email: 'usera@test.com', password: 'password123' });
        userAToken = resA.body.token;
        userAId = resA.body.user.id;

        // 4. Log in User B to get their token
        const resB = await request(app)
            .post('/api/auth/login')
            .send({ email: 'userb@test.com', password: 'password123' });
        userBToken = resB.body.token;
        userBId = resB.body.user.id;
    });
    
    // This test checks the setup and event creation
    it('should allow users to create and mark events as swappable', async () => {
        // User A creates an event
        const eventARes = await request(app)
            .post('/api/events')
            .set('x-auth-token', userAToken)
            .send({ title: 'User A Slot', startTime: '2025-12-01T10:00:00Z', endTime: '2025-12-01T11:00:00Z' });
        
        expect(eventARes.statusCode).toBe(201);
        expect(eventARes.body.status).toBe('BUSY');
        userASlotId = eventARes.body.id;

        // User B creates an event
        const eventBRes = await request(app)
            .post('/api/events')
            .set('x-auth-token', userBToken)
            .send({ title: 'User B Slot', startTime: '2025-12-02T14:00:00Z', endTime: '2025-12-02T15:00:00Z' });
        
        userBSlotId = eventBRes.body.id;

        // User A marks their event as swappable
        await request(app)
            .put(`/api/events/${userASlotId}`)
            .set('x-auth-token', userAToken)
            .send({ status: 'SWAPPABLE' });
        
        // User B marks their event as swappable
        await request(app)
            .put(`/api/events/${userBSlotId}`)
            .set('x-auth-token', userBToken)
            .send({ status: 'SWAPPABLE' });

        // Verify directly in the DB
        const eventAInDb = await db.query("SELECT status FROM events WHERE id = $1", [userASlotId]);
        expect(eventAInDb.rows[0].status).toBe('SWAPPABLE');
    });

    // This test checks the core swap request logic
    it('should allow User A to request a swap with User B', async () => {
        const res = await request(app)
            .post('/api/swaps/request')
            .set('x-auth-token', userAToken)
            .send({ mySlotId: userASlotId, theirSlotId: userBSlotId });

        expect(res.statusCode).toBe(201);
        expect(res.body.msg).toBe('Swap request created successfully.');

        // Verify both slots are now SWAP_PENDING in the DB
        const eventA = await db.query("SELECT status FROM events WHERE id = $1", [userASlotId]);
        const eventB = await db.query("SELECT status FROM events WHERE id = $1", [userBSlotId]);
        expect(eventA.rows[0].status).toBe('SWAP_PENDING');
        expect(eventB.rows[0].status).toBe('SWAP_PENDING');

        // Verify the swap_requests table has a new entry
        const swapRequest = await db.query("SELECT * FROM swap_requests WHERE requester_slot_id = $1", [userASlotId]);
        expect(swapRequest.rows.length).toBe(1);
        expect(swapRequest.rows[0].status).toBe('PENDING');
    });

    // This is the most complex test: responding to the swap
    it('should allow User B to accept the swap, updating ownership', async () => {
        // First, find the request ID
        const swapRequest = await db.query("SELECT id FROM swap_requests WHERE requester_slot_id = $1", [userASlotId]);
        const requestId = swapRequest.rows[0].id;

        // User B accepts the request
        const res = await request(app)
            .post(`/api/swaps/response/${requestId}`)
            .set('x-auth-token', userBToken)
            .send({ accept: true });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toContain('Swap accepted');
        
        // --- VERIFY THE TRANSACTION ---
        // 1. Get the updated events from the DB
        const slotA = await db.query("SELECT user_id, status FROM events WHERE id = $1", [userASlotId]);
        const slotB = await db.query("SELECT user_id, status FROM events WHERE id = $1", [userBSlotId]);

        // 2. Check that owners have been swapped
        expect(slotA.rows[0].user_id).toBe(userBId); // Slot A should now belong to User B
        expect(slotB.rows[0].user_id).toBe(userAId); // Slot B should now belong to User A
        
        // 3. Check that statuses are reset to BUSY
        expect(slotA.rows[0].status).toBe('BUSY');
        expect(slotB.rows[0].status).toBe('BUSY');
        
        // 4. Check that the swap request is marked as ACCEPTED
        const finalRequest = await db.query("SELECT status FROM swap_requests WHERE id = $1", [requestId]);
        expect(finalRequest.rows[0].status).toBe('ACCEPTED');
    });
});