import React from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { useLocale } from '../LocaleContext';
import AppButton from './AppButton';

export default function LocaleBanner() {
  const { bannerVisible, chooseLocale, t } = useLocale();

  if (!bannerVisible) {
    return null;
  }

  return (
    <Alert
      variant="dark"
      className="position-fixed bottom-0 start-50 translate-middle-x shadow-lg mb-3"
      style={{ zIndex: 1080, maxWidth: 720, width: 'calc(100% - 2rem)' }}
    >
      <Stack direction="horizontal" gap={3} className="flex-wrap justify-content-between">
        <div>
          <strong>{t('locale.question')}</strong>
          <div className="small opacity-75">{t('locale.text')}</div>
        </div>
        <Stack direction="horizontal" gap={2}>
          <AppButton size="sm" appVariant="primary" onClick={() => void chooseLocale('ru')}>
            {t('locale.ru')}
          </AppButton>
          <AppButton size="sm" appVariant="outline" onClick={() => void chooseLocale('en')}>
            {t('locale.en')}
          </AppButton>
        </Stack>
      </Stack>
    </Alert>
  );
}
