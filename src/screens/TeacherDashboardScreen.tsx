import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Teacher, Student, RootStackParamList } from '../types';
import dataService from '../utils/dataService';

type TeacherDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeacherDashboard'>;

interface Props {
  navigation: TeacherDashboardNavigationProp;
}

const TeacherDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      const teacherData = await dataService.getCurrentTeacher();
      if (teacherData) {
        setTeacher(teacherData);

        const studentsData = await dataService.getStudentsByTeacher(teacherData.id);
        setStudents(studentsData);
      } else {
        console.warn('No teacher found in session');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleStudentSelect = async (student: Student) => {
    try {
      // Set the selected student as current user for the session
      await dataService.setCurrentUser(student);
      // Navigate to ProgressScreen for the selected student
      navigation.navigate('Progress', { studentId: student.id });
    } catch (error) {
      console.error('Failed to select student:', error);
    }
  };

  const renderUserPhoto = (student: Student) => {
    if (!student.photo) {
      return <Ionicons name="person" size={40} color="#4CAF50" />;
    }
    
    // Handle internal icons
    if (student.photo.startsWith('internal_icon_')) {
      const iconIndex = parseInt(student.photo.replace('internal_icon_', ''));
      const defaultUserIcons = [
        require('../../assets/students/amma_midj_cute_cartoon_3d_blueberry_character_in_style_of_Pixar_4804318d-35c0-4395-8acb-aaf0eb7207c2.png'),
        require('../../assets/students/asgdsbdf_3D_cartoon_image_a_cute_little_girl_black_short_hair_a_f1397976-b441-4ad2-b1e4-6d4ea39f7573.png'),
        require('../../assets/students/bitburstit_special_cartoon_mascot_character_--v_7_58ee647b-3abb-4392-8766-0f58e97958c7.png'),
        require('../../assets/students/coffeeecraze_A_tiny_Notion_character_Cartoon_--ar_169_--raw_--v_b7fdf8ed-82b6-4ace-a6a7-ade966c4bddd.png'),
        require('../../assets/students/doxu64081398_A_cheerful_cartoon_character_designed_like_a_glass_0f41c25f-b262-4bd0-9533-44546d047d17.png'),
        require('../../assets/students/guowenzhu_a_full-body_cartoon_character_inspired_by_a_golden_pe_4c432af8-ccc9-497e-90ee-5490bcd3142a.png'),
        require('../../assets/students/jinhaoooooo_a_full-body_cartoon-style_character_of_a_cute_East__a111b84d-4efa-47a3-a912-04e28e35be06.png'),
        require('../../assets/students/lukehine_3D_Pixar-style_character_highly_detailed_little_boy_wa_9f31df15-bc8e-4ad5-9b22-d0905fa613ae.png'),
        require('../../assets/students/powellkatherine1010_78991_Cute_3D_character_--raw_--v_7_e007ee08-7820-482d-9e34-61295a6a8b73.png'),
        require('../../assets/students/ramsey_shyanne_A_cute_chubby_little_girl_character_full_body_wi_4438f56e-a90a-445f-b7fc-1d12b6b3e409.png'),
        require('../../assets/students/sele77_cartoon_character_kid_in_Pixar_style_black_hair_wearing__ef7af892-d1a4-46c9-9e77-4668fdb2bf54.png'),
        require('../../assets/students/yuepu.able_A_simple_cartoon_girl_drawing_of_an_animated_charact_c88745e2-3d00-49db-8476-658030f06247.png'),
      ];
      
      return (
        <Image 
          source={defaultUserIcons[iconIndex]} 
          style={styles.studentPhoto} 
          resizeMode="contain"
        />
      );
    }
    
    // Handle regular photos
    return (
      <Image 
        source={{ uri: student.photo.startsWith('data:') ? student.photo : `data:image/jpeg;base64,${student.photo}` }} 
        style={styles.studentPhoto} 
      />
    );
  };

  const renderStudent = (student: Student) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => handleStudentSelect(student)}
      activeOpacity={0.7}
    >
      <View style={styles.studentIcon}>
        {renderUserPhoto(student)}
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.progressText}>Tap to view progress report</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleTitle}>Select Student</Text>
        <Text style={styles.simpleSubtitle}>Choose a student to view their progress report</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.studentsList}>
        {students.map((student) => renderStudent(student))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  simpleHeader: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  simpleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  simpleSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  studentsList: {
    flex: 1,
    padding: 20,
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'visible',
  },
  studentPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TeacherDashboardScreen;
