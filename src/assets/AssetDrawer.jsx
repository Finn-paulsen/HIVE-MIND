import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Divider, IconButton, LinearProgress, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TerminalIcon from '@mui/icons-material/Terminal';
import { AUDIT_EVENTS, logEvent } from '../audit/auditLogger';
import { simulatedDelay } from '../ui/delays';

function getStatusMeta(status = 'active') {
  switch (status) {
    case 'active': return { label: 'Active', color: '#006600', background: '#E8F5E9' };
    case 'critical': return { label: 'Critical', color: '#CC0000', background: '#FDECEC' };
    case 'offline': return { label: 'Offline', color: '#666666', background: '#F5F5F5' };
    default: return { label: 'Maintenance', color: '#CC6600', background: '#FFF3E0' };
  }
}

function getConfidenceMeta(confidence = 0) {
  if (confidence >= 0.75) {
    return { label: 'High', color: '#006600', background: '#E8F5E9' };
  }

  if (confidence >= 0.45) {
    return { label: 'Medium', color: '#FF8C00', background: '#FFF3E0' };
  }

  return { label: 'Low', color: '#CC0000', background: '#FDECEC' };
}

function PlaceholderLine({ width = '100%', height = 12 }) {
  return (
    <div
      style={{
        width,
        height,
        background: '#E0E0E0',
        marginBottom: 10,
      }}
    />
  );
}

export function AssetDrawer({ asset, open, onClose, onOpenTerminal, isLoading = false }) {
  const [readySessionKey, setReadySessionKey] = useState('');
  const expectedReadyKey = useMemo(
    () => (open && asset ? `${asset.id}:${asset.updatedAt || 'na'}` : ''),
    [asset, open],
  );

  useEffect(() => {
    let cancelled = false;

    if (!expectedReadyKey || !asset) {
      return () => {
        cancelled = true;
      };
    }

    logEvent(AUDIT_EVENTS.ASSET_OPENED, {
      assetId: asset.id,
      name: asset.name,
      category: asset.category,
    });

    Promise.resolve(simulatedDelay())
      .then(() => {
        if (!cancelled) {
          setReadySessionKey(expectedReadyKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [asset, expectedReadyKey]);

  const showContent = Boolean(expectedReadyKey) && readySessionKey === expectedReadyKey && !isLoading;
  const loading = open && asset && !showContent;
  const confidenceMeta = getConfidenceMeta(asset?.confidence);
  const statusMeta = getStatusMeta(asset?.status);

  const handleClose = () => {
    setReadySessionKey('');
    onClose();
  };

  return (
    <Box
      sx={{
        border: '1px solid #CCCCCC',
        borderRight: 'none',
        borderLeft: '3px solid #003366',
        backgroundColor: '#FFFFFF',
        minHeight: 260,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid #CCCCCC',
        }}
      >
        <Typography sx={{ fontSize: '12px', fontWeight: 'bold', color: '#003366' }}>
          Asset Detail
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ width: 24, height: 24 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flex: 1 }}>
        {!open || !asset ? (
          <Typography sx={{ fontSize: '11px', color: '#666666', fontStyle: 'italic' }}>
            Select an asset from the map or search results.
          </Typography>
        ) : loading ? (
          <>
            <PlaceholderLine width="65%" height={18} />
            <PlaceholderLine width="30%" />
            <PlaceholderLine width="80%" />
            <PlaceholderLine width="90%" />
            <PlaceholderLine width="70%" />
            <PlaceholderLine width="40%" />
          </>
        ) : (
          <>
            <Typography sx={{ fontSize: '13px', fontWeight: 'bold', color: '#003366', mb: 1 }}>
              {asset.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <Chip
                label={asset.category}
                size="small"
                sx={{ height: 22, borderRadius: 0, backgroundColor: '#E6F0FA', fontSize: '11px' }}
              />
              <Chip
                label={statusMeta.label}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: 0,
                  backgroundColor: statusMeta.background,
                  color: statusMeta.color,
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            <Typography sx={{ fontSize: '11px', mb: 0.75 }}>
              <b>Coordinates:</b> {asset.coordinates[0].toFixed(4)}, {asset.coordinates[1].toFixed(4)}
            </Typography>
            <Typography sx={{ fontSize: '11px', mb: 0.75 }}>
              <b>Source:</b> {asset.source}
            </Typography>
            <Typography sx={{ fontSize: '11px', mb: 0.75 }}>
              <b>Last Updated:</b> {new Date(asset.updatedAt).toLocaleString('en-GB')}
            </Typography>
            <Typography sx={{ fontSize: '11px', mb: 0.5 }}>
              <b>Confidence:</b> {Math.round((asset.confidence || 0) * 100)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(asset.confidence || 0) * 100}
              sx={{
                mb: 1.25,
                height: 5,
                borderRadius: 0,
                backgroundColor: '#E0E0E0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: confidenceMeta.color,
                },
              }}
            />
            {asset.description && (
              <Typography sx={{ fontSize: '11px', mb: 1.5 }}>{asset.description}</Typography>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ fontSize: '11px', fontWeight: 'bold', mb: 1 }}>Tags</Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {(asset.tags || []).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ height: 22, borderRadius: 0, fontSize: '11px', backgroundColor: '#F5F5F5' }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<DashboardIcon />}
                onClick={() => onOpenTerminal && onOpenTerminal(asset)}
                sx={{ borderRadius: 0, fontSize: '11px', textTransform: 'none', borderColor: '#CCCCCC', color: '#003366', justifyContent: 'flex-start' }}
              >
                Open Control Panel
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<TerminalIcon />}
                onClick={() => onOpenTerminal && onOpenTerminal(asset)}
                sx={{ borderRadius: 0, fontSize: '11px', textTransform: 'none', backgroundColor: '#003366', justifyContent: 'flex-start' }}
              >
                Connect Terminal
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
