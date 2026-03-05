import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="navbar-dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <span style={{ 
            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem'
          }}>
            TechFlow
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/products">Каталог</Nav.Link>
            <Nav.Link as={Link} to="/cart">Корзина</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3 text-white">
                  Привет, <span className="fw-bold" style={{ color: '#00cec9' }}>{user.name}</span>!
                </Navbar.Text>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                  className="rounded-pill px-4"
                  style={{ borderColor: '#6c5ce7', color: '#6c5ce7' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6c5ce7, #00cec9)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6c5ce7';
                    e.currentTarget.style.borderColor = '#6c5ce7';
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">Вход</Nav.Link>
                <Link to="/register">
                  <Button 
                    className="ms-2 rounded-pill px-4"
                    style={{ 
                      background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
                      border: 'none'
                    }}
                  >
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}