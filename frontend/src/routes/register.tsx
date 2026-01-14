import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/register')({
  component: Register,
})

interface Dev {
  id: string;
  created_at: string;
  name: string;
}

function Register() {
  const [devs, setDevs] = useState<Dev[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch('http://localhost:8080/devs'); 
      const data = await res.json();
      setDevs(data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/devs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName('');
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to register member", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Register Developer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter developer name"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Register'}
        </button>
      </form>
      <hr />
      <h2>Member List</h2>
      <ul>
        {devs.map((dev) => (
          <li key={dev.id}>{dev.name}</li>
        ))}
      </ul>
    </div>
  );
}