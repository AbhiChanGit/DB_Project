// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifySignup } from './pages/VerifySignup';
import { ProductList } from './pages/ProductList';
import { Cart } from './pages/Cart';
import { Profile } from './pages/Profile';
import { Addresses } from './pages/Addresses';
import { CreditCards } from './pages/CreditCards';
import { StaffProductManagement } from './pages/StaffProductManagement';
import { StaffStockManagement } from './pages/StaffStockManagement';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-signup" element={<VerifySignup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/credit-cards"
          element={
            <ProtectedRoute>
              <CreditCards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/products"
          element={
            <ProtectedRoute>
              <StaffProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/stock"
          element={
            <ProtectedRoute>
              <StaffStockManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div>404: Page not found</div>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
