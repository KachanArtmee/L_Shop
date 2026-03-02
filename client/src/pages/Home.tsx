import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { ArrowRight, Shield, Truck, CreditCard, Cpu, Lightning, Star, VolumeUp, VolumeMute } from 'react-bootstrap-icons';

export default function Home() {
  const navigate = useNavigate();
  // Рефы для видео
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  
  const [video1Loading, setVideo1Loading] = useState(true);
  const [video1Error, setVideo1Error] = useState(false);
  const [video2Loading, setVideo2Loading] = useState(true);
  const [video2Error, setVideo2Error] = useState(false);
  
  // Состояния звука для обоих видео
  const [isVideo1Muted, setIsVideo1Muted] = useState(true);
  const [isVideo2Muted, setIsVideo2Muted] = useState(true);
  const [isVideo2Playing, setIsVideo2Playing] = useState(false);

  useEffect(() => {
    // Настройка первого видео
    if (video1Ref.current) {
      video1Ref.current.playbackRate = 1.0;
      video1Ref.current.volume = 0.3;
      video1Ref.current.muted = isVideo1Muted;
      
      video1Ref.current.play().catch(error => {
        console.log('Автовоспроизведение первого видео заблокировано:', error);
      });
    }

    // Настройка второго видео
    if (video2Ref.current) {
      video2Ref.current.volume = 0.3;
      video2Ref.current.muted = isVideo2Muted;
      
      video2Ref.current.play().catch(error => {
        console.log('Автовоспроизведение второго видео заблокировано:', error);
      });
    }
  }, []);

  const toggleVideo1Mute = () => {
    if (video1Ref.current && video2Ref.current) {
      const newMutedState = !isVideo1Muted;
      
      if (!newMutedState) {
        video2Ref.current.muted = true;
        setIsVideo2Muted(true);
      }
      
      video1Ref.current.muted = newMutedState;
      setIsVideo1Muted(newMutedState);
    }
  };

  const toggleVideo2Mute = () => {
    if (video1Ref.current && video2Ref.current) {
      const newMutedState = !isVideo2Muted;
      
      if (!newMutedState) {
        video1Ref.current.muted = true;
        setIsVideo1Muted(true);
      }
      
      video2Ref.current.muted = newMutedState;
      setIsVideo2Muted(newMutedState);
    }
  };

  const toggleVideo2Play = () => {
    if (video2Ref.current) {
      if (video2Ref.current.paused) {
        video2Ref.current.play();
        setIsVideo2Playing(true);
      } else {
        video2Ref.current.pause();
        setIsVideo2Playing(false);
      }
    }
  };

  const handleVideo1Loaded = () => {
    setVideo1Loading(false);
    console.log('Фоновое видео загружено');
  };

  const handleVideo1Error = () => {
    setVideo1Error(true);
    setVideo1Loading(false);
    console.error('Ошибка загрузки фонового видео');
  };

  const handleVideo2Loaded = () => {
    setVideo2Loading(false);
    console.log('Второе видео загружено');
  };

  const handleVideo2Error = () => {
    setVideo2Error(true);
    setVideo2Loading(false);
    console.error('Ошибка загрузки второго видео');
  };

  const categories = [
    { name: 'Процессоры', icon: <Cpu size={40} />, color: 'primary' },
    { name: 'Видеокарты', icon: <Lightning size={40} />, color: 'success' },
    { name: 'Оперативная память', icon: <span style={{ fontSize: '40px' }}>💾</span>, color: 'info' },
    { name: 'SSD', icon: <span style={{ fontSize: '40px' }}>💿</span>, color: 'warning' },
  ];

  const features = [
    { icon: <Truck size={30} />, title: 'Быстрая доставка', text: 'По всей России за 1-3 дня' },
    { icon: <Shield size={30} />, title: 'Гарантия 2 года', text: 'Официальная гарантия' },
    { icon: <CreditCard size={30} />, title: 'Удобная оплата', text: 'Карты, рассрочка, бонусы' },
    { icon: <Star size={30} />, title: 'Топ бренды', text: 'Только оригинальная продукция' },
  ];

  return (
    <>
      {/* Первый блок с фоновым видео */}
      <div className="position-relative overflow-hidden" style={{ height: '80vh', minHeight: '600px' }}>
        {/* Фоновое видео */}
        {!video1Error ? (
          <video
            ref={video1Ref}
            autoPlay
            muted={isVideo1Muted}
            loop
            playsInline
            onLoadedData={handleVideo1Loaded}
            onError={handleVideo1Error}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              zIndex: 0
            }}
          >
            <source src="/video/tech-bg.mp4" type="video/mp4" />
          </video>
        ) : (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              zIndex: 0
            }}
          />
        )}

        {/* Индикатор загрузки первого видео */}
        {video1Loading && !video1Error && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              color: 'white'
            }}
          >
            <Spinner animation="border" variant="light" />
            <p className="mt-2">Загрузка...</p>
          </div>
        )}

        {/* Кнопка управления звуком для первого видео */}
        <Button
          onClick={toggleVideo1Mute}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            zIndex: 3,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {isVideo1Muted ? <VolumeMute size={24} /> : <VolumeUp size={24} />}
        </Button>

        {/* Затемняющий оверлей */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.8) 0%, rgba(0,206,201,0.8) 100%)',
            zIndex: 1,
            top: 0,
            left: 0
          }}
        />

        {/* Контент поверх первого видео */}
        <Container 
          className="position-relative h-100 d-flex align-items-center justify-content-center text-center"
          style={{ zIndex: 2 }}
        >
          <div className="text-white">
            <h1 className="display-1 fw-bold mb-4 animate__animated animate__fadeInDown">
              TechFlow
            </h1>
            <p className="lead fs-2 mb-5 animate__animated animate__fadeInUp">
              Будущее компьютерных технологий
            </p>
            <div className="animate__animated animate__fadeInUp animate__delay-1s">
              <Button 
                variant="light" 
                size="lg" 
                onClick={() => navigate('/products')}
                className="rounded-pill px-5 py-3 me-3"
                style={{ 
                  background: 'white',
                  border: 'none',
                  color: '#6c5ce7',
                  fontWeight: 'bold'
                }}
              >
                Начать покупки
                <ArrowRight className="ms-2" />
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                onClick={() => {
                  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-pill px-5 py-3"
              >
                Узнать больше
              </Button>
            </div>
          </div>
        </Container>

        {/* Стрелка для скролла */}
        <div 
          className="position-absolute bottom-0 start-50 translate-middle-x mb-4"
          style={{ zIndex: 2, cursor: 'pointer' }}
          onClick={() => {
            document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="text-white animate__animated animate__bounce animate__infinite">
            <div>Листайте вниз</div>
            <div>↓</div>
          </div>
        </div>
      </div>

      {/* Категории */}
      <Container className="my-5 py-5" id="categories">
        <h2 className="text-center mb-5" style={{ 
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Категории товаров
        </h2>
        <Row xs={1} md={2} lg={4} className="g-4">
          {categories.map((cat, index) => (
            <Col key={cat.name}>
              <Card 
                className="text-center h-100 border-0"
                onClick={() => navigate(`/products?category=${cat.name}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="p-4">
                  <div 
                    className="mb-3"
                    style={{ 
                      color: `var(--bs-${cat.color})`,
                      fontSize: '3rem'
                    }}
                  >
                    {cat.icon}
                  </div>
                  <Card.Title className="fw-bold mb-3">{cat.name}</Card.Title>
                  <Button 
                    variant="link" 
                    className="text-decoration-none"
                    style={{ color: '#6c5ce7' }}
                  >
                    Смотреть все →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Второе видео на всю ширину + фото поверх */}
      <div 
        style={{ 
          height: '80vh', 
          minHeight: '600px',
          width: '100%',
          position: 'relative',
          backgroundColor: '#1a1a1a',
          overflow: 'hidden',
          marginBottom: '100px'  // <--- ДОБАВЬТЕ ЭТУ СТРОКУ
        }}
      >
        {/* Второе видео */}
        {!video2Error ? (
          <video
            ref={video2Ref}
            autoPlay
            loop
            playsInline
            muted={isVideo2Muted}
            onLoadedData={handleVideo2Loaded}
            onError={handleVideo2Error}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              zIndex: 0
            }}
          >
            <source src="/video/second-video.mp4" type="video/mp4" />
          </video>
        ) : (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
              zIndex: 0
            }}
          />
        )}

        {/* Затемняющий оверлей */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Индикатор загрузки второго видео */}
        {video2Loading && !video2Error && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              color: 'white'
            }}
          >
            <Spinner animation="border" variant="light" />
            <p className="mt-2">Загрузка видео...</p>
          </div>
        )}

        

        {/* Кнопка управления звуком */}
        <Button
          onClick={toggleVideo2Mute}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            zIndex: 3,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {isVideo2Muted ? <VolumeMute size={24} /> : <VolumeUp size={24} />}
        </Button>

        {/* Фото поверх видео */}
        <div
          style={{
            position: 'absolute',
            top: '70%',
            right: '5%',
            transform: 'translateY(-50%)',
            width: '20%',
            minWidth: '200px',
            maxWidth: '300px',
            zIndex: 2,
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '3px solid rgba(255,255,255,0.2)'
          }}
        >
          <img 
            src="/images/your-photo.jpg" 
            alt="Your photo"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
          
          {/* Подпись к фото */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              color: 'black',
              padding: '20px 10px 10px',
              textAlign: 'center',
              fontSize: '14px'
            }}
          >
            SSD диск Samsung 990 Pro 1TB
          </div>
        </div>
      </div>

      {/* Преимущества */}
      <div style={{ background: 'linear-gradient(135deg, #6c5ce7, #00cec9)' }} className="py-5 text-white">
        <Container>
          <h2 className="text-center mb-5" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            Почему выбирают TechFlow
          </h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {features.map((feature, index) => (
              <Col key={index}>
                <div className="text-center p-4">
                  <div className="mb-3">
                    {feature.icon}
                  </div>
                  <h4 className="mb-3">{feature.title}</h4>
                  <p className="opacity-75">{feature.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA секция */}
      <Container className="my-5 py-5 text-center">
        <h2 className="mb-4" style={{ fontSize: '2.5rem' }}>
          Готовы обновить свой ПК?
        </h2>
        <p className="lead mb-4 text-muted">
          Более 1000+ комплектующих в наличии
        </p>
        <Button 
          onClick={() => navigate('/products')}
          size="lg"
          className="rounded-pill px-5 py-3"
          style={{ 
            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
            border: 'none',
            fontSize: '1.2rem'
          }}
        >
          Перейти в каталог
          <ArrowRight className="ms-2" />
        </Button>
      </Container>
    </>
  );
}