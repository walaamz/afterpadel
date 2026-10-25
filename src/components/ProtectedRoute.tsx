import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'

export default function ProtectedRoute() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading')

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include',
        })

        if (active) {
          setStatus(response.ok ? 'authenticated' : 'guest')
        }
      } catch {
        if (active) {
          setStatus('guest')
        }
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [])

  if (status === 'loading') {
    return (
      <main className="auth-page">
        <p>Loading AfterPadel...</p>
      </main>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}