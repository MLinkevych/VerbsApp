import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Student, Teacher } from '../types';
import dataService from '../utils/dataService';
import AddStudentModal from '../components/AddStudentModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PhotoSelectionModal from '../components/PhotoSelectionModal';

type StudentSelectNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StudentSelect'>;

interface Props {
  navigation: StudentSelectNavigationProp;
}

const StudentSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const teacher = await dataService.getCurrentTeacher();
      if (teacher) {
        setCurrentTeacher(teacher);
        const studentsData = await dataService.getStudentsByTeacher(teacher.id);
        setStudents(studentsData);
      } else {
        Alert.alert('Error', 'No teacher logged in');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = async (student: Student) => {
    try {
      // Set the selected student as current user for the session
      await dataService.setCurrentUser(student);
      navigation.navigate('Categories');
    } catch (error) {
      Alert.alert('Error', 'Failed to select student');
    }
  };

  const handlePhotoIconPress = (student: Student, event: any) => {
    event.stopPropagation(); // Prevent student selection
    setSelectedStudent(student);
    setShowPhotoModal(true);
  };
  
  const handlePhotoUpdate = async (photoData: string) => {
    if (!selectedStudent) return;
    
    try {
      // Update student photo in database (empty string removes photo)
      const updatedStudent = { ...selectedStudent, photo: photoData || undefined };
      await dataService.updateStudent(updatedStudent);
      
      // Update local state
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? updatedStudent : s
      ));
      
      setSelectedStudent(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update photo');
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

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => handleStudentSelect(item)}
      onLongPress={() => handleStudentLongPress(item)}
      delayLongPress={500}
    >
      <TouchableOpacity 
        style={styles.studentIcon}
        onPress={(event) => handlePhotoIconPress(item, event)}
        activeOpacity={0.7}
      >
        {renderUserPhoto(item)}
      </TouchableOpacity>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
      </View>
      <View style={styles.studentActions}>
        <Image source={require('../../assets/tech_icons/icon_minus.png')} style={styles.actionIcon} resizeMode="contain" />
        <Text style={styles.longPressHint}>Hold to delete</Text>
      </View>
    </TouchableOpacity>
  );

  const handleStudentLongPress = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await dataService.deleteStudent(studentToDelete.id);
      // Reload students list
      if (currentTeacher) {
        const updatedStudents = await dataService.getStudentsByTeacher(currentTeacher.id);
        setStudents(updatedStudents);
      }
      Alert.alert('Success', 'Student deleted successfully');
    } catch (error) {
      throw error;
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      await dataService.addStudent(studentData);
      // Reload students list
      if (currentTeacher) {
        const updatedStudents = await dataService.getStudentsByTeacher(currentTeacher.id);
        setStudents(updatedStudents);
      }
    } catch (error) {
      throw error;
    }
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>Welcome, {currentTeacher?.name}</Text>
              <Text style={styles.subtitle}>Select a student to begin learning</Text>
            </View>
            <TouchableOpacity 
              style={styles.teacherDashboardHeaderButton} 
              onPress={() => navigation.navigate('TeacherDashboard')}
            >
              <Text style={styles.teacherDashboardHeaderText}>Teacher Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.studentList}>
          {students.map((student) => (
            <View key={student.id}>
              {renderStudent({ item: student })}
            </View>
          ))}
        </View>

        {/* Add Student Button */}
        <View style={styles.addStudentContainer}>
          <TouchableOpacity 
            style={styles.addStudentButton} 
            onPress={() => setShowAddStudent(true)}
          >
            <Image source={require('../../assets/tech_icons/icon_plus.png')} style={styles.buttonIcon} resizeMode="contain" />
            <Text style={styles.addStudentText}>Add New Student</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {students.length} student{students.length !== 1 ? 's' : ''} in your class
          </Text>
        </View>
      </ScrollView>

      {/* Add Student Modal */}
      <AddStudentModal
        visible={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onAddStudent={handleAddStudent}
        teacherId={currentTeacher?.id || ''}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action will permanently remove the student and all their progress data."
        itemName={studentToDelete?.name || ''}
        type="student"
        itemPhoto={studentToDelete?.photo}
      />
      
      {/* Photo Selection Modal */}
      <PhotoSelectionModal
        visible={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false);
          setSelectedStudent(null);
        }}
        onPhotoSelected={handlePhotoUpdate}
        currentPhoto={selectedStudent?.photo}
        userName={selectedStudent?.name || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
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
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  teacherDashboardHeaderButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherDashboardHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  studentList: {
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
    position: 'relative',
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
  studentActions: {
    alignItems: 'center',
  },
  longPressHint: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  addStudentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addStudentButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addStudentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    marginRight: 8,
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginBottom: 2,
  },
});

export default StudentSelectScreen;
