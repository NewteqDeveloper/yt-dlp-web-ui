import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { serverURL } from '../atoms/settings';
import { ffetch } from '../lib/httpClient';
import { useToast } from '../hooks/toast';

export default function RestartService() {
  const [loading, setLoading] = useState(false);
  const serverAddr = useRecoilValue(serverURL);
  const { pushMessage } = useToast();

  const handleRestart = async () => {
    setLoading(true);
    try {
      const response = await ffetch(`${serverAddr}/restart-service`, {
        method: 'POST',
      });
      if (response.ok) {
        pushMessage('Service restarted successfully!', 'success');
      } else {
        pushMessage('Failed to restart the service', 'error');
      }
    } catch (error) {
      pushMessage('An error occurred while restarting the service', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '4rem',
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        onClick={handleRestart}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Restart Service'}
      </Button>
    </div>
  );
}
