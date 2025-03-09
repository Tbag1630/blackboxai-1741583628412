import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { DEFAULT_MAP_REGION } from '../utils/helpers';

export const useLocation = () => {
  const [location, setLocation] = useState(DEFAULT_MAP_REGION);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error('Location error:', error);
      }
    })();
  }, []);

  return { location, errorMsg };
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser({ ...user, ...userDoc.data() });
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};

export const useNotifications = () => {
  const [notification, setNotification] = useState(null);
  const [notificationError, setNotificationError] = useState(null);

  const requestPermissions = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        return status === 'granted';
      }
      return true;
    } catch (error) {
      setNotificationError(error);
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  return { notification, notificationError };
};

export const useTaskActions = () => {
  const db = getFirestore();
  const auth = getAuth();

  const applyForTask = useCallback(async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      if (taskDoc.data().postedBy === auth.currentUser.uid) {
        throw new Error('You cannot apply for your own task');
      }

      // Add application logic here
      return true;
    } catch (error) {
      Alert.alert('Error', error.message);
      return false;
    }
  }, []);

  const cancelTask = useCallback(async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      if (taskDoc.data().postedBy !== auth.currentUser.uid) {
        throw new Error('You can only cancel your own tasks');
      }

      // Add cancellation logic here
      return true;
    } catch (error) {
      Alert.alert('Error', error.message);
      return false;
    }
  }, []);

  return { applyForTask, cancelTask };
};

export const useImagePicker = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }, []);

  return { image, uploading, pickImage, takePhoto, setUploading };
};

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validationSchema) {
      try {
        validationSchema.validateSyncAt(name, { [name]: value });
        setErrors(prev => ({ ...prev, [name]: undefined }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [name]: error.message }));
      }
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    isValid,
  };
};

export default {
  useLocation,
  useAuth,
  useNotifications,
  useTaskActions,
  useImagePicker,
  useForm,
};
