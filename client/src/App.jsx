import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthParams from './pages/AuthParams';
import Verification from './pages/Verification';
import DocumentVerification from './pages/DocumentVerification';
import Dashboard from './pages/Dashboard';

// Helper: determine which page a user should be on
function getUserRoute(user) {
  if (!user) return '/login';
  if (!user.faceVerified) return '/verify';
  if (!user.documentVerified) return '/verify-document';
  return '/dashboard';
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div style={{display:'flex', justifyContent:'center', marginTop:'20vh'}}>Loading TrustLink...</div>;
  }

  const target = getUserRoute(user);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Navigate to={target} />} />
          
          <Route path="/login" element={
            !user ? <AuthParams type="login" setUser={setUser} /> : <Navigate to={target} />
          } />
          <Route path="/signup" element={
            !user ? <AuthParams type="signup" setUser={setUser} /> : <Navigate to={target} />
          } />
          
          {/* Step 1: Face Verification */}
          <Route path="/verify" element={
            user ? (!user.faceVerified ? <Verification user={user} setUser={setUser} /> : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />

          {/* Step 2: Document Verification */}
          <Route path="/verify-document" element={
            user ? (user.faceVerified && !user.documentVerified 
              ? <DocumentVerification user={user} setUser={setUser} /> 
              : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />
          
          {/* Dashboard (only for fully verified users) */}
          <Route path="/dashboard" element={
            user ? (user.isVerified ? <Dashboard user={user} /> : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
