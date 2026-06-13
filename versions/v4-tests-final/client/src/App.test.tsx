import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const React = require('react');

  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Routes: () => null,
    Route: () => null,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children),
    useNavigate: () => jest.fn(),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
}, { virtual: true });

jest.mock('./AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: null, loading: false, logout: jest.fn() }),
}));

jest.mock('./LocaleContext', () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocale: () => ({
    locale: 'ru',
    bannerVisible: false,
    chooseLocale: jest.fn(),
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'brand') return 'TechFlow';
      if (key === 'nav.greeting') return `Привет, ${values?.name}!`;
      return key;
    },
  }),
}));

jest.mock('./components/LocaleBanner', () => () => null);

test('renders TechFlow navigation brand', () => {
  render(<App />);
  expect(screen.getByText('TechFlow')).toBeInTheDocument();
});
