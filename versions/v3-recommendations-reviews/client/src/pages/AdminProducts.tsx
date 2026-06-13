import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { productsAPI } from '../api';
import AppButton from '../components/AppButton';
import { useAuth } from '../AuthContext';
import { useLocale } from '../LocaleContext';
import { Product, ProductFormData } from '../types';
import { getLocalizedProductText, normalizeProductForm, parseCsv } from '../utils/product';

const emptyForm: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  isAvailable: true,
  categories: [],
  tags: [],
  images: { preview: '' },
  translations: {},
};

export default function AdminProducts() {
  const { user } = useAuth();
  const { locale, t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll();
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
      setError('');
    } catch (requestError: any) {
      setError(requestError.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (canManage) {
      void loadProducts();
    } else {
      setLoading(false);
    }
  }, [canManage, loadProducts]);

  const formTitle = useMemo(() => editingId ? t('admin.formEdit') : t('admin.formCreate'), [editingId, t]);

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      isAvailable: product.isAvailable,
      categories: product.categories || [],
      tags: product.tags || [],
      images: { preview: product.images?.preview || '' },
      translations: product.translations || {},
    });
    setMessage('');
    setError('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = normalizeProductForm(form);

      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }

      setMessage(t('admin.saved'));
      resetForm();
      await loadProducts();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || t('admin.error'));
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">{t('admin.noAccess')}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">{t('common.loading')}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>{t('admin.title')}</h1>
      <p className="text-muted">{t('admin.subtitle')}</p>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={5}>
          <Card>
            <Card.Body>
              <h2 className="h4 mb-3">{formTitle}</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('admin.titleField')}</Form.Label>
                  <Form.Control
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('admin.description')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('admin.price')}</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('admin.category')}</Form.Label>
                      <Form.Control
                        value={form.categories.join(', ')}
                        onChange={(event) => setForm((current) => ({ ...current, categories: parseCsv(event.target.value) }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>{t('admin.tags')}</Form.Label>
                  <Form.Control
                    value={form.tags.join(', ')}
                    onChange={(event) => setForm((current) => ({ ...current, tags: parseCsv(event.target.value) }))}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('admin.image')}</Form.Label>
                  <Form.Control
                    value={form.images.preview}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      images: { preview: event.target.value },
                    }))}
                  />
                </Form.Group>
                <Form.Check
                  className="mb-4"
                  checked={form.isAvailable}
                  onChange={(event) => setForm((current) => ({ ...current, isAvailable: event.target.checked }))}
                  label={t('admin.available')}
                />
                <div className="d-flex gap-2">
                  <AppButton type="submit" disabled={saving}>
                    {saving ? t('common.loading') : t('common.save')}
                  </AppButton>
                  {editingId && (
                    <AppButton appVariant="outline" type="button" onClick={resetForm}>
                      {t('common.cancel')}
                    </AppButton>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>{t('admin.titleField')}</th>
                    <th>{t('admin.category')}</th>
                    <th>{t('admin.price')}</th>
                    <th>{t('common.edit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const localized = getLocalizedProductText(product, locale);

                    return (
                      <tr key={product.id}>
                        <td>{localized.title}</td>
                        <td>{localized.categories.join(', ')}</td>
                        <td>{product.price} {t('common.ruble')}</td>
                        <td>
                          <AppButton size="sm" appVariant="outline" onClick={() => editProduct(product)}>
                            {t('common.edit')}
                          </AppButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
