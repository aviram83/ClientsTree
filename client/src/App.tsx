import { useAuthStore } from './store/authStore';
import { AppRouter } from './Router';
import { Modal } from './components/Modal';

function App() {
  const errorMessage = useAuthStore((s) => s.errorMessage);
  const closeErrorModal = useAuthStore((s) => s.closeErrorModal);

  return (
    <>
      <AppRouter />
      <Modal
        isOpen={!!errorMessage}
        onClose={closeErrorModal}
        title="Error"
        textColor="text-destructive"
      >
        <p>{errorMessage}</p>
      </Modal>
    </>
  );
}

export default App;
