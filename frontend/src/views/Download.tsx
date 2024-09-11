import { Container } from '@mui/material';
import DownloadPersist from '../components/DownloadPersist';

export default function Download() {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 8 }}>
      <DownloadPersist />
    </Container>
  );
}
