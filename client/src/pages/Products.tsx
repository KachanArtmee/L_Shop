import React, { useState, useEffect } from 'react';
import { productsAPI, cartAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Product } from '../types';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data || response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    setAddingId(product.id);
    try {
      await cartAPI.add(product.id, 1);
      
      // Сохраняем в localStorage для простоты
      const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      const existing = cart.find((i: any) => i.productId === product.id);
      
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1
        });
      }
      
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
      alert('Товар добавлен в корзину!');
    } catch (error) {
      alert('Ошибка при добавлении в корзину');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загрузка товаров...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Ошибка: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Каталог товаров</h1>
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {products.map(product => (
          <Col key={product.id}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Img 
                variant="top" 
                src={product.images?.preview || 'https://via.placeholder.com/300x200?text=PC+Shop'} 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Text className="text-muted small">
                  {product.description?.substring(0, 100)}...
                </Card.Text>
                <div className="mb-2">
                  {product.categories?.map(cat => (
                    <Badge key={cat} bg="secondary" className="me-1">{cat}</Badge>
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="text-primary mb-0">{product.price} ₽</h4>
                  <Badge bg={product.isAvailable ? 'success' : 'danger'}>
                    {product.isAvailable ? 'В наличии' : 'Нет'}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white">
                <Button 
                  variant={product.isAvailable ? 'primary' : 'secondary'}
                  className="w-100"
                  disabled={!product.isAvailable || addingId === product.id}
                  onClick={() => addToCart(product)}
                >
                  {addingId === product.id ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" /> Добавление...
                    </>
                  ) : (
                    'В корзину'
                  )}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}