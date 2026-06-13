import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Card, Alert, Stack } from 'react-bootstrap';
import { cartAPI } from '../api';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import AppButton from '../components/AppButton';

interface CartItem {
  productId: string | number;
  title: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const loadCart = useCallback(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const saved = localStorage.getItem(`cart_${user.id}`);
    setItems(saved ? JSON.parse(saved) : []);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadCart();
  }, [user, navigate, loadCart]);

  const updateQuantity = async (productId: string | number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateQuantity(productId, newQuantity);
      const updated = items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );

      setItems(updated);
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updated));
    } catch {
      window.alert(t('cart.updateError'));
    }
  };

  const removeItem = async (productId: string | number) => {
    if (!window.confirm(t('cart.removeConfirm'))) return;

    try {
      await cartAPI.remove(productId);
      const updated = items.filter(item => item.productId !== productId);
      setItems(updated);
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updated));
    } catch {
      window.alert(t('cart.deleteError'));
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) return null;

  if (items.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="info">
          <Stack className="align-items-center gap-3">
            <Alert.Heading>{t('cart.emptyTitle')}</Alert.Heading>
            <img
              src="/images/empty-cart-sticker.png"
              alt=""
              style={{ width: 100, height: 'auto', borderRadius: 8 }}
            />
            <p className="mb-0">{t('cart.emptyText')}</p>
            <AppButton onClick={() => navigate('/products')}>
              {t('cart.goCatalog')}
            </AppButton>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">{t('cart.title')}</h1>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>{t('cart.product')}</th>
            <th>{t('cart.price')}</th>
            <th>{t('cart.quantity')}</th>
            <th>{t('cart.sum')}</th>
            <th>{t('cart.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.productId}>
              <td>{item.title}</td>
              <td>{item.price} {t('common.ruble')}</td>
              <td>
                <Stack direction="horizontal" gap={2}>
                  <AppButton
                    size="sm"
                    appVariant="outline"
                    onClick={() => void updateQuantity(item.productId, item.quantity - 1)}
                  >
                    -
                  </AppButton>
                  <span>{item.quantity}</span>
                  <AppButton
                    size="sm"
                    appVariant="outline"
                    onClick={() => void updateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </AppButton>
                </Stack>
              </td>
              <td>{item.price * item.quantity} {t('common.ruble')}</td>
              <td>
                <AppButton appVariant="danger" size="sm" onClick={() => void removeItem(item.productId)}>
                  {t('common.delete')}
                </AppButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>{t('cart.total')}</Card.Title>
          <Card.Text className="h3 text-primary">{total} {t('common.ruble')}</Card.Text>
          <AppButton appVariant="success" size="lg" onClick={() => navigate('/checkout')}>
            {t('cart.checkout')}
          </AppButton>
        </Card.Body>
      </Card>
    </Container>
  );
}
