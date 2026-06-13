import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, cartAPI } from '../api';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import { LocaleCode, Product } from '../types';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Form,
  Stack,
} from 'react-bootstrap';
import { Cart, HandThumbsUp, StarFill } from 'react-bootstrap-icons';
import AppButton from '../components/AppButton';
import { getAverageRating, getLocalizedProductText, truncateText } from '../utils/product';

const IMAGE_BY_TAG: Array<{ match: RegExp; image: string }> = [
  {
    match: /cpu|processor/i,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /gpu|graphics|rtx|radeon/i,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /ssd|nvme/i,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80&auto=format&fit=crop',
  },
  {
    match: /ram|ddr|memory/i,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80&auto=format&fit=crop',
  },
];

const getProductImage = (product: Product) => {
  if (product.images?.preview) {
    return product.images.preview;
  }

  const haystack = [...(product.tags || []), ...(product.categories || []), product.title].join(' ');
  const found = IMAGE_BY_TAG.find(({ match }) => match.test(haystack));

  return found?.image || `https://via.placeholder.com/800x500/0d6efd/ffffff?text=${encodeURIComponent(product.title)}`;
};

interface ReviewDraft {
  rating: number;
  comment: string;
}

interface ProductCardProps {
  product: Product;
  locale: LocaleCode;
  addingId: string | number | null;
  reviewDraft: ReviewDraft;
  isAuthenticated: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onAddToCart: (product: Product) => Promise<void>;
  onLike: (product: Product) => Promise<void>;
  onReviewChange: (productId: string | number, draft: ReviewDraft) => void;
  onReviewSubmit: (product: Product) => Promise<void>;
}

