import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import afterpadelLogo from '../assets/afterpadel-logo.png'
import afterpadelWordmark from '../assets/afterpadel.png'

export default function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ fullName, email, password }),
        }
      )

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This email is already registered.')
        }
        throw new Error('Registration failed. Please try again.')
      }

      navigate('/login')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
  <div className="auth-brand">
    <img src={afterpadelLogo} alt="" className="auth-brand-icon" />
    <img
      src={afterpadelWordmark}
      alt="AfterPadel"
      className="auth-brand-wordmark"
    />
  </div>

  <h1>Create Your Account</h1>
        <p>Start tracking your progress, one reflection at a time.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="register-confirm">Confirm Password</label>
          <input
            id="register-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </main>
  )
}