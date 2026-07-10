import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Alert, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export const PrescriptionListPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Prescripciones</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/prescriptions/new')}>
          Nueva prescripción
        </Button>
      </Box>

      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Nota:</strong> El endpoint de listado de prescripciones (<code>GET /prescriptions</code>) no está
          implementado aún en el backend. Solo es posible crear prescripciones nuevas.
        </Typography>
        <Typography variant="body2">
          Para ver las prescripciones de un paciente, busca el paciente en la sección{' '}
          <strong>Pacientes</strong> y accede a su detalle.
        </Typography>
      </Alert>

      <Button
        variant="outlined"
        onClick={() => navigate('/patients')}
        sx={{ mt: 1 }}
      >
        Ir a Pacientes
      </Button>
    </Box>
  );
};
