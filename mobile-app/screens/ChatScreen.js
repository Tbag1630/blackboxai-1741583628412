import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Input, Text, Avatar } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

const Message = ({ message, isOwnMessage }) => {
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {!isOwnMessage && (
        <Avatar
          rounded
          size="small"
          source={{ uri: message.senderAvatar }}
          containerStyle={styles.messageAvatar}
        />
      )}
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        {!isOwnMessage && (
          <Text style={styles.messageSender}>{message.senderName}</Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {messageTime}
        </Text>
      </View>
    </View>
  );
};

const ChatScreen = ({ route, navigation }) => {
  const { taskId, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
          // Update navigation title with user name
          navigation.setOptions({
            title: userDoc.data().fullName,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  useEffect(() => {
    const chatId = [currentUser.uid, otherUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messageList.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [taskId, otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId = [currentUser.uid, otherUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    try {
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderAvatar: currentUser.photoURL,
        timestamp: new Date().toISOString(),
        taskId,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Message
            message={item}
            isOwnMessage={item.senderId === currentUser.uid}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          containerStyle={styles.textInput}
          inputContainerStyle={styles.textInputContainer}
          rightIcon={{
            type: 'font-awesome',
            name: 'send',
            color: newMessage.trim() ? '#007AFF' : '#999',
            onPress: sendMessage,
          }}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 5,
  },
  messageSender: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: '#666',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  textInput: {
    paddingHorizontal: 0,
    margin: 0,
  },
  textInputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
});

export default ChatScreen;
