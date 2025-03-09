import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, navigate to Home screen
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
        <View style={styles.innerContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text h1 style={styles.title}>QuickBucks</Text>
            <Text style={styles.subtitle}>Your Task Marketplace</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
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

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
            />

            <Button
              title="Sign Up"
              type="outline"
              onPress={() => navigation.navigate('Signup')}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonText}
            />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <Text style={styles.orText}>OR</Text>
            <Button
              title="Continue with Google"
              icon={{
                type: 'font-awesome',
                name: 'google',
                color: '#EA4335',
                size: 20,
              }}
              type="outline"
              containerStyle={styles.socialButtonContainer}
              buttonStyle={styles.socialButton}
              titleStyle={styles.socialButtonText}
              // TODO: Implement Google Sign In
              onPress={() => Alert.alert('Coming Soon', 'Google login will be available soon!')}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
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
  outlineButton: {
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  outlineButtonText: {
    color: '#007AFF',
  },
  socialContainer: {
    alignItems: 'center',
  },
  orText: {
    color: '#666',
    marginVertical: 20,
    fontSize: 16,
  },
  socialButtonContainer: {
    width: '100%',
    marginBottom: 10,
  },
  socialButton: {
    borderColor: '#EA4335',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
  },
  socialButtonText: {
    color: '#EA4335',
    marginLeft: 10,
  },
});

export default LoginScreen;
