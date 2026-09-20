import { BrowserRouter, Route, Routes } from 'react-router-dom'

import LandingPage from '../pages/Landing/LandingPage'
import LoginPage from '../pages/Login/LoginPage'
import SignupPage from '../pages/Signup/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage'


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter