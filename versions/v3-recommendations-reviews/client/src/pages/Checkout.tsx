import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Container, Form } from 'react-bootstrap';
import { deliveryAPI } from '../api';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import AppButton from '../components/AppButton';

export default function Checkout() {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [captcha, setCaptcha] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await deliveryAPI.checkout({ address, phone, email, captcha: Number(captcha) });
      localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));
      setMessage(t('checkout.success'));
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || t('checkout.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 620 }}>
      <Card>
        <Card.Body>
          <h1 className="h2 mb-4">{t('checkout.title')}</h1>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.address')}</Form.Label>
              <Form.Control value={address} onChange={(event) => setAddress(event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.phone')}</Form.Label>
              <Form.Control value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('checkout.email')}</Form.Label>
              <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>{t('checkout.captcha')}</Form.Label>
              <Form.Control value={captcha} onChange={(event) => setCaptcha(event.target.value)} required />
            </Form.Group>
            <AppButton type="submit" appVariant="success" disabled={loading}>
              {loading ? t('common.loading') : t('checkout.submit')}
            </AppButton>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
