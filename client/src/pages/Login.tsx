import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import AppButton from '../components/AppButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 420 }}>
      <Card>
        <Card.Body>
          <h1 className="h2 text-center mb-4">{t('login.title')}</h1>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('login.password')}</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <AppButton type="submit" className="w-100" disabled={loading}>
              {loading ? t('login.loading') : t('login.submit')}
            </AppButton>
          </Form>

          <div className="text-center mt-3">
            {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
