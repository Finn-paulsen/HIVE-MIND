import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { AUDIT_EVENTS, logEvent } from '../audit/auditLogger';
import { parseCoordinates } from './coordinateParser';
import { useHiveStore } from '../state/hive';

function formatTypeLabel(type) {
  return String(type || 'other')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, match => match.toUpperCase());
}

function matchesAsset(asset, query) {
  const lowerQuery = query.toLowerCase();
  const fields = [
    asset.name,
    asset.description,
    ...(Array.isArray(asset.tags) ? asset.tags : []),
    asset.codes?.iata,
    asset.codes?.icao,
  ].filter(Boolean);

  return fields.some(value => String(value).toLowerCase().includes(lowerQuery));
}

export function SearchBar({ onSelectAsset, onSelectCoordinates, assets = [] }) {
  const initialQuery = useHiveStore(state => state.searchQuery);
  const setSearchQuery = useHiveStore(state => state.setSearchQuery);
  const [inputValue, setInputValue] = useState(initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!inputValue.trim()) {
      return undefined;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
      setLoading(false);
      setDropdownOpen(true);
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const coordinateResult = useMemo(() => {
    if (!debouncedQuery) {
      return null;
    }

    const parsed = parseCoordinates(debouncedQuery);

    return parsed
      ? {
          kind: 'coordinate',
          label: `Navigate to ${parsed.lat.toFixed(4)}, ${parsed.lon.toFixed(4)}`,
          value: parsed,
        }
      : null;
  }, [debouncedQuery]);

  const groupedAssetResults = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }

    const matches = assets
      .filter(asset => matchesAsset(asset, debouncedQuery))
      .sort((left, right) => left.name.localeCompare(right.name));

    const groupedMap = new Map();
    matches.forEach(asset => {
      const category = asset.category || 'other';
      if (!groupedMap.has(category)) {
        groupedMap.set(category, []);
      }
      groupedMap.get(category).push(asset);
    });

    return [...groupedMap.entries()].map(([category, items]) => ({ category, items }));
  }, [assets, debouncedQuery]);

  const flatOptions = useMemo(() => {
    const options = [];

    if (coordinateResult) {
      options.push(coordinateResult);
    }

    groupedAssetResults.forEach(group => {
      group.items.forEach(asset => {
        options.push({
          kind: 'asset',
          value: asset,
          label: asset.name,
          category: group.category,
        });
      });
    });

    return options;
  }, [coordinateResult, groupedAssetResults]);

  const assetIndexMap = useMemo(() => {
    const indexMap = new Map();

    flatOptions.forEach((option, index) => {
      if (option.kind === 'asset') {
        indexMap.set(option.value.id, index);
      }
    });

    return indexMap;
  }, [flatOptions]);

  const executeSelection = (option) => {
    if (!option) {
      return;
    }

    if (option.kind === 'coordinate') {
      onSelectCoordinates(option.value);
      logEvent(AUDIT_EVENTS.SEARCH_EXECUTED, {
        query: debouncedQuery,
        mode: 'coordinates',
        coordinates: option.value,
      });
      setDropdownOpen(false);
      return;
    }

    onSelectAsset(option.value);
    setInputValue(option.value.name);
    setSearchQuery(option.value.name);
    setDebouncedQuery(option.value.name);
    setDropdownOpen(false);
    logEvent(AUDIT_EVENTS.SEARCH_EXECUTED, {
      query: debouncedQuery,
      mode: 'asset',
      assetId: option.value.id,
      category: option.value.category,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!dropdownOpen) {
        setDropdownOpen(true);
      }
      setHighlightedIndex(current => {
        const next = current + 1;
        return flatOptions.length ? next % flatOptions.length : -1;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!dropdownOpen) {
        setDropdownOpen(true);
      }
      setHighlightedIndex(current => {
        if (!flatOptions.length) {
          return -1;
        }
        return current <= 0 ? flatOptions.length - 1 : current - 1;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const fallbackIndex = highlightedIndex >= 0 && highlightedIndex < flatOptions.length ? highlightedIndex : 0;
      executeSelection(flatOptions[fallbackIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    setSearchQuery(nextValue);

    if (!nextValue.trim()) {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      setDebouncedQuery('');
      setLoading(false);
      setDropdownOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    setLoading(true);
    setDropdownOpen(true);
    setHighlightedIndex(0);
  };

  const handleClear = () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    setInputValue('');
    setDebouncedQuery('');
    setSearchQuery('');
    setLoading(false);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <Box ref={rootRef} sx={{ position: 'relative', mb: 1.5 }}>
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setDropdownOpen(Boolean(inputValue.trim()))}
        onKeyDown={handleKeyDown}
        placeholder="Search assets, tags, IATA/ICAO codes, or coordinates"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            fontSize: '11px',
            backgroundColor: '#FFFFFF',
            fontFamily: 'Arial, Tahoma, sans-serif',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: '#003366' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? <CircularProgress size={16} sx={{ color: '#003366', mr: 0.5 }} /> : null}
              {inputValue ? (
                <IconButton size="small" onClick={handleClear} sx={{ width: 20, height: 20 }}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
      />

      {dropdownOpen && (loading || flatOptions.length > 0 || debouncedQuery) ? (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            zIndex: 1200,
            borderRadius: 0,
            border: '1px solid #CCCCCC',
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <Typography sx={{ p: 1.5, fontSize: '11px', color: '#666666' }}>
              Searching…
            </Typography>
          ) : flatOptions.length === 0 ? (
            <Typography sx={{ p: 1.5, fontSize: '11px', color: '#666666' }}>
              No matching assets or coordinates.
            </Typography>
          ) : (
            <>
              {coordinateResult ? (
                <Box
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => executeSelection(coordinateResult)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    borderBottom: '1px solid #EEEEEE',
                    backgroundColor: highlightedIndex === 0 ? '#E6F2FF' : '#FFFFFF',
                  }}
                >
                  <Typography sx={{ fontSize: '11px', color: '#003366', fontWeight: 'bold' }}>
                    {coordinateResult.label}
                  </Typography>
                </Box>
              ) : null}

              {groupedAssetResults.map(group => (
                <Box key={group.category}>
                  <Typography
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#003366',
                      backgroundColor: '#F5F7FA',
                      borderBottom: '1px solid #EEEEEE',
                    }}
                  >
                    {formatTypeLabel(group.category)}
                  </Typography>
                  {group.items.map(asset => {
                    const flatIndex = assetIndexMap.get(asset.id) ?? -1;

                    return (
                      <Box
                        key={asset.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => executeSelection({ kind: 'asset', value: asset })}
                        sx={{
                          px: 1.5,
                          py: 1,
                          cursor: 'pointer',
                          borderBottom: '1px solid #F1F1F1',
                          backgroundColor: highlightedIndex === flatIndex ? '#E6F2FF' : '#FFFFFF',
                        }}
                      >
                        <Typography sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                          {asset.name}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#666666' }}>
                          {(asset.tags || []).slice(0, 3).join(' • ')}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
