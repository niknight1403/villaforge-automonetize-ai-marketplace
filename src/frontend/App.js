import React, { useState, useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const Dashboard = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/services').then(res => res.json()).then(setServices);
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      <h1>AI Marketplace Dashboard</h1>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      ) : (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={() => logout()}>Log Out</button>
          <section>
            <h2>Your Services</h2>
            <ul>{services.map(s => <li key={s.id}>{s.name}</li>)}</ul>
          </section>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Auth0Provider domain="dev-ai-marketplace.auth0.com" clientId="YOUR_CLIENT_ID" redirectUri={window.location.origin}>
      <Dashboard />
    </Auth0Provider>
  );
}