import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface VideoProgressSectionProps {
  categories: Category[];
  customCategoryIcons: { [key: string]: any };
  calculateCategoryVideoPercentage: (categoryId: string) => number;
  getVideoWatchCounts: (categoryId: string) => { [videoId: string]: { title: string; count: number } };
}

const VideoProgressSection: React.FC<VideoProgressSectionProps> = ({
  categories,
  customCategoryIcons,
  calculateCategoryVideoPercentage,
  getVideoWatchCounts,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Video Progress</Text>
      <Text style={styles.sectionSubtitle}>Percentage of videos watched in each category</Text>

      {categories.map(category => {
        const videoPercentage = calculateCategoryVideoPercentage(category.id);
        const videoWatchCounts = getVideoWatchCounts(category.id);
        const hasCustomIcon = customCategoryIcons[category.id];

        return (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              {hasCustomIcon ? (
                <Image
                  source={customCategoryIcons[category.id]}
                  style={styles.categoryIcon}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={80}
                  color="#007AFF"
                />
              )}
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPercentage}>{videoPercentage.toFixed(0)}%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${videoPercentage}%` }]} />
            </View>

            <View style={styles.videoCountsContainer}>
              {Object.entries(videoWatchCounts).map(([videoId, { title, count }], index, array) => (
                <View key={videoId}>
                  <View style={styles.videoCountItem}>
                    <Text style={styles.videoTitle} numberOfLines={1}>{title}</Text>
                    <Text style={[styles.videoCount, { color: count > 0 ? "#4CAF50" : "#666" }]}>
                      {count > 0 ? `${count} times watched` : "Not watched"}
                    </Text>
                  </View>
                  {index < array.length - 1 && <View style={styles.videoSeparator} />}
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryIcon: {
    width: 80,
    height: 80,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  videoCountsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  videoCountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  videoTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  videoCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  videoSeparator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 6,
  },
});

export default VideoProgressSection;





