import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to SelfServe</h1>
      <p>Manage your development team efficiently.</p>
      
      {/* The Link component behaves like an <a> tag 
          but uses the router's internal navigation.
      */}
      <Link 
        to="/register" 
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Go to Registration
      </Link>
    </div>
  )
}