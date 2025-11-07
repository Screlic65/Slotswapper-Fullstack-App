import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SwapRequestModal from '../components/SwapRequestModal';

const MarketplacePage = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchSwappableSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/swaps/available');
      setSwappableSlots(res.data);
    } catch (err) {
      console.error("Error fetching swappable slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwappableSlots();
  }, []);

  const handleOpenModal = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleSwapRequested = async ({ mySlotId, theirSlotId }) => {
    try {
      await api.post('/swaps/request', { mySlotId, theirSlotId });
      alert('Swap request sent successfully!');
      handleCloseModal();
      fetchSwappableSlots();
    } catch (err) {
      console.error('Failed to send swap request:', err);
      alert(err.response?.data?.msg || 'An error occurred.');
    }
  };

  if (loading) return <div>Loading available slots...</div>;

  return (
    <div>
      <h1>Marketplace</h1>
      <p>Here are all the slots available for swapping from other users.</p>
      <hr />
      <div>
        {swappableSlots.length > 0 ? (
          swappableSlots.map(slot => (
            <div key={slot.id} classname="card">
              <h3>{slot.title}</h3>
              <p><strong>Owner:</strong> {slot.owner_name}</p>
              <p><strong>Time:</strong> {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}</p>
              <button onClick={() => handleOpenModal(slot)}>Request Swap</button>
            </div>
          ))
        ) : (
          <p>No swappable slots are available right now.</p>
        )}
      </div>

      {isModalOpen && (
        <SwapRequestModal
          theirSlot={selectedSlot}
          onClose={handleCloseModal}
          onSwapRequested={handleSwapRequested}
        />
      )}
    </div>
  );
};

export default MarketplacePage;