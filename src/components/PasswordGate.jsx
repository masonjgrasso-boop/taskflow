import { useState, useEffect } from 'react'

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('tf_auth') === 'true') {
      setAuthenticated(true)
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (input === 'WindhamGram') {
      localStorage.setItem('tf_auth', 'true')
      setAuthenticated(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (authenticated) return children

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '16px',
      fontFamily: 'sans-serif',
    }}>
      <h2 style={{ margin: 0 }}>TaskFlow</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          placeholder="Enter password"
          autoFocus
          style={{ padding: '10px 14px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', width: '220px' }}
        />
        <button type="submit" style={{ padding: '10px 24px', fontSize: '16px', borderRadius: '6px', cursor: 'pointer', width: '220px' }}>
          Enter
        </button>
        {error && <p style={{ color: 'red', margin: 0 }}>Incorrect password</p>}
      </form>
    </div>
  )
}
