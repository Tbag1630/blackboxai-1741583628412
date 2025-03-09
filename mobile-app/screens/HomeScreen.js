import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, Button, Icon, FAB } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const TaskCard = ({ task, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card containerStyle={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskBudget}>${task.budget}</Text>
      </View>
      
      <Text style={styles.taskDescription} numberOfLines={2}>
        {task.description}
      </Text>
      
      <View style={styles.taskMetadata}>
        <View style={styles.metadataItem}>
          <Icon
            name="map-marker"
            type="font-awesome"
            size={16}
            color="#666"
          />
          <Text style={styles.metadataText}>{task.location}</Text>
        </View>
        
        <View style={styles.metadataItem}>
          <Icon
            name="clock-o"
            type="font-awesome"
            size={16}
            color="#666"
          />
          <Text style={styles.metadataText}>
            {new Date(task.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.taskStatus}>
        <View style={[styles.statusIndicator, { backgroundColor: task.urgent ? '#FF3B30' : '#4CD964' }]} />
        <Text style={styles.statusText}>
          {task.urgent ? 'Urgent' : 'Regular'}
        </Text>
      </View>
    </Card>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'myTasks'

  const auth = getAuth();
  const db = getFirestore();

  const fetchTasks = async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      let q;
      
      if (activeTab === 'available') {
        // Query for available tasks (not assigned)
        q = query(
          tasksRef,
          where('status', '==', 'open'),
          where('postedBy', '!=', auth.currentUser.uid)
        );
      } else {
        // Query for user's tasks (posted or assigned)
        q = query(
          tasksRef,
          where('postedBy', '==', auth.currentUser.uid)
        );
      }

      const querySnapshot = await getDocs(q);
      const tasksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetails', { task });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'available' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'available' && styles.activeTabText
          ]}>Available Tasks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'myTasks' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('myTasks')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'myTasks' && styles.activeTabText
          ]}>My Tasks</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => handleTaskPress(item)} />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="inbox"
              type="font-awesome"
              size={50}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              {activeTab === 'available' 
                ? 'No available tasks found'
                : 'You haven\'t posted any tasks yet'}
            </Text>
          </View>
        }
      />

      <FAB
        icon={{ name: 'plus', type: 'font-awesome' }}
        color="#007AFF"
        placement="right"
        onPress={() => navigation.navigate('CreateTask')}
      />
    </View>
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
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  cardContainer: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  taskBudget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
