import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, cartAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Product } from '../types';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from 'react-bootstrap';
import { Cart } from 'react-bootstrap-icons';

const SECTION_ORDER = ['Процессоры', 'Видеокарты', 'Оперативная память', 'SSD'] as const;

const IMAGE_BY_CATEGORY: Array<{ match: RegExp; image: string }> = [
  {
    match: /процессор|cpu|processor/i,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /видеокарт|gpu|graphics|rtx|radeon/i,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /ssd|nvme|накопител/i,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /оператив|ram|ddr/i,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /материн|motherboard/i,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /блок питан|psu|power supply/i,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80&auto=format&fit=crop',
  },
];

const toDescription = (description?: string, maxLength = 120) => {
  if (!description) return 'Описание товара скоро появится.';
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trim()}...`;
};

const getProductImage = (product: Product) => {
  if (product.images?.preview) {
    return product.images.preview;
  }

  const category = product.categories?.[0] ?? '';
  const found = IMAGE_BY_CATEGORY.find(({ match }) => match.test(category));

  return (
    found?.image ||
    `https://via.placeholder.com/800x500/0d6efd/ffffff?text=${encodeURIComponent(product.title)}`
  );
};

interface ProductCardProps {
  product: Product;
  addingId: string | number | null;
  onAddToCart: (product: Product) => Promise<void>;
}

const ProductCard = memo(function ProductCard({
  product,
  addingId,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={getProductImage(product)}
        loading="lazy"
        decoding="async"
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(event) => {
          event.currentTarget.src = `https://via.placeholder.com/800x500/0d6efd/ffffff?text=${encodeURIComponent(
            product.title
          )}`;
        }}
      />
      <Card.Body>
        <Card.Title>{product.title}</Card.Title>
        <Card.Text className="text-muted small">{toDescription(product.description)}</Card.Text>

        <div className="mb-2">
          {product.categories?.map((category) => (
            <Badge key={`${product.id}-${category}`} bg="secondary" className="me-1">
              {category}
            </Badge>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <h4 className="text-primary mb-0">{product.price} ₽</h4>
          <Badge bg={product.isAvailable ? 'success' : 'danger'}>
            {product.isAvailable ? 'В наличии' : 'Нет в наличии'}
          </Badge>
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-0 pt-0">
        <Button
          variant={product.isAvailable ? 'primary' : 'secondary'}
          className="w-100 rounded-pill py-2"
          disabled={!product.isAvailable || addingId === product.id}
          onClick={() => void onAddToCart(product)}
        >
          {addingId === product.id ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Добавление...
            </>
          ) : (
            <>
              <Cart className="me-2" />В корзину
            </>
          )}
        </Button>
      </Card.Footer>
    </Card>
  );
});

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | number | null>(null);

  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category')?.trim() ?? '';

  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        const payload = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        if (isMounted) {
          setProducts(payload);
          setError('');
        }
      } catch (requestError: any) {
        if (isMounted) {
          setError(requestError.message || 'Не удалось загрузить товары');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const sections = useMemo(() => {
    const grouped = new Map<string, Product[]>();

    products.forEach((product) => {
      const category = product.categories?.[0] || 'Прочее';
      const current = grouped.get(category) || [];

      if (current.length < 4) {
        current.push(product);
        grouped.set(category, current);
      }
    });

    const orderedSectionNames = [
      ...SECTION_ORDER,
      ...Array.from(grouped.keys()).filter(
        (category) => !SECTION_ORDER.includes(category as (typeof SECTION_ORDER)[number])
      ),
    ];

    const filteredNames = selectedCategory
      ? orderedSectionNames.filter((category) => category === selectedCategory)
      : orderedSectionNames;

    return filteredNames
      .map((name) => ({ name, products: grouped.get(name) || [] }))
      .filter((section) => section.products.length > 0);
  }, [products, selectedCategory]);

  const addToCart = useCallback(
    async (product: Product) => {
      if (!user) {
        window.alert('Пожалуйста, войдите в систему.');
        return;
      }

      setAddingId(product.id);

      try {
        await cartAPI.add(product.id, 1);

        const cartKey = `cart_${user.id}`;
        const savedCart = localStorage.getItem(cartKey);
        const cart = savedCart ? JSON.parse(savedCart) : [];
        const existing = cart.find((item: any) => item.productId === product.id);

        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
          });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
      } catch {
        window.alert('Ошибка при добавлении товара в корзину');
      } finally {
        setAddingId(null);
      }
    },
    [user]
  );

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

  if (sections.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          {selectedCategory
            ? `В разделе "${selectedCategory}" пока нет товаров.`
            : 'Пока нет товаров для отображения.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-2">Каталог товаров</h1>
      <p className="text-muted mb-4">
        {selectedCategory
          ? `Раздел: ${selectedCategory}. Показаны существующие товары (до 4 шт.).`
          : 'В каждом разделе показано до 4 существующих товаров.'}
      </p>

      {sections.map((section) => (
        <section key={section.name} className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">{section.name}</h2>
            <Badge bg="light" text="dark">
              {section.products.length} / 4
            </Badge>
          </div>

          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {section.products.map((product) => (
              <Col key={product.id}>
                <ProductCard product={product} addingId={addingId} onAddToCart={addToCart} />
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </Container>
  );
}
