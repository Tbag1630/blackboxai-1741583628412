import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Text, Icon, Button, Slider } from 'react-native-elements';
import { TASK_CATEGORIES } from '../../utils/helpers';

const FilterChip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const TaskFilters = ({
  filters,
  onFiltersChange,
  visible,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      priceRange: [0, 1000],
      sortBy: 'recent',
      urgentOnly: false,
      distance: 50,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  const toggleCategory = (categoryId) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const setSortBy = (sortOption) => {
    setLocalFilters(prev => ({
      ...prev,
      sortBy: sortOption,
    }));
  };

  const toggleUrgentOnly = () => {
    setLocalFilters(prev => ({
      ...prev,
      urgentOnly: !prev.urgentOnly,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text h4>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" type="font-awesome" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.chipContainer}>
                {TASK_CATEGORIES.map(category => (
                  <FilterChip
                    key={category.id}
                    label={category.label}
                    selected={localFilters.categories.includes(category.id)}
                    onPress={() => toggleCategory(category.id)}
                  />
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Text>${localFilters.priceRange[0]}</Text>
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(values) => setLocalFilters(prev => ({
                    ...prev,
                    priceRange: values,
                  }))}
                  minimumValue={0}
                  maximumValue={1000}
                  step={10}
                  allowOverlap={false}
                  thumbStyle={styles.sliderThumb}
                  trackStyle={styles.sliderTrack}
                  style={styles.slider}
                />
                <Text>${localFilters.priceRange[1]}</Text>
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { id: 'recent', label: 'Most Recent' },
                  { id: 'price_high', label: 'Price: High to Low' },
                  { id: 'price_low', label: 'Price: Low to High' },
                  { id: 'distance', label: 'Distance' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      localFilters.sortBy === option.id && styles.sortOptionSelected,
                    ]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      localFilters.sortBy === option.id && styles.sortOptionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance (km)</Text>
              <Slider
                value={localFilters.distance}
                onValueChange={(value) => setLocalFilters(prev => ({
                  ...prev,
                  distance: value,
                }))}
                minimumValue={1}
                maximumValue={100}
                step={1}
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
              />
              <Text style={styles.distanceText}>{localFilters.distance} km</Text>
            </View>

            {/* Urgent Only Toggle */}
            <TouchableOpacity
              style={styles.urgentToggle}
              onPress={toggleUrgentOnly}
            >
              <Text>Show Urgent Tasks Only</Text>
              <Icon
                name={localFilters.urgentOnly ? 'check-square' : 'square-o'}
                type="font-awesome"
                size={24}
                color={localFilters.urgentOnly ? '#007AFF' : '#666'}
              />
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Reset"
              type="outline"
              onPress={handleReset}
              containerStyle={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              containerStyle={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 5,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007AFF',
  },
  sliderTrack: {
    height: 4,
  },
  sortOptions: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sortOptionSelected: {
    backgroundColor: '#007AFF',
  },
  sortOptionText: {
    color: '#666',
  },
  sortOptionTextSelected: {
    color: '#fff',
  },
  distanceText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#666',
  },
  urgentToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    marginRight: 10,
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
  },
});

export default TaskFilters;
