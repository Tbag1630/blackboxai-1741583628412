import { Alert, Platform } from 'react-native';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Show error alert
export const showError = (title, message) => {
  Alert.alert(
    title,
    message,
    [{ text: 'OK' }],
    { cancelable: false }
  );
};

// Show success alert
export const showSuccess = (title, message, onPress = () => {}) => {
  Alert.alert(
    title,
    message,
    [{ text: 'OK', onPress }],
    { cancelable: false }
  );
};

// Show confirmation alert
export const showConfirmation = (title, message, onConfirm, onCancel = () => {}) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', onPress: onCancel, style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ],
    { cancelable: false }
  );
};

// Task status colors
export const STATUS_COLORS = {
  open: '#4CD964',
  assigned: '#007AFF',
  in_progress: '#FF9500',
  completed: '#4CD964',
  cancelled: '#FF3B30',
  pending_review: '#5856D6',
};

// Task categories
export const TASK_CATEGORIES = [
  { id: 'home_maintenance', label: 'Home Maintenance' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'moving', label: 'Moving' },
  { id: 'furniture_assembly', label: 'Furniture Assembly' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'yard_work', label: 'Yard Work' },
  { id: 'tech_help', label: 'Tech Help' },
  { id: 'other', label: 'Other' },
];

// Validation functions
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

// Platform-specific styles
export const platformStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
};

// Default map region (San Francisco)
export const DEFAULT_MAP_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Image picker options
export const IMAGE_PICKER_OPTIONS = {
  mediaTypes: 'Images',
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
};

// Video recorder options
export const VIDEO_RECORDER_OPTIONS = {
  maxDuration: 30,
  quality: '720p',
};

// API error messages
export const API_ERROR_MESSAGES = {
  default: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your internet connection.',
  auth: 'Authentication failed. Please log in again.',
  permission: 'You don\'t have permission to perform this action.',
};

// Local storage keys
export const STORAGE_KEYS = {
  user_preferences: '@quickbucks_user_prefs',
  cached_tasks: '@quickbucks_cached_tasks',
  auth_token: '@quickbucks_auth_token',
};

// App constants
export const APP_CONSTANTS = {
  max_task_title_length: 100,
  max_task_description_length: 1000,
  min_task_budget: 5,
  max_task_budget: 1000,
  max_image_size: 5 * 1024 * 1024, // 5MB
  max_video_duration: 30, // seconds
  search_radius: 50, // kilometers
  items_per_page: 20,
  chat_message_limit: 50,
};
