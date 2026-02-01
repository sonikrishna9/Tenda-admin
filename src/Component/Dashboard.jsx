import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const stats = [
    { title: 'Total Categories', value: '24', icon: <CategoryIcon />, color: '#1976d2' },
    { title: 'Total Products', value: '156', icon: <ShoppingCartIcon />, color: '#2e7d32' },
    { title: 'Total Blogs', value: '42', icon: <ArticleIcon />, color: '#ed6c02' },
    { title: 'Monthly Growth', value: '+12%', icon: <TrendingUpIcon />, color: '#9c27b0' },
  ];

  const recentActivities = [
    { text: 'New category "Electronics" added', time: '2 hours ago' },
    { text: 'Product "iPhone 15" updated', time: '4 hours ago' },
    { text: 'Blog "Tech Trends 2024" published', time: '1 day ago' },
    { text: 'User registration spike detected', time: '2 days ago' },
  ];

  const chartData = [
    { month: 'Jan', categories: 20, products: 120 },
    { month: 'Feb', categories: 22, products: 135 },
    { month: 'Mar', categories: 24, products: 145 },
    { month: 'Apr', categories: 26, products: 150 },
    { month: 'May', categories: 28, products: 156 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Chart Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Growth Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="categories" stroke="#1976d2" strokeWidth={2} />
                <Line type="monotone" dataKey="products" stroke="#2e7d32" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.text}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Section */}
      <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Performance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>Server Uptime</Typography>
            <LinearProgress variant="determinate" value={99.8} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">99.8%</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>Storage Usage</Typography>
            <LinearProgress variant="determinate" value={75} color="warning" sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">75% (15GB/20GB)</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" gutterBottom>Response Time</Typography>
            <LinearProgress variant="determinate" value={95} color="success" sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">95% under 200ms</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;