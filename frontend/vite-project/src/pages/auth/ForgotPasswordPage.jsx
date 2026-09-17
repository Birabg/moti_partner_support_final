import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { authService } from '../../lib/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.requestPasswordReset({ email })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent password reset instructions if the address exists.">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-ink-200 bg-white px-6 py-8 text-center">
          <CheckCircle2 className="text-navy-500" size={40} />
          <p className="text-sm text-ink-600">
            If an account exists for <span className="font-medium text-ink-900">{email}</span>, we've sent
            password reset instructions.
          </p>
          <Link to="/login" className="text-sm font-medium text-navy-800 hover:text-navy-900">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you reset instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">{error}</p>
        )}
        <Input
          id="email"
          label="Email address"
          type="email"
          required
          placeholder="[email protected]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset instructions
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="font-medium text-navy-800 hover:text-navy-900">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

