import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Container, Table, Button, Card, Alert } from 'react-bootstrap';
import { cartAPI } from '../api';

interface CartItem {
  productId: string | number;
  title: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = () => {
    const saved = localStorage.getItem(`cart_${user?.id}`);
    setItems(saved ? JSON.parse(saved) : []);
  };

  const updateQuantity = async (productId: string | number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateQuantity(productId, newQuantity);
      
      const updated = items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      
      setItems(updated);
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updated));
    } catch (error) {
      alert('Ошибка при обновлении');
    }
  };

  const removeItem = async (productId: string | number) => {
    if (!window.confirm('Удалить товар из корзины?')) return;

    try {
      await cartAPI.remove(productId);
      
      const updated = items.filter(item => item.productId !== productId);
      setItems(updated);
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updated));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) return null;

  if (items.length === 0) {
  return (
    <Container className="mt-5 text-center">
      <Alert variant="info">
        {/* Заголовок с фото на одной строке */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <Alert.Heading style={{ margin: 0 }}>Корзина пуста</Alert.Heading>
          
          {/* Маленькое фото-стикер */}
          <img 
            src="/images/empty-cart-sticker.png" 
            alt="Empty cart sticker"
            style={{
              width: '100px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        
        {/* Остальной контент ниже */}
        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
        
        <Button variant="primary" onClick={() => navigate('/products')}>
          Перейти в каталог
        </Button>
      </Alert>
    </Container>
  );
}

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Корзина</h1>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Товар</th>
            <th>Цена</th>
            <th>Количество</th>
            <th>Сумма</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.productId}>
              <td>{item.title}</td>
              <td>{item.price} ₽</td>
              <td>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  -
                </Button>
                <span className="mx-3">{item.quantity}</span>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </Button>
              </td>
              <td>{item.price * item.quantity} ₽</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Итого</Card.Title>
          <Card.Text className="h3 text-primary">{total} ₽</Card.Text>
          <Button variant="success" size="lg" onClick={() => navigate('/checkout')}>
            Оформить заказ
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}