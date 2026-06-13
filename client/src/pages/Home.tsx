import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import {
  ArrowRight,
  Shield,
  Truck,
  CreditCard,
  Cpu,
  Star,
  VolumeUp,
  VolumeMute,
  GpuCard,
  Memory,
  DeviceSsd,
} from 'react-bootstrap-icons';
import { useLocale } from '../LocaleContext';
import AppButton from '../components/AppButton';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.volume = 0.25;
    videoRef.current.muted = muted;
    videoRef.current.play().catch(() => undefined);
  }, [muted]);

  const categories = [
    { name: t('category.processors'), icon: <Cpu size={40} />, color: 'primary' },
    { name: t('category.graphics'), icon: <GpuCard size={40} />, color: 'success' },
    { name: t('category.memory'), icon: <Memory size={40} />, color: 'info' },
    { name: t('category.ssd'), icon: <DeviceSsd size={40} />, color: 'warning' },
  ];

  const features = [
    { icon: <Truck size={30} />, title: t('home.feature.delivery.title'), text: t('home.feature.delivery.text') },
    { icon: <Shield size={30} />, title: t('home.feature.warranty.title'), text: t('home.feature.warranty.text') },
    { icon: <CreditCard size={30} />, title: t('home.feature.payment.title'), text: t('home.feature.payment.text') },
    { icon: <Star size={30} />, title: t('home.feature.brands.title'), text: t('home.feature.brands.text') },
  ];

  return (
    <>
      <section className="hero-section position-relative overflow-hidden">
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted={muted}
            loop
            playsInline
            onLoadedData={() => setVideoLoading(false)}
            onError={() => {
              setVideoError(true);
              setVideoLoading(false);
            }}
            className="hero-video"
          >
            <source src="/video/tech-bg.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="hero-fallback" />
        )}

        <div className="hero-overlay" />

        {videoLoading && !videoError && (
          <div className="hero-loader text-white">
            <Spinner animation="border" variant="light" />
            <p className="mt-2">{t('common.loading')}</p>
          </div>
        )}

        <AppButton
          appVariant="ghost"
          className="hero-sound-button text-white"
          aria-label="Toggle video sound"
          onClick={() => setMuted((current) => !current)}
        >
          {muted ? <VolumeMute size={24} /> : <VolumeUp size={24} />}
        </AppButton>

        <Container className="position-relative h-100 d-flex align-items-center justify-content-center text-center">
          <div className="text-white hero-copy">
            <h1 className="display-1 fw-bold mb-4">{t('brand')}</h1>
            <p className="lead fs-2 mb-5">{t('home.subtitle')}</p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <AppButton size="lg" appVariant="primary" onClick={() => navigate('/products')}>
                {t('home.startShopping')}
                <ArrowRight className="ms-2" />
              </AppButton>
              <AppButton
                size="lg"
                appVariant="outline"
                className="hero-outline"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('home.learnMore')}
              </AppButton>
            </div>
          </div>
        </Container>

        <button
          className="hero-scroll"
          onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span>{t('home.scroll')}</span>
          <ArrowRight className="rotate-90" />
        </button>
      </section>

      <Container className="my-5 py-4" id="categories">
        <h2 className="section-title text-center mb-5">{t('home.categoriesTitle')}</h2>
        <Row xs={1} md={2} lg={4} className="g-4">
          {categories.map((category) => (
            <Col key={category.name}>
              <Card
                className="text-center h-100 border-0 category-card"
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
              >
                <Card.Body className="p-4">
                  <div className={`mb-3 text-${category.color}`}>{category.icon}</div>
                  <Card.Title className="fw-bold mb-3">{category.name}</Card.Title>
                  <AppButton appVariant="ghost">{t('home.viewAll')}</AppButton>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <section className="feature-band py-5 text-white">
        <Container>
          <h2 className="text-center mb-5">{t('home.featuresTitle')}</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {features.map((feature) => (
              <Col key={feature.title}>
                <div className="text-center p-4">
                  <div className="mb-3">{feature.icon}</div>
                  <h3 className="h5 mb-3">{feature.title}</h3>
                  <p className="opacity-75 mb-0">{feature.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Container className="my-5 py-5 text-center">
        <h2 className="mb-4">{t('home.ctaTitle')}</h2>
        <p className="lead mb-4 text-muted">{t('home.ctaText')}</p>
        <AppButton size="lg" onClick={() => navigate('/products')}>
          {t('nav.products')}
          <ArrowRight className="ms-2" />
        </AppButton>
      </Container>
    </>
  );
}
