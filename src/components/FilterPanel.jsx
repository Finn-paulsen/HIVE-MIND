import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess, Clear } from '@mui/icons-material';

const BUILDING_TYPES = [
  { value: 'power', label: 'Kraftwerke' },
  { value: 'airport', label: 'Flughäfen' },
  { value: 'server', label: 'Rechenzentren' },
  { value: 'gov', label: 'Behörden' },
  { value: 'water', label: 'Wasserwerke' },
  { value: 'base', label: 'Militärbasen' },
  { value: 'hospital', label: 'Krankenhäuser' },
  { value: 'fire', label: 'Feuerwachen' },
  { value: 'police', label: 'Polizei' },
  { value: 'school', label: 'Schulen' },
  { value: 'cityhall', label: 'Rathäuser' },
  { value: 'bridge', label: 'Brücken' },
  { value: 'port', label: 'Häfen' },
  { value: 'energy', label: 'Umspannwerke' },
  { value: 'metro', label: 'U-Bahn' },
  { value: 'university', label: 'Universitäten' },
  { value: 'control', label: 'Leitstellen' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'critical', label: 'Kritisch' },
  { value: 'offline', label: 'Offline' }
];

const COUNTRY_OPTIONS = [
  { value: 'DE', label: 'Deutschland' },
  { value: 'AT', label: 'Österreich' },
  { value: 'CH', label: 'Schweiz' },
  { value: 'NL', label: 'Niederlande' },
  { value: 'FR', label: 'Frankreich' },
  { value: 'UK', label: 'Vereinigtes Königreich' },
  { value: 'IT', label: 'Italien' },
  { value: 'ES', label: 'Spanien' },
  { value: 'PL', label: 'Polen' },
  { value: 'NO', label: 'Norwegen' },
  { value: 'SE', label: 'Schweden' },
  { value: 'DK', label: 'Dänemark' },
  { value: 'RU', label: 'Russland' },
  { value: 'KR', label: 'Südkorea' }
];

export function FilterPanel({ filters, onFilterChange, totalCount, filteredCount }) {
  const [expanded, setExpanded] = useState(true);

  const handleTypeChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, types: typeof value === 'string' ? value.split(',') : value });
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, statuses: typeof value === 'string' ? value.split(',') : value });
  };

  const handleCountryChange = (event) => {
    const value = event.target.value;
    onFilterChange({ ...filters, countries: typeof value === 'string' ? value.split(',') : value });
  };

  const handleSearchChange = (event) => {
    onFilterChange({ ...filters, search: event.target.value });
  };

  const handleClearAll = () => {
    onFilterChange({ types: [], statuses: [], countries: [], search: '' });
  };

  const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0 || 
                          filters.countries.length > 0 || filters.search !== '';

  return (
    <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          backgroundColor: '#2a4a7b',
          color: 'white',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Filter ({filteredCount} von {totalCount})
        </Typography>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            label="Suche nach Name"
            value={filters.search}
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
            placeholder="z.B. Berlin, München..."
          />

          {/* Building Type Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Gebäudetypen</InputLabel>
            <Select
              multiple
              value={filters.types}
              onChange={handleTypeChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={BUILDING_TYPES.find(t => t.value === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {BUILDING_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Checkbox checked={filters.types.indexOf(type.value) > -1} />
                  <ListItemText primary={type.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.statuses}
              onChange={handleStatusChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={STATUS_OPTIONS.find(s => s.value === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Checkbox checked={filters.statuses.indexOf(status.value) > -1} />
                  <ListItemText primary={status.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Country Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Länder</InputLabel>
            <Select
              multiple
              value={filters.countries}
              onChange={handleCountryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={COUNTRY_OPTIONS.find(c => c.value === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {COUNTRY_OPTIONS.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  <Checkbox checked={filters.countries.indexOf(country.value) > -1} />
                  <ListItemText primary={country.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={handleClearAll}
              sx={{ color: '#2a4a7b', borderColor: '#2a4a7b' }}
            >
              Alle Filter zurücksetzen
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
