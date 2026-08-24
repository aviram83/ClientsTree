import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useProfileStore } from './store/profileStore';
import { AppRouter } from './Router';
import { Modal } from './components/Modal';
import { WakeGate } from './components/WakeGate';
import { applyProfileLanguage } from './lib/applyProfileLanguage';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();
  const errorMessage = useAuthStore((s) => s.errorMessage);
  const closeErrorModal = useAuthStore((s) => s.closeErrorModal);
  const language = useProfileStore((s) => s.profile?.language);

  // Single sync point: whenever the saved profile language changes, apply it
  // to i18next. Not called anywhere else.
  useEffect(() => {
    applyProfileLanguage(i18n, language);
  }, [language, i18n]);

  return (
    <WakeGate>
      <AppRouter />
      <Modal
        isOpen={!!errorMessage}
        onClose={closeErrorModal}
        title={t('common.error')}
        textColor="text-destructive"
      >
        <p>{errorMessage}</p>
      </Modal>
    </WakeGate>
  );
}

export default App;
