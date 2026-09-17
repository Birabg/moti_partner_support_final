import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { Input, Select } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { CustomerApi } from '../../api/customerApi'
import { OrganizationApi } from '../../api/organizationApi'
import { StaffApi } from '../../api/staffApi'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { CheckCircle2 } from 'lucide-react'
import axios from "axios";

const normalizePhoneNumber = (value = '') => {
  const digitsOnly = (value || '').replace(/\D/g, '')

  if (!digitsOnly) return ''

  if (digitsOnly.startsWith('251')) {
    const trimmed = digitsOnly.slice(0, 12)
    return `+${trimmed}`
  }

  if (digitsOnly.startsWith('0')) {
    const trimmed = digitsOnly.slice(1, 10)
    return `+251${trimmed}`
  }

  const trimmed = digitsOnly.slice(0, 9)
  return `+251${trimmed}`
}

const validatePhoneNumber = (value = '') => {
  const normalized = normalizePhoneNumber(value)
  return /^\+251\d{9}$/.test(normalized)
}

// -----------------------------------------------------------------------
// Customer registration form
// -----------------------------------------------------------------------
function CustomerRegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    organizationId: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })

  // Per-field errors, keyed by field name, shown under each field's own label.
  const [fieldErrors, setFieldErrors] = useState({})
  // Only for things that aren't tied to a specific field (e.g. server/network errors).
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [organizationsLoading, setOrganizationsLoading] = useState(true)
  const [organizationsError, setOrganizationsError] = useState('')

  function readCachedOrganizations() {
    try {
      const cached = window.localStorage.getItem('partner_support_organizations')
      if (!cached) return []
      const parsed = JSON.parse(cached)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      return []
    }
  }

  function persistOrganizations(list) {
    window.localStorage.setItem('partner_support_organizations', JSON.stringify(list))
  }

  useEffect(() => {
    let active = true

    const applyOrganizations = (list) => {
      const safeList = (list || []).filter((org) => org?.isActive !== false)
      if (active) {
        setOrganizations(safeList)
        persistOrganizations(safeList)
      }
    }

    const loadOrganizations = async () => {
      try {
        setOrganizationsLoading(true)
        setOrganizationsError('')

        const cached = readCachedOrganizations()
        if (cached.length) {
          applyOrganizations(cached)
        }

        const response = await OrganizationApi.getAll()
        const list = (response?.data?.data || []).filter((org) => org?.isActive !== false)
        applyOrganizations(list)
      } catch (error) {
        console.error(error)
        const cached = readCachedOrganizations()
        if (cached.length) {
          applyOrganizations(cached)
          if (active) {
            setOrganizationsError('')
          }
        } else if (active) {
          setOrganizationsError('Unable to load organizations. Please contact support or try again later.')
        }
      } finally {
        if (active) {
          setOrganizationsLoading(false)
        }
      }
    }

    const refreshOrganizations = () => {
      loadOrganizations()
    }

    const handleStorageChange = (event) => {
      if (event.key === 'partner_support_organizations') {
        refreshOrganizations()
      }
    }

    loadOrganizations()

    window.addEventListener('focus', refreshOrganizations)
    window.addEventListener('organizations:updated', refreshOrganizations)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      active = false
      window.removeEventListener('focus', refreshOrganizations)
      window.removeEventListener('organizations:updated', refreshOrganizations)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  function update(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value })
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }

  function updatePhone(field) {
    return (e) => {
      const nextValue = normalizePhoneNumber(e.target.value)
      setForm({ ...form, [field]: nextValue })
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }

  function validate() {
    const errors = {}

    if (!form.firstName.trim()) errors.firstName = 'First name is required.'
    if (!form.middleName.trim()) errors.middleName = 'Middle name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    if (!form.organizationId) errors.organizationId = 'Please select your organization.'
    if (!form.position.trim()) errors.position = 'Position is required.'
    if (!form.gender) errors.gender = 'Please select your gender.'

    const phoneValue = form.phoneNumber.trim()
    if (!phoneValue) {
      errors.phoneNumber = 'Phone number is required.'
    } else if (!validatePhoneNumber(phoneValue)) {
      errors.phoneNumber = 'Phone number must start with +251 and contain 12 digits without the + sign.'
    }

    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)

    try {
      const payload = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        organizationId: form.organizationId,
        position: form.position.trim(),
        gender: form.gender.toUpperCase(),
        password: form.password,
        passwordPlain: form.password,
      }

      await CustomerApi.register(payload)

      navigate('/verify-email-sent', {
        state: {
          email: payload.email,
          type: 'customer',
        },
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Registration failed.',
        )
      } else {
        setFormError('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {formError && (
          <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">
            {formError}
          </p>
        )}

        {/* First Name | Middle Name | Last Name */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            id="firstName"
            label="First Name"
            required
            placeholder="Yared"
            value={form.firstName}
            onChange={update('firstName')}
            error={fieldErrors.firstName}
          />

          <Input
            id="middleName"
            label="Middle Name"
            required
            placeholder="Bekele"
            value={form.middleName}
            onChange={update('middleName')}
            error={fieldErrors.middleName}
          />

          <Input
            id="lastName"
            label="Last Name"
            placeholder="Tadesse"
            value={form.lastName}
            onChange={update('lastName')}
            error={fieldErrors.lastName}
          />
        </div>

        {/* Email */}

        <Input
          id="email"
          label="Email Address"
          type="email"
          required
          placeholder="[email protected]"
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />

        {/* Organization | Position */}

        <div className="grid grid-cols-1 gap-7 md:grid-cols-1">
          <Select
            id="organizationId"
            label="Organization"
            required
            value={form.organizationId}
            onChange={update('organizationId')}
            error={fieldErrors.organizationId}
            disabled={organizationsLoading || organizations.length === 0}
          >
            <option value="">
              {organizationsLoading ? 'Loading organizations...' : organizations.length ? 'Select Organization' : 'No active organizations available'}
            </option>

            {!organizationsLoading && organizations.map((organization) => (
             <option key={organization.id} value={organization.id}>
               {organization.name}
             </option>
            ))}
          </Select>
          </div>

          {organizationsError ? (
            <p className="text-sm text-danger-600">{organizationsError}</p>
          ) : null}

          <Input
            id="position"
            label="Position"
            required
            placeholder="Manager, IT Officer, etc."
            value={form.position}
            onChange={update('position')}
            error={fieldErrors.position}
          />

        {/* Gender */}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-700">
            Gender <span className="text-danger-500">*</span>
          </label>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={form.gender === 'Male'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Male</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={form.gender === 'Female'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Female</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={form.gender === 'Other'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Other</span>
            </label>
          </div>
          {fieldErrors.gender && (
            <p className="text-sm text-danger-600">{fieldErrors.gender}</p>
          )}
        </div>

        {/* Phone Number */}

        <Input
          id="phoneNumber"
          label="Phone Number"
          required
          placeholder="+251912345678"
          value={form.phoneNumber}
          onChange={updatePhone('phoneNumber')}
          error={fieldErrors.phoneNumber}
        />

        {/* Password | Confirm Password */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            hint="At least 8 characters"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onRightIconClick={() =>
              setShowPassword(!showPassword)
            }
            error={fieldErrors.password}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            hint="Re-enter the same password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            rightIcon={
              showConfirmPassword ? <FaEyeSlash /> : <FaEye />
            }
            onRightIconClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            error={fieldErrors.confirmPassword}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Create Customer Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-navy-800 hover:text-navy-900"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}

// -----------------------------------------------------------------------
// Staff registration form
// -----------------------------------------------------------------------
function StaffRegisterForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    gender: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value })
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }

  function updatePhone(field) {
    return (e) => {
      const nextValue = normalizePhoneNumber(e.target.value)
      setForm({ ...form, [field]: nextValue })
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }

  function validate() {
    const errors = {}

    if (!form.firstName.trim()) errors.firstName = 'First name is required.'
    if (!form.middleName.trim()) errors.middleName = 'Middle name is required.'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
    if (!form.email.trim()) errors.email = 'Working email is required.'
    if (!form.gender) errors.gender = 'Please select your gender.'

    const phoneValue = form.phoneNumber.trim()
    if (!phoneValue) {
      errors.phoneNumber = 'Phone number is required.'
    } else if (!validatePhoneNumber(phoneValue)) {
      errors.phoneNumber = 'Phone number must start with +251 and contain 12 digits without the + sign.'
    }

    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)
    try {
      const payload = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        gender: form.gender.toUpperCase(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        passwordPlain: form.password,
      }

      await StaffApi.register(payload)

      navigate("/verify-email-sent", {
        state: {
          email: payload.email,
          type: "staff",
       },
     })
    } catch (err) {
       if (axios.isAxiosError(err)) {
        setFormError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed."
        )
       } else {
        setFormError("Something went wrong.")
      }
    }
      finally {
        setLoading(false)
      }
    }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {formError && (
          <p className="rounded-lg bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">{formError}</p>
        )}
       {/* First Name | Middle Name | Last Name */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            id="firstName"
            label="First Name"
            required
            placeholder="Yared"
            value={form.firstName}
            onChange={update('firstName')}
            error={fieldErrors.firstName}
          />

          <Input
            id="middleName"
            label="Middle Name"
            required
            placeholder="Bekele"
            value={form.middleName}
            onChange={update('middleName')}
            error={fieldErrors.middleName}
          />

          <Input
            id="lastName"
            label="Last Name"
            placeholder="Tadesse"
            value={form.lastName}
            onChange={update('lastName')}
            error={fieldErrors.lastName}
          />
        </div>

        <Input
          id="staff-email"
          label="Working email"
          type="email"
          required
          placeholder="[email protected]"
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
  {/* Gender */}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-700">
            Gender <span className="text-danger-500">*</span>
          </label>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={form.gender === 'Male'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Male</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={form.gender === 'Female'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Female</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="Other"
                checked={form.gender === 'Other'}
                onChange={update('gender')}
                className="h-4 w-4 text-navy-600"
              />
              <span>Other</span>
            </label>
          </div>
          {fieldErrors.gender && (
            <p className="text-sm text-danger-600">{fieldErrors.gender}</p>
          )}
        </div>

        <Input
          id="staff-phoneNumber"
          label="Phone Number"
          type="tel"
          required
          placeholder="+251912345678"
          value={form.phoneNumber}
          onChange={updatePhone('phoneNumber')}
          error={fieldErrors.phoneNumber}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            id="staff-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            hint="At least 8 characters"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            error={fieldErrors.password}
          />
          <Input
            id="staff-confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            hint="Re-enter the same password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            rightIcon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            error={fieldErrors.confirmPassword}
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Create Staff Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-navy-800 hover:text-navy-900">
          Sign in
        </Link>
      </p>
    </>
  )
}

// -----------------------------------------------------------------------
// Page shell — tab switcher between the two forms above.
// -----------------------------------------------------------------------
export default function RegisterPage() {
  const [tab, setTab] = useState('customer')

  return (
    <AuthLayout
      title={tab === 'customer' ? 'Customer registration' : 'Staff registration'}
      subtitle={
        tab === 'customer'
          ? 'Create your customer account to submit and track support requests from your organization.'
          : 'Apply for an internal staff account. An admin will review and activate it.'
      }
    >
      <div className="mb-6 rounded-xl border border-ink-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-ink-700">Register As</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTab('customer')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              tab === 'customer'
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-ink-300 bg-white text-ink-600 hover:border-navy-300 hover:text-ink-900'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setTab('staff')}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              tab === 'staff'
                ? 'border-navy-900 bg-navy-900 text-white'
                : 'border-ink-300 bg-white text-ink-600 hover:border-navy-300 hover:text-ink-900'
            }`}
          >
            Staff
          </button>
        </div>
      </div>

      {tab === 'customer' ? <CustomerRegisterForm /> : <StaffRegisterForm />}
    </AuthLayout>
  )
}

