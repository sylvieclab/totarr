import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Movie as MovieIcon,
  Tv as TvIcon,
  MusicNote as MusicIcon,
  Photo as PhotoIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ViewList as ViewListIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { DashboardStats, RecentItem, ServerStatus } from '../types';
import ScanHistory from '../components/ScanHistory';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [statsData, recentData, statusData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getRecentItems(),
        apiClient.getServerStatus()
      ]);

      setStats(statsData);
      setRecentItems(recentData.items);
      setServerStatus(statusData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie':
        return <MovieIcon sx={{ fontSize: 40, color: '#e50914' }} />;
      case 'show':
        return <TvIcon sx={{ fontSize: 40, color: '#2196f3' }} />;
      case 'artist':
      case 'album':
      case 'track':
        return <MusicIcon sx={{ fontSize: 40, color: '#4caf50' }} />;
      case 'photo':
        return <PhotoIcon sx={{ fontSize: 40, color: '#ff9800' }} />;
      default:
        return <ViewListIcon sx={{ fontSize: 40, color: '#757575' }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'movie':
        return '#e50914';
      case 'show':
        return '#2196f3';
      case 'artist':
      case 'album':
      case 'track':
        return '#4caf50';
      case 'photo':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={loadDashboardData}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your Plex media server
          </Typography>
        </Box>

        {/* Server Status Banner */}
        {serverStatus && (
          <Alert 
            severity={serverStatus.connected ? "success" : "error"}
            icon={serverStatus.connected ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="body2">
                <strong>{serverStatus.connected ? 'Connected' : 'Disconnected'}</strong>
              </Typography>
              {serverStatus.server_name && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2">
                    Server: {serverStatus.server_name}
                  </Typography>
                </>
              )}
              {serverStatus.version && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2">
                    Version: {serverStatus.version}
                  </Typography>
                </>
              )}
              {serverStatus.response_time_ms !== null && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2">
                    <SpeedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Response: {serverStatus.response_time_ms}ms
                  </Typography>
                </>
              )}
            </Stack>
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Libraries */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <ViewListIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h3" sx={{ mb: 1 }}>
                {stats?.total_libraries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Libraries
              </Typography>
            </Paper>
          </Grid>

          {/* Total Items */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <MovieIcon sx={{ fontSize: 48, color: '#e50914', mb: 1 }} />
              <Typography variant="h3" sx={{ mb: 1 }}>
                {stats?.total_items.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Scans */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
              <Typography variant="h3" sx={{ mb: 1 }}>
                {stats?.recent_scans || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scans (24h)
              </Typography>
            </Paper>
          </Grid>

          {/* Last Scan */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <RefreshIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 1, minHeight: '2em' }}>
                {formatDate(stats?.last_scan || null)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Scan
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Library Breakdown */}
        {stats && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Library Breakdown
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {stats.by_type.movie > 0 && (
                <Grid item xs={6} sm={4} md={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MovieIcon sx={{ fontSize: 40, color: '#e50914', mb: 1 }} />
                    <Typography variant="h5">{stats.by_type.movie}</Typography>
                    <Typography variant="body2" color="text.secondary">Movies</Typography>
                  </Box>
                </Grid>
              )}
              {stats.by_type.show > 0 && (
                <Grid item xs={6} sm={4} md={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TvIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                    <Typography variant="h5">{stats.by_type.show}</Typography>
                    <Typography variant="body2" color="text.secondary">TV Shows</Typography>
                  </Box>
                </Grid>
              )}
              {stats.by_type.artist > 0 && (
                <Grid item xs={6} sm={4} md={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MusicIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                    <Typography variant="h5">{stats.by_type.artist}</Typography>
                    <Typography variant="body2" color="text.secondary">Music</Typography>
                  </Box>
                </Grid>
              )}
              {stats.by_type.photo > 0 && (
                <Grid item xs={6} sm={4} md={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PhotoIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                    <Typography variant="h5">{stats.by_type.photo}</Typography>
                    <Typography variant="body2" color="text.secondary">Photos</Typography>
                  </Box>
                </Grid>
              )}
              {stats.by_type.other > 0 && (
                <Grid item xs={6} sm={4} md={2.4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ViewListIcon sx={{ fontSize: 40, color: '#757575', mb: 1 }} />
                    <Typography variant="h5">{stats.by_type.other}</Typography>
                    <Typography variant="body2" color="text.secondary">Other</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Recently Added */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recently Added
            </Typography>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={loadDashboardData}
            >
              Refresh
            </Button>
          </Box>
          
          {recentItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No recently added items
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {recentItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ display: 'flex', height: 120 }}>
                    {item.thumb ? (
                      <CardMedia
                        component="img"
                        sx={{ width: 80, objectFit: 'cover' }}
                        image={item.thumb}
                        alt={item.title}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          width: 80, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'grey.800'
                        }}
                      >
                        {getTypeIcon(item.type)}
                      </Box>
                    )}
                    <CardContent sx={{ flex: 1, py: 1.5, px: 2 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: getTypeColor(item.type),
                            color: 'white'
                          }} 
                        />
                        {item.year && (
                          <Chip 
                            label={item.year} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.library}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatDate(item.added_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ViewListIcon />}
                onClick={() => navigate('/libraries')}
                sx={{ py: 1.5 }}
              >
                View Libraries
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => setHistoryModalOpen(true)}
                sx={{ py: 1.5 }}
              >
                Scan History
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadDashboardData}
                sx={{ py: 1.5 }}
              >
                Refresh Data
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
                sx={{ py: 1.5 }}
              >
                Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Scan History Modal */}
      <Dialog 
        open={historyModalOpen} 
        onClose={() => setHistoryModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Scan History</Typography>
            <IconButton onClick={() => setHistoryModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ScanHistory limit={50} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
