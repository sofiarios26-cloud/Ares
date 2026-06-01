import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import {
  AuthCallbackPage,
  ChatThreadPage,
  CheckoutFailurePage,
  CheckoutPendingPage,
  CheckoutSuccessPage,
  DiscoverPage,
  ForgotPasswordPage,
  HomePage,
  InboxPage,
  LoginPage,
  NotificationsPage,
  ProductDetailPage,
  ProfilePage,
  PurchasesPage,
  RegisterPage,
  ResetPasswordPage,
  SavedPage,
  SellerProfilePage,
  SellPage,
  SplashPage,
  WelcomePage,
} from '@/pages'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/seller/:username" element={<SellerProfilePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
            <Route path="/checkout/failure" element={<CheckoutFailurePage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/inbox/:userId" element={<ChatThreadPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
