import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          top: { xs: 10, sm: 20 },
          right: { xs: 10, sm: 20 },
          backgroundColor: muiTheme.palette.background.paper,
          boxShadow: muiTheme.shadows[4],
          '&:hover': {
            backgroundColor: isDark 
              ? muiTheme.palette.grey[800]
              : muiTheme.palette.grey[100]
          }
        }}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
