import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Modal.css';

const SwapRequestModal = ({ theirSlot, onClose, onSwapRequested }) => {
  const [mySlots, setMySlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // New state for error messages

  useEffect(() => {
    const fetchMySwappableSlots = async () => {
      try {
        setError(''); // Clear previous errors
        setLoading(true); // Set loading to true at the start
        const res = await api.get('/events?status=SWAPPABLE');
        setMySlots(res.data);
      } catch (err) {
        console.error("Failed to fetch user's swappable slots", err);
        // Set a user-friendly error message if the API call fails
        setError('Could not load your slots. Please try again later.');
      } finally {
        // This block ALWAYS runs, whether the try succeeds or fails.
        setLoading(false);
      }
    };
    fetchMySwappableSlots();
  }, []); // The empty dependency array means this runs only once.

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      alert("Please select one of your slots to offer.");
      return;
    }
    onSwapRequested({ mySlotId: selectedSlotId, theirSlotId: theirSlot.id });
  };

  // --- New Render Logic Function ---
  const renderContent = () => {
    if (loading) {
      return <p>Loading your slots...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    if (mySlots.length > 0) {
      return (
        <select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)} required>
          <option value="">-- Please choose a slot --</option>
          {mySlots.map(slot => (
            <option key={slot.id} value={slot.id}>{slot.title} ({new Date(slot.start_time).toLocaleString()})</option>
          ))}
        </select>
      );
    }
    // This is the key message for the user
    return <p>You have no swappable slots to offer. Go to your Dashboard to mark an event as "Swappable".</p>;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content card">
        <h2>Request a Swap</h2>
        <p>You want to acquire: <strong>{theirSlot.title}</strong></p>
        <hr />
        <form onSubmit={handleSubmit}>
          <label>Select one of your swappable slots to offer:</label>
          
          {renderContent()} {/* Call our new render function */}

          <div className="modal-actions">
            <button type="submit" disabled={mySlots.length === 0 || loading || error}>Confirm Swap Request</button>
            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal;