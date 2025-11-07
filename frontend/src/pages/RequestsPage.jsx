import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const RequestsPage = () => {
  // These state variables are correct.
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // This function is correct and will be reused.
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/swaps/requests');
      const allRequests = res.data;

      if (user) {
        setIncomingRequests(allRequests.filter(req => req.requested_id === user.id));
        setOutgoingRequests(allRequests.filter(req => req.requester_id === user.id));
      }

    } catch (err) {
      console.error("Error fetching swap requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This part fetches data when the page first loads.
    if (user) {
      fetchRequests();
    }

    // This is the part that listens for real-time updates.
    const handleRequestsUpdate = () => {
      console.log("RequestsPage heard the 'requestsUpdated' event. Refetching data now...");
      fetchRequests();
    };
    
    // Add the listener for the custom event broadcasted by the Navbar.
    window.addEventListener('requestsUpdated', handleRequestsUpdate);

    
    // we remove the listener to prevent errors and memory leaks.
    return () => {
      window.removeEventListener('requestsUpdated', handleRequestsUpdate);
    };
  }, [user]); // The dependency array ensures this sets up/cleans up correctly when the user logs in.

  // This function for manual responses is correct.
  const handleResponse = async (requestId, accept) => {
    try {
      setLoading(true); 
      await api.post(`/swaps/response/${requestId}`, { accept });
      await fetchRequests(); 
      const action = accept ? 'accepted' : 'rejected';
      alert(`Request successfully ${action}.`);
    } catch (err) {
      console.error("Error responding to request:", err);
      alert("Failed to respond to request.");
      setLoading(false);
    }
  };

  // The rendering logic is correct.
  if (!user) {
    return <div>Loading user data...</div>;
  }
  
  if (loading) {
    return <div>Loading your requests...</div>;
  }

  return (
    <div>
      <h1>Your Swap Requests</h1>

      <h2>Incoming Requests</h2>
      {incomingRequests.length > 0 ? (
        incomingRequests.map(req => (
          <div key={req.id} className="card">
            <p>
              <strong>{req.requester_name}</strong> wants to give you their slot: <br />
              <em>"{req.requester_slot_title}"</em>
            </p>
            <p>
              In exchange for your slot: <br />
              <em>"{req.requested_slot_title}"</em>
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleResponse(req.id, true)}>Accept</button>
              <button onClick={() => handleResponse(req.id, false)} className="button-secondary">Reject</button>
            </div>
          </div>
        ))
      ) : (
        <p>You have no incoming swap requests.</p>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h2>Outgoing Requests</h2>
      {outgoingRequests.length > 0 ? (
        outgoingRequests.map(req => (
          <div key={req.id} className="card">
            <p>
              You requested to swap your slot: <br />
              <em>"{req.requester_slot_title}"</em>
            </p>
            <p>
              For <strong>{req.requested_name}'s</strong> slot: <br />
              <em>"{req.requested_slot_title}"</em>
            </p>
            <p>Status: <span className="event-status status-SWAP_PENDING">{req.status}</span></p>
          </div>
        ))
      ) : (
        <p>You have no outgoing swap requests.</p>
      )}
    </div>
  );
};

export default RequestsPage;