// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/credit-cards" element={<CreditCards />} />
        <Route path="/staff/products" element={<StaffProductManagement />} />
        <Route path="/staff/stock" element={<StaffStockManagement />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
