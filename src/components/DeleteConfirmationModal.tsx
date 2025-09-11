import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName: string;
  type: 'teacher' | 'student';
  itemPhoto?: string;
}

const DeleteConfirmationModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  type,
  itemPhoto
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setConfirmText('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmText.trim().toLowerCase() !== 'delete') {
      Alert.alert('Error', 'Please type "Delete" to confirm');
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmEnabled = confirmText.trim().toLowerCase() === 'delete';

  const renderHeaderIcon = () => {
    if (itemPhoto) {
      // Handle internal icons
      if (itemPhoto.startsWith('internal_icon_')) {
        const iconIndex = parseInt(itemPhoto.replace('internal_icon_', ''));
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
            style={styles.headerPhoto} 
            resizeMode="contain"
          />
        );
      }
      
      // Handle regular photos
      return (
        <Image 
          source={{ uri: itemPhoto.startsWith('data:') ? itemPhoto : `data:image/jpeg;base64,${itemPhoto}` }} 
          style={styles.headerPhoto} 
        />
      );
    }
    
    // Default predefined question mark icon
    return (
      <Ionicons 
        name="help-circle" 
        size={40} 
        color="#FF3B30" 
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {renderHeaderIcon()}
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
              
              <View style={styles.itemContainer}>
                <Text style={styles.itemLabel}>
                  {type === 'teacher' ? 'Teacher:' : 'Student:'}
                </Text>
                <Text style={styles.itemName}>{itemName}</Text>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  This action cannot be undone!
                </Text>
              </View>

              <View style={styles.confirmationSection}>
                <Text style={styles.confirmationLabel}>
                  Type <Text style={styles.deleteText}>"Delete"</Text> to confirm:
                </Text>
                <TextInput
                  style={[
                    styles.confirmationInput,
                    isConfirmEnabled && styles.confirmationInputValid
                  ]}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="Type Delete here"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleConfirm} 
                style={[
                  styles.deleteButton,
                  !isConfirmEnabled && styles.deleteButtonDisabled
                ]}
                disabled={!isConfirmEnabled || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  warningBox: {
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmationSection: {
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteText: {
    fontWeight: '600',
    color: '#FF3B30',
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  confirmationInputValid: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ffcccb',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default DeleteConfirmationModal;

