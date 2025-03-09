import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ARVerificationScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  
  const cameraRef = useRef(null);
  const auth = getAuth();
  const storage = getStorage();
  const db = getFirestore();

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    try {
      const videoRecordPromise = cameraRef.current.recordAsync({
        maxDuration: 30, // 30 seconds max
        quality: Camera.Constants.VideoQuality['720p'],
        mute: false,
      });

      if (videoRecordPromise) {
        const data = await videoRecordPromise;
        const uri = data.uri;
        console.log('Video recorded at:', uri);
        await uploadVideo(uri);
      }
    } catch (error) {
      console.error('Failed to record video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    
    cameraRef.current.stopRecording();
  };

  const uploadVideo = async (uri) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a unique filename
      const filename = `task-verification/${taskId}/${auth.currentUser.uid}_${Date.now()}.mp4`;
      const storageRef = ref(storage, filename);
      
      // Upload video
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update task document with verification video
      await updateDoc(doc(db, 'tasks', taskId), {
        verificationVideo: {
          url: downloadURL,
          uploadedAt: new Date().toISOString(),
          uploadedBy: auth.currentUser.uid,
        },
        status: 'pending_review',
      });

      Alert.alert(
        'Success',
        'Video uploaded successfully! Task status updated to pending review.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to upload video:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
      >
        <GLView
          style={styles.arOverlay}
          onContextCreate={async (gl) => {
            // AR overlay setup would go here
            // For MVP, we'll just use the camera view
          }}
        />

        <View style={styles.controlsContainer}>
          {/* Camera flip button */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <Icon
              name="camera"
              type="font-awesome"
              color="#fff"
              size={20}
            />
          </TouchableOpacity>

          {/* Record button */}
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={styles.flipButton} />
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}

        {/* Upload indicator */}
        {isUploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.uploadingText}>Uploading video...</Text>
          </View>
        )}
      </Camera>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Record a video showing the completed task.
          Maximum duration: 30 seconds.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff0000',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 16,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ARVerificationScreen;
