import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LandingPage from '../pages/Landing/LandingPage'
import LoginPage from '../pages/Login/LoginPage'
import SignupPage from '../pages/Signup/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage'
import BuyerDashboard from '../pages/Dashboard/BuyerDashboard'
import CreateSolarRequestPage from '../pages/Dashboard/CreateSolarRequest/CreateSolarRequestPage'
import RequestDetailsPage from '../pages/Dashboard/RequestDetails/RequestDetailsPage'
import BuyerProfilePage from '../pages/Dashboard/Profile/BuyerProfilePage'
import SettingsPage from '../pages/Dashboard/Settings/SettingsPage'
import MyRequestsPage from '../pages/Dashboard/MyRequests/MyRequestsPage'
import EditRequestPage from '../pages/Dashboard/EditRequest/EditRequestPage'
import BidsPage from '../pages/Dashboard/Bids/BidsPage'
import BidDetailPage from '../pages/Dashboard/Bids/BidDetailPage'
import ComparePage from '../pages/Dashboard/Compare/ComparePage'
import InsightsPage from '../pages/Dashboard/Insights/InsightsPage'
import NegotiationsPage from '../pages/Dashboard/Negotiations/NegotiationsPage'
import WhatIfPage from '../pages/Dashboard/WhatIf/WhatIfPage'
import SupplierDashboard from '../pages/Dashboard/Supplier/SupplierDashboard'
import SupplierRequestsPage from '../pages/Dashboard/Supplier/SupplierRequestsPage'
import SupplierRequestDetailPage from '../pages/Dashboard/Supplier/SupplierRequestDetailPage'
import SupplierBidFormPage from '../pages/Dashboard/Supplier/SupplierBidFormPage'
import SupplierBidsPage from '../pages/Dashboard/Supplier/SupplierBidsPage'
import SupplierBidDetailPage from '../pages/Dashboard/Supplier/SupplierBidDetailPage'
import SupplierProfilePage from '../pages/Dashboard/Supplier/SupplierProfilePage'
import SupplierSettingsPage from '../pages/Dashboard/Supplier/SupplierSettingsPage'
import { useAuth } from '../context/AuthContext'

function BuyerRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-secondary)]">
        Loading workspace...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'BUYER') {
    return (
      <Navigate
        to={user.role === 'SUPPLIER' ? '/supplier' : '/login'}
        replace
      />
    )
  }

  return <>{children}</>
}

function SupplierRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-secondary)]">
        Loading workspace...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'SUPPLIER') {
    return (
      <Navigate to={user.role === 'BUYER' ? '/dashboard' : '/login'} replace />
    )
  }

  return <>{children}</>
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <BuyerRoute>
              <BuyerDashboard />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/requests"
          element={
            <BuyerRoute>
              <MyRequestsPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/requests/new"
          element={
            <BuyerRoute>
              <CreateSolarRequestPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/requests/:requestId/edit"
          element={
            <BuyerRoute>
              <EditRequestPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/requests/:requestId"
          element={
            <BuyerRoute>
              <RequestDetailsPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/requests/:requestId/bids/:bidId"
          element={
            <BuyerRoute>
              <BidDetailPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/bids"
          element={
            <BuyerRoute>
              <BidsPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/compare"
          element={
            <BuyerRoute>
              <ComparePage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/insights"
          element={
            <BuyerRoute>
              <InsightsPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/negotiations"
          element={
            <BuyerRoute>
              <NegotiationsPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/what-if"
          element={
            <BuyerRoute>
              <WhatIfPage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <BuyerRoute>
              <BuyerProfilePage />
            </BuyerRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <BuyerRoute>
              <SettingsPage />
            </BuyerRoute>
          }
        />

        <Route
          path="/supplier"
          element={
            <SupplierRoute>
              <SupplierDashboard />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/requests"
          element={
            <SupplierRoute>
              <SupplierRequestsPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/requests/:requestId"
          element={
            <SupplierRoute>
              <SupplierRequestDetailPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/requests/:requestId/bid"
          element={
            <SupplierRoute>
              <SupplierBidFormPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/bids/:bidId/version"
          element={
            <SupplierRoute>
              <SupplierBidFormPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/bids"
          element={
            <SupplierRoute>
              <SupplierBidsPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/bids/:bidId"
          element={
            <SupplierRoute>
              <SupplierBidDetailPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/negotiations"
          element={
            <SupplierRoute>
              <NegotiationsPage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/profile"
          element={
            <SupplierRoute>
              <SupplierProfilePage />
            </SupplierRoute>
          }
        />
        <Route
          path="/supplier/settings"
          element={
            <SupplierRoute>
              <SupplierSettingsPage />
            </SupplierRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
