import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { AuthProvider } from './AuthContext';
import { LocaleProvider } from './LocaleContext';
import Navigation from './components/Navigation';
import LocaleBanner from './components/LocaleBanner';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));

function PageLoader() {
  return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <Navigation />
          <LocaleBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