const ProductCard = memo(function ProductCard({
  product,
  locale,
  addingId,
  reviewDraft,
  isAuthenticated,
  t,
  onAddToCart,
  onLike,
  onReviewChange,
  onReviewSubmit,
}: ProductCardProps) {
  const localized = getLocalizedProductText(product, locale);
  const rating = getAverageRating(product);

  return (
    <Card className="h-100 shadow-sm product-card">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={getProductImage(product)}
          loading="lazy"
          decoding="async"
          style={{ height: 200, objectFit: 'cover' }}
          onError={(event) => {
            event.currentTarget.src = `https://via.placeholder.com/800x500/0d6efd/ffffff?text=${encodeURIComponent(
              localized.title
            )}`;
          }}
        />
        {product.isRecommended && (
          <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-3">
            {t('products.recommended')}
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title>{localized.title}</Card.Title>
        <Card.Text className="text-muted small">{truncateText(localized.description, 120)}</Card.Text>

        <div className="mb-2">
          {localized.categories.map((category) => (
            <Badge key={`${product.id}-${category}`} bg="secondary" className="me-1">
              {category}
            </Badge>
          ))}
        </div>

        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3">
          <h4 className="text-primary mb-0">{product.price} {t('common.ruble')}</h4>
          <Badge bg={product.isAvailable ? 'success' : 'danger'}>
            {product.isAvailable ? t('products.inStock') : t('products.outOfStock')}
          </Badge>
        </Stack>

        <div className="small text-muted mb-3">
          {rating > 0 ? (
            <span>
              <StarFill className="text-warning me-1" />
              {t('products.rating', { rating })}
            </span>
          ) : (
            t('products.noRating')
          )}
        </div>

        <div className="reviews-box mb-3">
          <div className="fw-semibold mb-2">{t('products.reviews')}</div>
          {(product.reviews || []).length === 0 ? (
            <p className="small text-muted mb-0">{t('products.noReviews')}</p>
          ) : (
            <div className="d-grid gap-2">
              {(product.reviews || []).map((review) => (
                <div key={review.id} className="review-item">
                  <div className="d-flex justify-content-between small">
                    <strong>{review.userName}</strong>
                    <span>
                      <StarFill className="text-warning me-1" />
                      {review.rating}
                    </span>
                  </div>
                  <div className="small">{review.comment}</div>
                  <div className="text-muted small">{new Date(review.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && (
          <Form className="mt-auto" onSubmit={(event) => {
            event.preventDefault();
            void onReviewSubmit(product);
          }}>
            <Stack direction="horizontal" gap={2} className="mb-2">
              <Form.Select
                size="sm"
                value={reviewDraft.rating}
                onChange={(event) => onReviewChange(product.id, {
                  ...reviewDraft,
                  rating: Number(event.target.value),
                })}
                aria-label="Rating"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Form.Select>
              <Form.Control
                size="sm"
                value={reviewDraft.comment}
                placeholder={t('products.commentPlaceholder')}
                onChange={(event) => onReviewChange(product.id, {
                  ...reviewDraft,
                  comment: event.target.value,
                })}
              />
            </Stack>
            <AppButton size="sm" appVariant="outline" type="submit" className="w-100">
              {t('products.addReview')}
            </AppButton>
          </Form>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-0 pt-0">
        <Stack direction="horizontal" gap={2}>
          <AppButton
            appVariant={product.isAvailable ? 'primary' : 'secondary'}
            className="flex-grow-1"
            disabled={!product.isAvailable || addingId === product.id}
            onClick={() => void onAddToCart(product)}
          >
            {addingId === product.id ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {t('products.adding')}
              </>
            ) : (
              <>
                <Cart className="me-2" />
                {t('products.addToCart')}
              </>
            )}
          </AppButton>
          <AppButton appVariant="outline" onClick={() => void onLike(product)}>
            <HandThumbsUp />
          </AppButton>
        </Stack>
      </Card.Footer>
    </Card>
  );
});

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});

  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category')?.trim() ?? '';

  const { user } = useAuth();
  const { locale, t } = useLocale();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll(selectedCategory ? { category: selectedCategory } : undefined);
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setProducts(payload);
      setError('');
    } catch (requestError: any) {
      setError(requestError.message || t('products.empty'));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, t]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categoryOrder = useMemo(
    () => [t('category.processors'), t('category.graphics'), t('category.memory'), t('category.ssd')],
    [t]
  );

  const sections = useMemo(() => {
    const grouped = new Map<string, Product[]>();

    products.forEach((product) => {
      const category = getLocalizedProductText(product, locale).categories[0] || 'Other';
      const current = grouped.get(category) || [];
      current.push(product);
      grouped.set(category, current);
    });

    const orderedSectionNames = [
      ...categoryOrder,
      ...Array.from(grouped.keys()).filter((category) => !categoryOrder.includes(category)),
    ];

    return orderedSectionNames
      .map((name) => ({ name, products: grouped.get(name) || [] }))
      .filter((section) => section.products.length > 0);
  }, [products, locale, categoryOrder]);

  const addToCart = useCallback(
    async (product: Product) => {
      if (!user) {
        window.alert(t('products.loginToCart'));
        return;
      }

      setAddingId(product.id);

      try {
        await cartAPI.add(product.id, 1);
        const localized = getLocalizedProductText(product, locale);
        const cartKey = `cart_${user.id}`;
        const savedCart = localStorage.getItem(cartKey);
        const cart = savedCart ? JSON.parse(savedCart) : [];
        const existing = cart.find((item: any) => item.productId === product.id);

        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            productId: product.id,
            title: localized.title,
            price: product.price,
            quantity: 1,
          });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
      } catch {
        window.alert(t('products.addError'));
      } finally {
        setAddingId(null);
      }
    },
    [locale, t, user]
  );

  const likeProduct = useCallback(
    async (product: Product) => {
      if (!user) {
        window.alert(t('products.loginToLike'));
        return;
      }

      try {
        await productsAPI.like(product.id);
        await loadProducts();
      } catch {
        window.alert(t('products.likeError'));
      }
    },
    [loadProducts, t, user]
  );

  const updateReviewDraft = useCallback((productId: string | number, draft: ReviewDraft) => {
    setReviewDrafts((current) => ({ ...current, [String(productId)]: draft }));
  }, []);

  const submitReview = useCallback(
    async (product: Product) => {
      if (!user) {
        window.alert(t('products.loginToReview'));
        return;
      }

      const draft = reviewDrafts[String(product.id)] || { rating: 5, comment: '' };

      try {
        const response = await productsAPI.review(product.id, draft);
        setProducts((current) => current.map((item) => (
          item.id === product.id ? response.data.data : item
        )));
        updateReviewDraft(product.id, { rating: 5, comment: '' });
      } catch {
        window.alert(t('products.reviewError'));
      }
    },
    [reviewDrafts, t, updateReviewDraft, user]
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">{t('common.loading')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{t('common.error')}: {error}</Alert>
      </Container>
    );
  }

  if (sections.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">{t('products.empty')}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-2">{t('products.title')}</h1>
      <p className="text-muted mb-4">{t('products.subtitle')}</p>

      {sections.map((section) => (
        <section key={section.name} className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">{section.name}</h2>
            <Badge bg="light" text="dark">
              {t('products.sectionCount', { count: section.products.length })}
            </Badge>
          </div>

          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {section.products.map((product) => (
              <Col key={product.id}>
                <ProductCard
                  product={product}
                  locale={locale}
                  addingId={addingId}
                  reviewDraft={reviewDrafts[String(product.id)] || { rating: 5, comment: '' }}
                  isAuthenticated={Boolean(user)}
                  t={t}
                  onAddToCart={addToCart}
                  onLike={likeProduct}
                  onReviewChange={updateReviewDraft}
                  onReviewSubmit={submitReview}
                />
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </Container>
  );
}
