import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface QuizPerformanceSectionProps {
  categories: Category[];
  customCategoryIcons: { [key: string]: any };
  calculateCategoryQuizStats: (categoryId: string) => {
    correctAnswers: number;
    totalQuestions: number;
    sufficiency: number;
    questionsAnswered: number;
  };
}

const QuizPerformanceSection: React.FC<QuizPerformanceSectionProps> = ({
  categories,
  customCategoryIcons,
  calculateCategoryQuizStats,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quiz Performance</Text>
      <Text style={styles.sectionSubtitle}>Learning sufficiency and statistics for each category</Text>

      {categories.map(category => {
        const quizStats = calculateCategoryQuizStats(category.id);
        const hasCustomIcon = customCategoryIcons[category.id];

        return (
          <View key={category.id} style={styles.quizCategoryItem}>
            <View style={styles.quizCategoryHeader}>
              <View style={styles.categoryTitleRow}>
                {hasCustomIcon ? (
                  <Image
                    source={customCategoryIcons[category.id]}
                    style={styles.quizCategoryIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={72}
                    color="#FF9500"
                  />
                )}
                <Text style={styles.quizCategoryName}>{category.name}</Text>
              </View>
              
              <Text style={styles.sufficiencyLabel}>Learning Sufficiency</Text>
              <View style={styles.sufficiencyRow}>
                <Text
                  style={[
                    styles.sufficiencyValue,
                    { 
                      color: quizStats.sufficiency >= 70 
                        ? '#4CAF50' 
                        : quizStats.sufficiency >= 50 
                          ? '#FF9500' 
                          : '#f44336' 
                    }
                  ]}
                >
                  {quizStats.sufficiency.toFixed(0)}%
                </Text>
              </View>
            </View>

            <View style={styles.quizStatsRow}>
              <View style={styles.quizStatItem}>
                <Text style={styles.quizStatValue}>{quizStats.correctAnswers}</Text>
                <Text style={styles.quizStatLabel}>Correct</Text>
              </View>
              <View style={styles.quizStatItem}>
                <Text style={styles.quizStatValue}>{quizStats.totalQuestions}</Text>
                <Text style={styles.quizStatLabel}>Total Questions</Text>
              </View>
            </View>

            {quizStats.totalQuestions > 0 && (
              <View style={styles.quizProgressBar}>
                <View style={[styles.quizProgressFill, { width: `${quizStats.sufficiency}%` }]} />
              </View>
            )}
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
  quizCategoryItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quizCategoryHeader: {
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  quizCategoryIcon: {
    width: 72,
    height: 72,
  },
  sufficiencyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  sufficiencyRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  sufficiencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quizStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  quizStatItem: {
    alignItems: 'center',
  },
  quizStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  quizStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  quizProgressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
});

export default QuizPerformanceSection;





