import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Text, Button as RNEButton } from 'react-native-elements';

// Custom Button component
export const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'normal',
  loading = false,
  disabled = false,
  icon = null,
  style = {},
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    type === 'secondary' && styles.buttonSecondary,
    type === 'outline' && styles.buttonOutline,
    size === 'small' && styles.buttonSmall,
    size === 'large' && styles.buttonLarge,
    disabled && styles.buttonDisabled,
    style,
  ];

  const titleStyles = [
    styles.buttonTitle,
    type === 'secondary' && styles.buttonTitleSecondary,
    type === 'outline' && styles.buttonTitleOutline,
    size === 'small' && styles.buttonTitleSmall,
    size === 'large' && styles.buttonTitleLarge,
    disabled && styles.buttonTitleDisabled,
  ];

  return (
    <RNEButton
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      buttonStyle={buttonStyles}
      titleStyle={titleStyles}
      {...props}
    />
  );
};

// Card component
export const Card = ({ children, style = {}, onPress }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </CardComponent>
  );
};

// Loading Spinner
export const LoadingSpinner = ({ size = 'large', color = '#007AFF' }) => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

// Error Message
export const ErrorMessage = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && (
      <Button
        title="Retry"
        onPress={onRetry}
        type="outline"
        size="small"
        style={styles.retryButton}
      />
    )}
  </View>
);

// Empty State
export const EmptyState = ({ icon, message, action }) => (
  <View style={styles.emptyContainer}>
    {icon}
    <Text style={styles.emptyText}>{message}</Text>
    {action}
  </View>
);

// Badge
export const Badge = ({ label, type = 'default', size = 'normal' }) => (
  <View style={[
    styles.badge,
    styles[`badge${type.charAt(0).toUpperCase() + type.slice(1)}`],
    size === 'small' && styles.badgeSmall,
    size === 'large' && styles.badgeLarge,
  ]}>
    <Text style={[
      styles.badgeText,
      styles[`badgeText${type.charAt(0).toUpperCase() + type.slice(1)}`],
      size === 'small' && styles.badgeTextSmall,
      size === 'large' && styles.badgeTextLarge,
    ]}>
      {label}
    </Text>
  </View>
);

// Divider
export const Divider = ({ style = {} }) => (
  <View style={[styles.divider, style]} />
);

const styles = StyleSheet.create({
  // Button styles
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTitleSecondary: {
    color: '#fff',
  },
  buttonTitleOutline: {
    color: '#007AFF',
  },
  buttonTitleSmall: {
    fontSize: 14,
  },
  buttonTitleLarge: {
    fontSize: 18,
  },
  buttonTitleDisabled: {
    color: '#999',
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
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
  },

  // Loading Spinner styles
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error Message styles
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 8,
  },

  // Empty State styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },

  // Badge styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  badgeSuccess: {
    backgroundColor: '#4CD964',
  },
  badgeWarning: {
    backgroundColor: '#FF9500',
  },
  badgeError: {
    backgroundColor: '#FF3B30',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#fff',
  },
  badgeTextWarning: {
    color: '#fff',
  },
  badgeTextError: {
    color: '#fff',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  badgeTextLarge: {
    fontSize: 14,
  },

  // Divider styles
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
});

export default {
  Button,
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  Badge,
  Divider,
};
