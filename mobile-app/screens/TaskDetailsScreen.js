import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Text, Button, Icon, Divider } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const [taskPoster, setTaskPoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  const isOwnTask = task.postedBy === currentUser.uid;

  useEffect(() => {
    const fetchTaskPoster = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', task.postedBy));
        if (userDoc.exists()) {
          setTaskPoster(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching task poster:', error);
      }
    };

    fetchTaskPoster();
    setHasApplied(task.applications?.some(app => app.taskerId === currentUser.uid) || false);
  }, [task]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        applications: arrayUnion({
          taskerId: currentUser.uid,
          taskerName: currentUser.displayName,
          appliedAt: new Date().toISOString(),
          status: 'pending',
        }),
        views: increment(1),
      });
      setHasApplied(true);
      Alert.alert('Success', 'Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for task:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      taskId: task.id,
      otherUserId: task.postedBy,
    });
  };

  const handleVerify = () => {
    navigation.navigate('ARVerification', {
      taskId: task.id,
    });
  };

  const openMap = () => {
    const { latitude, longitude } = task.location.coordinates;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
    });
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Task Header */}
      <View style={styles.header}>
        <Text h4 style={styles.title}>{task.title}</Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budget}>${task.budget}</Text>
        </View>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, task.urgent && styles.urgentBadge]}>
        <Text style={styles.statusText}>
          {task.urgent ? 'URGENT' : 'REGULAR'}
        </Text>
      </View>

      {/* Task Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.location}>{task.location.address}</Text>
        <TouchableOpacity onPress={openMap}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                ...task.location.coordinates,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={false}
            >
              <Marker coordinate={task.location.coordinates} />
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapText}>Open in Maps</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Posted By */}
      {taskPoster && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posted By</Text>
          <View style={styles.posterInfo}>
            <Icon
              name="user-circle"
              type="font-awesome"
              size={40}
              color="#666"
            />
            <View style={styles.posterDetails}>
              <Text style={styles.posterName}>{taskPoster.fullName}</Text>
              <Text style={styles.posterStats}>
                Tasks Completed: {taskPoster.tasksCompleted}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isOwnTask && (
          <>
            <Button
              title={hasApplied ? "Applied" : "Apply"}
              disabled={hasApplied}
              loading={loading}
              onPress={handleApply}
              containerStyle={styles.buttonContainer}
              buttonStyle={[
                styles.button,
                hasApplied && styles.appliedButton
              ]}
            />
            <Button
              title="Chat"
              onPress={handleChat}
              containerStyle={styles.buttonContainer}
              buttonStyle={[styles.button, styles.chatButton]}
              icon={{
                name: 'comment',
                type: 'font-awesome',
                color: '#fff',
                size: 20,
              }}
            />
          </>
        )}
        {task.status === 'assigned' && task.assignedTo === currentUser.uid && (
          <Button
            title="Verify Completion"
            onPress={handleVerify}
            containerStyle={styles.buttonContainer}
            buttonStyle={[styles.button, styles.verifyButton]}
            icon={{
              name: 'check-circle',
              type: 'font-awesome',
              color: '#fff',
              size: 20,
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 10,
  },
  budgetContainer: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
  },
  budget: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    backgroundColor: '#4CD964',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  urgentBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterDetails: {
    marginLeft: 15,
  },
  posterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  posterStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  appliedButton: {
    backgroundColor: '#8E8E93',
  },
  chatButton: {
    backgroundColor: '#5856D6',
  },
  verifyButton: {
    backgroundColor: '#4CD964',
  },
});

export default TaskDetailsScreen;
