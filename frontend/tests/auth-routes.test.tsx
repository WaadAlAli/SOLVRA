import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../src/context/AuthContext'
import { getCurrentUser } from '../src/services/auth.service'
import AppRouter from '../src/routes/AppRouter'

vi.mock('../src/services/auth.service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('../src/pages/Landing/LandingPage', () => ({
  default: () => <h1>Landing route</h1>,
}))
vi.mock('../src/pages/Login/LoginPage', () => ({
  default: () => <h1>Login route</h1>,
}))
vi.mock('../src/pages/Signup/SignupPage', () => ({
  default: () => <h1>Signup route</h1>,
}))
vi.mock('../src/pages/ForgotPassword/ForgotPasswordPage', () => ({
  default: () => <h1>Forgot password route</h1>,
}))
vi.mock('../src/pages/ResetPassword/ResetPasswordPage', () => ({
  default: () => <h1>Reset password route</h1>,
}))
vi.mock('../src/pages/Dashboard/BuyerDashboard', () => ({
  default: () => <h1>Buyer dashboard route</h1>,
}))
vi.mock(
  '../src/pages/Dashboard/CreateSolarRequest/CreateSolarRequestPage',
  () => ({
    default: () => <h1>Create request route</h1>,
  }),
)
vi.mock('../src/pages/Dashboard/RequestDetails/RequestDetailsPage', () => ({
  default: () => <h1>Request details route</h1>,
}))
vi.mock('../src/pages/Dashboard/Profile/BuyerProfilePage', () => ({
  default: () => <h1>Buyer profile route</h1>,
}))
vi.mock('../src/pages/Dashboard/Settings/SettingsPage', () => ({
  default: () => <h1>Settings route</h1>,
}))
vi.mock('../src/pages/Dashboard/MyRequests/MyRequestsPage', () => ({
  default: () => <h1>My requests route</h1>,
}))
vi.mock('../src/pages/Dashboard/EditRequest/EditRequestPage', () => ({
  default: () => <h1>Edit request route</h1>,
}))
vi.mock('../src/pages/Dashboard/Bids/BidsPage', () => ({
  default: () => <h1>Bids route</h1>,
}))
vi.mock('../src/pages/Dashboard/Bids/BidDetailPage', () => ({
  default: () => <h1>Bid details route</h1>,
}))
vi.mock('../src/pages/Dashboard/Compare/ComparePage', () => ({
  default: () => <h1>Compare route</h1>,
}))
vi.mock('../src/pages/Dashboard/Insights/InsightsPage', () => ({
  default: () => <h1>Insights route</h1>,
}))
vi.mock('../src/pages/Dashboard/Negotiations/NegotiationsPage', () => ({
  default: () => <h1>Negotiations route</h1>,
}))
vi.mock('../src/pages/Dashboard/WhatIf/WhatIfPage', () => ({
  default: () => <h1>What-if route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierDashboard', () => ({
  default: () => <h1>Supplier dashboard route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierRequestsPage', () => ({
  default: () => <h1>Supplier requests route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierRequestDetailPage', () => ({
  default: () => <h1>Supplier request details route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierBidFormPage', () => ({
  default: () => <h1>Supplier bid form route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierBidsPage', () => ({
  default: () => <h1>Supplier bids route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierBidDetailPage', () => ({
  default: () => <h1>Supplier bid details route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierProfilePage', () => ({
  default: () => <h1>Supplier profile route</h1>,
}))
vi.mock('../src/pages/Dashboard/Supplier/SupplierSettingsPage', () => ({
  default: () => <h1>Supplier settings route</h1>,
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue({
    success: false,
  } as Awaited<ReturnType<typeof getCurrentUser>>)
  window.history.replaceState({}, '', '/dashboard')
})

afterEach(() => {
  cleanup()
})

describe('protected routes', () => {
  it('redirects an unauthenticated user to login', async () => {
    render(
      <AuthProvider>
        <AppRouter />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Login route' }),
    ).toBeTruthy()
  })
})
