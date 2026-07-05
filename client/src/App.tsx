import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRouter } from './Router';
import { Modal } from './components/Modal';

function App() {
  const auth = useAuth();

  return (
    <>
      <AppRouter />
      <Modal
        isOpen={!!auth.errorMessage}
        onClose={auth.closeErrorModal}
        title="Error"
        textColor="text-destructive"
      >
        <p>{auth.errorMessage}</p>
      </Modal>
    </>
  );
}

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default Root;
