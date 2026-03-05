import React, { useState, useEffect } from 'react';
import { productsAPI, cartAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Product } from '../types';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Cart } from 'react-bootstrap-icons';

const getProductImage = (product: Product) => {
  const category = product.categories?.[0]?.toLowerCase() || '';
  
  const images: { [key: string]: string } = {
    'процессоры': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300',
    'видеокарты': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300',
    'ssd': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300',
    'оперативная память': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=300',
    'материнские платы': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300',
    'блоки питания': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300',
  };

  for (const [cat, url] of Object.entries(images)) {
    if (category.includes(cat)) {
      return url;
    }
  }
  
  return `https://via.placeholder.com/300x200/6c5ce7/ffffff?text=${encodeURIComponent(product.title)}`;
};

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
            <Card className="h-100 shadow-sm">
              <Card.Img 
                variant="top" 
                src={getProductImage(product)}
                style={{ height: '200px', objectFit: 'cover' }}
                onError={(e: any) => {
                  e.target.src = `https://via.placeholder.com/300x200/6c5ce7/ffffff?text=${encodeURIComponent(product.title)}`;
                }}
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
              <Card.Footer className="bg-white border-0 pt-0">
                <Button 
                  variant={product.isAvailable ? 'primary' : 'secondary'}
                  className="w-100 rounded-pill py-2"
                  disabled={!product.isAvailable || addingId === product.id}
                  onClick={() => addToCart(product)}
                  style={{
                    background: product.isAvailable ? 'linear-gradient(135deg, #6c5ce7, #00cec9)' : '',
                    border: 'none'
                  }}
                >
                  {addingId === product.id ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" /> Добавление...
                    </>
                  ) : (
                    <>
                      <Cart className="me-2" /> В корзину
                    </>
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