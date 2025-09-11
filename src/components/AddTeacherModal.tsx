import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Teacher } from '../types';
import PhotoSelectionModal from './PhotoSelectionModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id' | 'students'>) => Promise<void>;
}

const AddTeacherModal: React.FC<Props> = ({ visible, onClose, onAddTeacher }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');
    setPhoto(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePhotoSelected = (photoData: string) => {
    setPhoto(photoData || null);
  };

  const handlePhotoPress = () => {
    setShowPhotoModal(true);
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter last name');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return false;
    }
    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newTeacher: Omit<Teacher, 'id' | 'students'> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        password: password.trim(),
        photo: photo || undefined,
        role: 'teacher',
      };

      await onAddTeacher(newTeacher);
      resetForm();
      onClose();
      Alert.alert('Success', 'Teacher added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>Add New Teacher</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Image 
              source={require('../../assets/tech_icons/icon_close_x.png')} 
              style={styles.closeIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={handlePhotoPress} style={styles.photoContainer}>
              {photo ? (
                photo.startsWith('internal_icon_') ? (
                  (() => {
                    const iconIndex = parseInt(photo.replace('internal_icon_', ''));
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
                        style={styles.photo} 
                        resizeMode="contain"
                      />
                    );
                  })()
                ) : (
                  <Image 
                    source={{ uri: photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}` }} 
                    style={styles.photo} 
                  />
                )
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password (min 4 characters)"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Teacher</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Photo Selection Modal */}
      <PhotoSelectionModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoSelected={handlePhotoSelected}
        currentPhoto={photo}
        userName={`${firstName} ${lastName}`.trim() || 'Teacher'}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  photoText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  removePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removePhotoText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTeacherModal;

