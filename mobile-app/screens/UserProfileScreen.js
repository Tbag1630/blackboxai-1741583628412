import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, Avatar, Icon, Button } from 'react-native-elements';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatDate } from '../utils/helpers';
import { Card, Badge } from '../components/common';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const db = getFirestore();
  const isOwnProfile = userId === auth.currentUser?.uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }

        // Fetch user stats
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', userId),
          where('status', '==', 'completed')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        const stats = {
          tasksCompleted: tasksSnapshot.size,
          totalEarnings: tasksSnapshot.docs.reduce((sum, doc) => sum + doc.data().budget, 0),
          avgRating: 4.8, // This would be calculated from reviews in a real app
          memberSince: userDoc.data().createdAt,
        };
        setStats(stats);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar
          rounded
          size="xlarge"
          source={{ uri: user.photoURL }}
          containerStyle={styles.avatar}
        />
        <Text h3 style={styles.name}>{user.fullName}</Text>
        {user.isTasker && (
          <Badge label="Professional Tasker" type="success" />
        )}
        <Text style={styles.bio}>{user.bio || 'No bio provided'}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon
            name="check-circle"
            type="font-awesome"
            color="#4CD964"
            size={24}
          />
          <Text style={styles.statNumber}>{stats.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon
            name="star"
            type="font-awesome"
            color="#FFD700"
            size={24}
          />
          <Text style={styles.statNumber}>{stats.avgRating}</Text>
          <Text style={styles.statLabel}>Average Rating</Text>
        </Card>

        <Card style={styles.statCard}>
          <Icon
            name="calendar"
            type="font-awesome"
            color="#007AFF"
            size={24}
          />
          <Text style={styles.statNumber}>
            {formatDate(stats.memberSince)}
          </Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </Card>
      </View>

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {user.skills.map((skill, index) => (
              <Badge
                key={index}
                label={skill}
                type="default"
                style={styles.skillBadge}
              />
            ))}
          </View>
        </Card>
      )}

      {/* Action Buttons */}
      {!isOwnProfile && (
        <View style={styles.actionButtons}>
          <Button
            title="Message"
            icon={{
              name: 'comment',
              type: 'font-awesome',
              color: '#fff',
            }}
            onPress={() => navigation.navigate('Chat', { otherUserId: userId })}
            containerStyle={styles.actionButton}
          />
        </View>
      )}

      {isOwnProfile && (
        <Button
          title="Edit Profile"
          type="outline"
          icon={{
            name: 'edit',
            type: 'font-awesome',
            color: '#007AFF',
          }}
          onPress={() => navigation.navigate('EditProfile')}
          containerStyle={styles.editButton}
        />
      )}
    </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    marginBottom: 15,
  },
  name: {
    marginBottom: 5,
  },
  bio: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  statCard: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  skillBadge: {
    margin: 5,
  },
  actionButtons: {
    padding: 15,
  },
  actionButton: {
    marginBottom: 10,
  },
  editButton: {
    margin: 15,
  },
});

export default UserProfileScreen;
