import { getAverageRating, getLocalizedProductText, parseCsv, truncateText } from './product';
import { Product } from '../types';

const product: Product = {
  id: 'cpu-1',
  title: 'AMD Ryzen 5 7600',
  description: 'Русское описание',
  price: 100,
  isAvailable: true,
  categories: ['Процессоры'],
  images: { preview: '' },
  translations: {
    en: {
      title: 'AMD Ryzen 5 7600',
      description: 'English description',
      categories: ['Processors'],
    },
  },
  reviews: [
    { id: 1, userId: 1, userName: 'A', rating: 5, comment: 'Good', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 2, userId: 2, userName: 'B', rating: 3, comment: 'Ok', createdAt: '2026-01-02T00:00:00.000Z' },
  ],
};

test('returns localized product text', () => {
  expect(getLocalizedProductText(product, 'en').description).toBe('English description');
  expect(getLocalizedProductText(product, 'ru').categories).toEqual(['Процессоры']);
});

test('truncates long text', () => {
  expect(truncateText('abcdef', 3)).toBe('abc...');
});

test('calculates average rating from reviews', () => {
  expect(getAverageRating(product)).toBe(4);
});

test('parses comma-separated values', () => {
  expect(parseCsv('cpu, gaming, , amd')).toEqual(['cpu', 'gaming', 'amd']);
});
