import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

export default function Home() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Процессоры', icon: '🖥️', color: 'primary' },
    { name: 'Видеокарты', icon: '🎮', color: 'success' },
    { name: 'Оперативная память', icon: '💾', color: 'info' },
    { name: 'SSD', icon: '💿', color: 'warning' },
  ];

  return (
    <>
      {/* Hero секция */}
      <div className="bg-primary text-white py-5">
        <Container className="text-center">
          <h1 className="display-4">🖥️ PC Shop</h1>
          <p className="lead">Магазин комплектующих для ПК</p>
          <Button 
            variant="light" 
            size="lg" 
            onClick={() => navigate('/products')}
            className="mt-3"
          >
            Перейти в каталог
          </Button>
        </Container>
      </div>

      {/* Категории */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Категории товаров</h2>
        <Row xs={1} md={2} lg={4} className="g-4">
          {categories.map(cat => (
            <Col key={cat.name}>
              <Card 
                className={`text-center h-100 shadow-sm bg-${cat.color} text-white`}
                onClick={() => navigate(`/products?category=${cat.name}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <div style={{ fontSize: '48px' }}>{cat.icon}</div>
                  <Card.Title className="mt-3">{cat.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Преимущества */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Почему выбирают нас</h2>
        <Row xs={1} md={3} className="g-4">
          <Col>
            <Card className="text-center h-100">
              <Card.Body>
                <div style={{ fontSize: '48px' }}>🚚</div>
                <Card.Title>Быстрая доставка</Card.Title>
                <Card.Text>Доставка по всей России от 2 дней</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center h-100">
              <Card.Body>
                <div style={{ fontSize: '48px' }}>🛡️</div>
                <Card.Title>Гарантия качества</Card.Title>
                <Card.Text>Официальная гарантия на все товары</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center h-100">
              <Card.Body>
                <div style={{ fontSize: '48px' }}>💳</div>
                <Card.Title>Удобная оплата</Card.Title>
                <Card.Text>Наличные, карты, рассрочка</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}