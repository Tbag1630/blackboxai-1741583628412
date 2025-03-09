import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import TaskCard from './TaskCard';
import { EmptyState } from '../common';
import { Icon } from 'react-native-elements';

const TaskList = ({
  tasks,
  onRefresh,
  refreshing = false,
  onEndReached,
  loading = false,
  searchEnabled = true,
  emptyStateMessage = 'No tasks found',
  ListHeaderComponent = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Filter tasks based on search query
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.location.address.toLowerCase().includes(query)
    );
    setFilteredTasks(filtered);
  }, [searchQuery, tasks]);

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={
        <Icon
          name="tasks"
          type="font-awesome"
          size={50}
          color="#ccc"
        />
      }
      message={emptyStateMessage}
    />
  );

  return (
    <View style={styles.container}>
      {searchEnabled && (
        <SearchBar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          platform="ios"
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
        />
      )}

      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => <TaskCard task={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
});

export default TaskList;
