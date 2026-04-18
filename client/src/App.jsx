import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './apiConfig';
import Navbar from './components/Navbar';
import AuthParams from './pages/AuthParams';
import Verification from './pages/Verification';
import DocumentVerification from './pages/DocumentVerification';
import Welcome from './pages/Welcome';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import OrganisationDashboard from './pages/OrganisationDashboard';
import OrganisationOnboarding from './pages/onboarding/OrganisationOnboarding';
import Stage1BasicDetails from './pages/onboarding/Stage1BasicDetails';
import Stage2RoleClaim from './pages/onboarding/Stage2RoleClaim';
import Stage3DocumentUpload from './pages/onboarding/Stage3DocumentUpload';
import Stage4DomainVerification from './pages/onboarding/Stage4DomainVerification';

// Helper: determine which page a user should be on
function getUserRoute(user) {
  if (!user) return '/login';
  if (!user.faceVerified) return '/verify';
  if (!user.documentVerified) return '/verify-document';
  if (!user.intent) return '/welcome';
  if (user.intent === 'organisation' && user.orgOnboardingStage < 5) {
    return `/onboarding/stage${user.orgOnboardingStage}`;
  }
  return `/dashboard/${user.intent}`;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
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
          
          {/* Welcome Screen */}
          <Route path="/welcome" element={
            user ? (user.faceVerified && user.documentVerified && !user.intent 
              ? <Welcome user={user} setUser={setUser} /> 
              : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />
          
          {/* Dashboards */}
          <Route path="/dashboard/professional" element={
            user ? (user.faceVerified && user.documentVerified && user.intent === 'professional' 
              ? <ProfessionalDashboard user={user} setUser={setUser} /> 
              : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />

          <Route path="/dashboard/organisation" element={
            user ? (user.faceVerified && user.documentVerified && user.intent === 'organisation' && user.orgOnboardingStage >= 3
              ? <OrganisationDashboard user={user} setUser={setUser} /> 
              : <Navigate to={target} />) 
                 : <Navigate to="/login" />
          } />

          {/* Organisation Onboarding Stages */}
          <Route path="/onboarding" element={<OrganisationOnboarding user={user} setUser={setUser} />}>
            <Route path="stage1" element={
              user?.orgOnboardingStage === 1 ? <Stage1BasicDetails user={user} setUser={setUser} /> : <Navigate to={target} />
            } />
            <Route path="stage2" element={
              user?.orgOnboardingStage === 2 ? <Stage2RoleClaim user={user} setUser={setUser} /> : <Navigate to={target} />
            } />
            <Route path="stage3" element={
              user?.orgOnboardingStage === 3 ? <Stage3DocumentUpload user={user} setUser={setUser} /> : <Navigate to={target} />
            } />
            <Route path="stage4" element={
              user?.orgOnboardingStage === 4 ? <Stage4DomainVerification user={user} setUser={setUser} /> : <Navigate to={target} />
            } />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
