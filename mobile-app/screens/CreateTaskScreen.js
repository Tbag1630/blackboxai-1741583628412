import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Input, Button, Text, Slider } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';

const CreateTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState(1);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return false;
    }
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a task location');
      return false;
    }
    return true;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        location: {
          address: address.trim(),
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
        urgent: urgency > 2,
        status: 'open',
        postedBy: auth.currentUser.uid,
        postedAt: new Date().toISOString(),
        views: 0,
        applications: [],
      };

      await addDoc(collection(db, 'tasks'), taskData);
      Alert.alert(
        'Success',
        'Task created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text h4 style={styles.title}>Create New Task</Text>

        <Input
          placeholder="Task Title"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.inputContainer}
          leftIcon={{ type: 'font-awesome', name: 'tasks', size: 20 }}
        />

        <Input
          placeholder="Task Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          containerStyle={styles.inputContainer}
          leftIcon={{ type: 'font-awesome', name: 'file-text', size: 20 }}
        />

        <Input
          placeholder="Budget ($)"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
          leftIcon={{ type: 'font-awesome', name: 'dollar', size: 20 }}
        />

        <Input
          placeholder="Location Address"
          value={address}
          onChangeText={setAddress}
          containerStyle={styles.inputContainer}
          leftIcon={{ type: 'font-awesome', name: 'map-marker', size: 20 }}
        />

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={location}
            onRegionChangeComplete={setLocation}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
              onDragEnd={(e) => setLocation({
                ...location,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
              })}
            />
          </MapView>
        </View>

        <View style={styles.urgencyContainer}>
          <Text style={styles.urgencyLabel}>Urgency Level</Text>
          <Slider
            value={urgency}
            onValueChange={setUrgency}
            minimumValue={1}
            maximumValue={3}
            step={1}
            thumbStyle={styles.sliderThumb}
            thumbTintColor="#007AFF"
            minimumTrackTintColor="#007AFF"
          />
          <View style={styles.urgencyLabels}>
            <Text>Normal</Text>
            <Text>Important</Text>
            <Text>Urgent</Text>
          </View>
        </View>

        <Button
          title="Create Task"
          onPress={handleCreateTask}
          loading={loading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  urgencyContainer: {
    marginBottom: 20,
  },
  urgencyLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  urgencyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderThumb: {
    width: 20,
    height: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
  },
});

export default CreateTaskScreen;
