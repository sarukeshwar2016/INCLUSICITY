import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for an active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, remember_me')
          .eq('email', session.user.email)
          .single();
        if (!error && userData?.remember_me) {
          setUser({ id: userData.id, email: userData.email });
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, remember_me')
          .eq('email', session.user.email)
          .single();
        if (!error && userData?.remember_me) {
          setUser({ id: userData.id, email: userData.email });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <div>Welcome, {user.id} ({user.email})!</div> : <LoginPage />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;