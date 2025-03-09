import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, formatDate, STATUS_COLORS } from '../../utils/helpers';
import { Card, Badge } from '../common';

const TaskCard = ({ task, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(task);
    } else {
      navigation.navigate('TaskDetails', { task });
    }
  };

  const getStatusColor = () => {
    return STATUS_COLORS[task.status] || STATUS_COLORS.open;
  };

  const getStatusLabel = () => {
    switch (task.status) {
      case 'open':
        return 'Available';
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending_review':
        return 'Pending Review';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          {task.urgent && (
            <Badge
              label="Urgent"
              type="error"
              size="small"
              style={styles.urgentBadge}
            />
          )}
        </View>
        <Text style={styles.budget}>
          {formatCurrency(task.budget)}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.metadata}>
        <View style={styles.metadataItem}>
          <Icon
            name="map-marker"
            type="font-awesome"
            size={16}
            color="#666"
          />
          <Text style={styles.metadataText}>
            {task.location.address}
          </Text>
        </View>

        <View style={styles.metadataItem}>
          <Icon
            name="clock-o"
            type="font-awesome"
            size={16}
            color="#666"
          />
          <Text style={styles.metadataText}>
            {formatDate(task.postedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>
            {getStatusLabel()}
          </Text>
        </View>

        {task.applications && (
          <View style={styles.applicationsCount}>
            <Icon
              name="users"
              type="font-awesome"
              size={14}
              color="#666"
            />
            <Text style={styles.applicationsText}>
              {task.applications.length} {task.applications.length === 1 ? 'applicant' : 'applicants'}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  urgentBadge: {
    marginLeft: 8,
  },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  applicationsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default TaskCard;
