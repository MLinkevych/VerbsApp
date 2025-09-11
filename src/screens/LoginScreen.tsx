import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Teacher } from '../types';
import dataService from '../utils/dataService';
import AddTeacherModal from '../components/AddTeacherModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PhotoSelectionModal from '../components/PhotoSelectionModal';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [password, setPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoSelectedTeacher, setPhotoSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await dataService.initializeApp();
      const teachersData = await dataService.getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize app');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!selectedTeacher || !password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    try {
      const isAuthenticated = await dataService.authenticateTeacher(selectedTeacher.id, password.trim());
      if (isAuthenticated) {
        await dataService.setCurrentUser(selectedTeacher);
        await dataService.setCurrentTeacher(selectedTeacher);
        setShowPasswordModal(false);
        setPassword('');
        setSelectedTeacher(null);
        navigation.navigate('StudentSelect');
      } else {
        Alert.alert('Error', 'Incorrect password');
        setPassword('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPassword('');
    setSelectedTeacher(null);
  };

  const handleAddTeacher = async (teacherData: Omit<Teacher, 'id' | 'students'>) => {
    try {
      await dataService.addTeacher(teacherData);
      const updatedTeachers = await dataService.getTeachers();
      setTeachers(updatedTeachers);
    } catch (error) {
      throw error;
    }
  };

  const handleTeacherLongPress = async (teacher: Teacher) => {
    try {
      const count = await dataService.teacherHasStudents(teacher.id);
      setStudentCount(count);
      setTeacherToDelete(teacher);
      setShowDeleteModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to check teacher information');
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      await dataService.deleteTeacher(teacherToDelete.id);
      const updatedTeachers = await dataService.getTeachers();
      setTeachers(updatedTeachers);
      Alert.alert('Success', 'Teacher deleted successfully');
    } catch (error) {
      throw error;
    }
  };

  const handlePhotoIconPress = (teacher: Teacher, event: any) => {
    event.stopPropagation(); // Prevent teacher selection
    setPhotoSelectedTeacher(teacher);
    setShowPhotoModal(true);
  };

  const handlePhotoUpdate = async (photoData: string) => {
    if (!photoSelectedTeacher) return;
    try {
      const updatedTeacher = { ...photoSelectedTeacher, photo: photoData || undefined };
      await dataService.updateTeacher(updatedTeacher);
      setTeachers(prev => prev.map(t => (t.id === photoSelectedTeacher.id ? updatedTeacher : t)));
      setPhotoSelectedTeacher(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update photo');
    }
  };

  const handleClearAppData = async () => {
    Alert.alert(
      'Reset App Data',
      'This will permanently delete all users, teachers, students, progress data, and quiz results. The app will return to its starting state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Clear all app data and reinitialize with sample data
              await dataService.clearAllData();
              
              // Reload the teachers list to show the fresh data
              const teachersData = await dataService.getTeachers();
              setTeachers(teachersData);
              
              // Reset all modal states
              setShowPasswordModal(false);
              setShowAddTeacher(false);
              setShowDeleteModal(false);
              setShowPhotoModal(false);
              setSelectedTeacher(null);
              setTeacherToDelete(null);
              setPhotoSelectedTeacher(null);
              setPassword('');
              setStudentCount(0);
              
              setLoading(false);
              
              Alert.alert(
                'Reset Complete', 
                'All app data has been cleared. The app is now in its starting state with sample data.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          },
        },
      ],
    );
  };

  const renderUserPhoto = (teacher: Teacher) => {
    if (!teacher.photo) {
      return <Ionicons name="person" size={40} color="#007AFF" />;
    }
    if (teacher.photo.startsWith('internal_icon_')) {
      const iconIndex = parseInt(teacher.photo.replace('internal_icon_', ''));
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
      return <Image source={defaultUserIcons[iconIndex]} style={styles.teacherPhoto} resizeMode="contain" />;
    }
    return <Image source={{ uri: teacher.photo.startsWith('data:') ? teacher.photo : `data:image/jpeg;base64,${teacher.photo}` }} style={styles.teacherPhoto} />;
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => handleTeacherSelect(item)}
      onLongPress={() => handleTeacherLongPress(item)}
      delayLongPress={500}
    >
      <TouchableOpacity
        style={styles.teacherIcon}
        onPress={(event) => handlePhotoIconPress(item, event)}
        activeOpacity={0.7}
      >
        {renderUserPhoto(item)}
        {/* Removed photoEditOverlay badge */}
      </TouchableOpacity>

      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.studentCount}>
          {item.students.length} student{item.students.length !== 1 ? 's' : ''}
        </Text>
      </View>

              <View style={styles.teacherActions}>
          <Image
            source={require('../../assets/tech_icons/icon_minus.png')}
            style={styles.actionIcon}
            resizeMode="contain"
          />
          <Text style={styles.longPressHint}>Hold to delete</Text>
        </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Settings')} style={styles.settingsButton}>
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Learning App</Text>
            <Text style={styles.subtitle}>Select your teacher account</Text>
          </View>
          <TouchableOpacity onPress={handleClearAppData} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={teachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.teacherList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.addTeacherContainer}>
        <TouchableOpacity style={styles.addTeacherButton} onPress={() => setShowAddTeacher(true)}>
          <Image source={require('../../assets/tech_icons/icon_plus.png')} style={styles.buttonIcon} resizeMode="contain" />
          <Text style={styles.addTeacherText}>Add New Teacher</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Educational Video Learning Platform</Text>
      </View>

      <AddTeacherModal visible={showAddTeacher} onClose={() => setShowAddTeacher(false)} onAddTeacher={handleAddTeacher} />

      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={handlePasswordCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <View style={styles.passwordHeader}>
              <Text style={styles.passwordTitle}>Enter Password</Text>
              <Text style={styles.passwordSubtitle}>{selectedTeacher?.name}</Text>
            </View>

            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              autoFocus
              onSubmitEditing={handlePasswordSubmit}
            />

            <View style={styles.passwordButtons}>
              <TouchableOpacity style={styles.passwordCancelButton} onPress={handlePasswordCancel}>
                <Text style={styles.passwordCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.passwordSubmitButton} onPress={handlePasswordSubmit}>
                <Text style={styles.passwordSubmitText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTeacherToDelete(null);
          setStudentCount(0);
        }}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to delete this teacher?${
          studentCount > 0
            ? `\n\nWarning: This teacher has ${studentCount} student${studentCount > 1 ? 's' : ''}. Deleting the teacher will not delete the students, but they will no longer be assigned to this teacher.`
            : ''
        }`}
        itemName={teacherToDelete?.name || ''}
        type="teacher"
        itemPhoto={teacherToDelete?.photo}
      />

      <PhotoSelectionModal
        visible={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false);
          setPhotoSelectedTeacher(null);
        }}
        onPhotoSelected={handlePhotoUpdate}
        currentPhoto={photoSelectedTeacher?.photo}
        userName={photoSelectedTeacher?.name || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },
  header: { paddingVertical: 40, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  settingsButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f8ff' },
  settingsText: { color: '#007AFF', fontSize: 14, fontWeight: '600', marginLeft: 5 },
  resetButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#fff0f0' },
  resetText: { color: '#FF3B30', fontSize: 14, fontWeight: '600', marginLeft: 5 },
  teacherList: { padding: 20 },
  teacherCard: {
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
  teacherIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f8ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
    overflow: 'visible', position: 'relative',
  },
  teacherPhoto: { width: '100%', height: '100%', borderRadius: 30 },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  studentCount: { fontSize: 14, color: '#666' },
  teacherActions: { alignItems: 'center' },
  longPressHint: { fontSize: 10, color: '#999', marginTop: 2 },
  addTeacherContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  addTeacherButton: {
    backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 12, gap: 8,
  },
  addTeacherText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonIcon: { width: 20, height: 20, tintColor: '#fff', marginRight: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  passwordModal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', maxWidth: 300 },
  passwordHeader: { alignItems: 'center', marginBottom: 20 },
  passwordTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  passwordSubtitle: { fontSize: 16, color: '#666' },
  passwordInput: {
    borderWidth: 1, borderColor: '#e9ecef', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 20,
  },
  passwordButtons: { flexDirection: 'row', gap: 12 },
  passwordCancelButton: {
    flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#007AFF', alignItems: 'center',
  },
  passwordCancelText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  passwordSubmitButton: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center' },
  passwordSubmitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999' },
  actionIcon: {
    width: 16,
    height: 16,
    marginBottom: 2,
    tintColor: '#999',
  },
});

export default LoginScreen;

