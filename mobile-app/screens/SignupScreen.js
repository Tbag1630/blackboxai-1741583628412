import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with full name
      await updateProfile(user, {
        displayName: fullName,
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        createdAt: new Date().toISOString(),
        tasksCompleted: 0,
        rating: 0,
        skills: [],
        isTasker: false,
      });

      // Navigate to Home screen
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text h2 style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join QuickBucks today!</Text>
            </View>

            {/* Signup Form */}
            <View style={styles.formContainer}>
              <Input
                placeholder="Full Name"
                leftIcon={{ type: 'font-awesome', name: 'user', size: 20 }}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                containerStyle={styles.inputContainer}
              />

              <Input
                placeholder="Email"
                leftIcon={{ type: 'font-awesome', name: 'envelope', size: 18 }}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCompleteType="email"
                containerStyle={styles.inputContainer}
              />

              <Input
                placeholder="Password"
                leftIcon={{ type: 'font-awesome', name: 'lock', size: 24 }}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerStyle={styles.inputContainer}
              />

              <Input
                placeholder="Confirm Password"
                leftIcon={{ type: 'font-awesome', name: 'lock', size: 24 }}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                containerStyle={styles.inputContainer}
              />

              <Button
                title="Sign Up"
                onPress={handleSignup}
                loading={loading}
                containerStyle={styles.buttonContainer}
                buttonStyle={styles.button}
              />

              <Button
                title="Already have an account? Login"
                type="clear"
                onPress={() => navigation.navigate('Login')}
                containerStyle={styles.buttonContainer}
                titleStyle={styles.linkButtonText}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default SignupScreen;
