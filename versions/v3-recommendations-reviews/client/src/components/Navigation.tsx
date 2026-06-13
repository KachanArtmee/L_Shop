import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import AppButton from './AppButton';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const canManageProducts = user?.role === 'admin' || user?.role === 'manager';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="navbar-dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <span className="brand-gradient">{t('brand')}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">{t('nav.home')}</Nav.Link>
            <Nav.Link as={Link} to="/products">{t('nav.products')}</Nav.Link>
            <Nav.Link as={Link} to="/cart">{t('nav.cart')}</Nav.Link>
            {canManageProducts && (
              <Nav.Link as={Link} to="/admin/products">{t('nav.admin')}</Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            {user ? (
              <>
                <Navbar.Text className="text-white">
                  {t('nav.greeting', { name: user.name })}
                </Navbar.Text>
                <AppButton appVariant="outline" onClick={handleLogout}>
                  {t('nav.logout')}
                </AppButton>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">{t('nav.login')}</Nav.Link>
                <Link to="/register">
                  <AppButton>{t('nav.register')}</AppButton>
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
