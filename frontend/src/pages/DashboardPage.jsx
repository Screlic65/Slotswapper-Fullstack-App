import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventForm from '../components/EventForm';
import './Dashboard.css'; // Import the new CSS file

const DashboardPage = () => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (eventData) => {
    try {
      const payload = {
          ...eventData,
          startTime: new Date(eventData.startTime).toISOString(),
          endTime: new Date(eventData.endTime).toISOString()
      };
      await api.post('/events', payload);
      fetchEvents();
    } catch (err) {
      console.error('Error creating event', err);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
        await api.put(`/events/${eventId}`, { status: newStatus });
        fetchEvents();
    } catch (err) {
        console.error('Failed to update event status', err);
    }
  };

  // Helper function for formatting time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
  };

  return (
    <div>
      <h1>Your Dashboard</h1>
      <div className="card" style={{ marginBottom: '2rem' }}>
         <EventForm onEventCreated={handleCreateEvent} />
      </div>
      
      <h2>Your Events</h2>
      <ul className="event-list">
        {events.length > 0 ? (
          events.map(event => {
            const startDate = new Date(event.start_time);
            
            return (
              <li key={event.id} className="card event-card">
                {/* --- LEFT SIDE: DATE BLOCK --- */}
                <div className="event-date">
                  <div className="event-day">
                    {startDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="event-date-number">
                    {startDate.getDate()}
                  </div>
                </div>

                {/* --- RIGHT SIDE: EVENT DETAILS --- */}
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-time">
                    {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    <br />
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </p>
                  <div className="event-actions">
                    <span className={`event-status status-${event.status}`}>
                      {event.status.replace('_', ' ')}
                    </span>
                    <div>
                      {event.status === 'BUSY' && (
                        <button onClick={() => handleStatusChange(event.id, 'SWAPPABLE')}>Make Swappable</button>
                      )}
                      {event.status === 'SWAPPABLE' && (
                        <button onClick={() => handleStatusChange(event.id, 'BUSY')}>Make Busy</button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <p>You have no events. Create one above to get started.</p>
        )}
      </ul>
    </div>
  );
};

export default DashboardPage;