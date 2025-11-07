import React, { useState } from 'react';

const EventForm = ({ onEventCreated }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onEventCreated({ title, startTime, endTime });
        setTitle('');
        setStartTime('');
        setEndTime('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Create New Event</h3>
            <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            <button type="submit">Add Event</button>
        </form>
    );
};

export default EventForm;