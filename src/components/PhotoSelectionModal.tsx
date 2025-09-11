import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPhotoSelected: (photo: string) => void;
  currentPhoto?: string | null;
  userName: string;
}

// ---- constants (keep in sync with styles) ----
const CONTENT_PADDING_H = 20; // must match styles.content paddingHorizontal
const GRID_PADDING_H = 10;    // must match styles.iconGrid paddingHorizontal
const TILE_GAP = 12;

// Default user icons from internal gallery (students folder)
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

const PhotoSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  onPhotoSelected,
  currentPhoto,
  userName,
}) => {
  const [showInternalGallery, setShowInternalGallery] = useState(false);

  // measure usable width for the grid (content width minus its horizontal padding)
  const [gridWidth, setGridWidth] = useState(0);
  const columns = gridWidth >= 840 ? 4 : gridWidth >= 600 ? 3 : 2;
  const iconSize = gridWidth
    ? Math.floor(
        (gridWidth - GRID_PADDING_H * 2 - (columns - 1) * TILE_GAP) / columns
      )
    : 140;

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const photoData = result.assets[0].base64 || result.assets[0].uri;
        onPhotoSelected(photoData);
        onClose();
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const selectInternalIcon = (iconIndex: number) => {
    const iconId = `internal_icon_${iconIndex}`;
    onPhotoSelected(iconId);
    onClose();
  };

  const deletePhoto = () => {
    onPhotoSelected('');
    onClose();
  };

  const renderInternalIcon = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.iconItem, { width: iconSize, height: iconSize }]}
      onPress={() => selectInternalIcon(index)}
      activeOpacity={0.8}
    >
      <Image
        source={item}
        style={{
          width: Math.round(iconSize * 0.78),
          height: Math.round(iconSize * 0.78),
          borderRadius: 8,
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  if (showInternalGallery) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            {/* Left: Back text button */}
            <TouchableOpacity
              onPress={() => setShowInternalGallery(false)}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Choose Icon</Text>

            {/* Right: close image from assets/tech_icons/icon_close_x.png */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={require('../../assets/tech_icons/icon_close_x.png')}
                style={styles.headerCloseIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View
            style={styles.content}
            onLayout={(e) => {
              const usableWidth = e.nativeEvent.layout.width - CONTENT_PADDING_H * 2;
              setGridWidth(Math.max(usableWidth, 0));
            }}
          >
            <Text style={styles.subtitle}>Select an icon for {userName}</Text>

            <FlatList
              data={defaultUserIcons}
              renderItem={renderInternalIcon}
              keyExtractor={(_, index) => index.toString()}
              numColumns={columns}
              key={columns}
              columnWrapperStyle={{ gap: TILE_GAP }}
              contentContainerStyle={[styles.iconGrid, { gap: TILE_GAP, paddingBottom: 28 }]}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>Change Photo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image 
              source={require('../../assets/tech_icons/icon_close_x.png')} 
              style={[styles.closeIcon, { tintColor: '#007AFF' }]} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Choose how to update {userName}'s photo</Text>

          {currentPhoto && (
            <View style={styles.currentPhotoSection}>
              <Text style={styles.sectionTitle}>Current Photo</Text>
              <View style={styles.currentPhotoContainer}>
                {currentPhoto.startsWith('internal_icon_') ? (
                  <Image
                    source={defaultUserIcons[parseInt(currentPhoto.replace('internal_icon_', ''))]}
                    style={styles.currentPhoto}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={{
                      uri: currentPhoto.startsWith('data:')
                        ? currentPhoto
                        : `data:image/jpeg;base64,${currentPhoto}`,
                    }}
                    style={styles.currentPhoto}
                  />
                )}
              </View>
            </View>
          )}

          <View style={styles.optionsSection}>
            <TouchableOpacity style={styles.optionButton} onPress={pickFromGallery}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Select from Gallery</Text>
                <Text style={styles.optionDescription}>Choose a photo from your device</Text>
              </View>
              <Image 
                source={require('../../assets/tech_icons/icon_plus.png')} 
                style={[styles.optionChevronIcon, { tintColor: '#007AFF' }]} 
                resizeMode="contain" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={() => setShowInternalGallery(true)}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose from Icons</Text>
                <Text style={styles.optionDescription}>Select from our collection of icons</Text>
              </View>
              <Image 
                source={require('../../assets/tech_icons/icon_plus.png')} 
                style={[styles.optionChevronIcon, { tintColor: '#4CAF50' }]} 
                resizeMode="contain" 
              />
            </TouchableOpacity>

            {currentPhoto && (
              <TouchableOpacity style={[styles.optionButton, styles.deleteButton]} onPress={deletePhoto}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, styles.deleteText]}>Remove Photo</Text>
                  <Text style={styles.optionDescription}>Remove current photo and leave blank</Text>
                </View>
                <Image 
                  source={require('../../assets/tech_icons/icon_minus.png')} 
                  style={[styles.optionChevronIcon, { tintColor: '#FF3B30' }]} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: { padding: 4 },
  backText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  closeButton: { padding: 4 },
  headerCloseIcon: { width: 24, height: 24, tintColor: '#007AFF', },
  placeholder: { width: 32 },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1, paddingHorizontal: CONTENT_PADDING_H, paddingTop: 20 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  currentPhotoSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15, textAlign: 'center' },
  currentPhotoContainer: { alignItems: 'center' },
  currentPhoto: { width: 80, height: 80, borderRadius: 40 },
  optionsSection: { gap: 15 },
  optionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  optionDescription: { fontSize: 14, color: '#666' },
  iconGrid: {
    paddingVertical: 20,
    paddingHorizontal: GRID_PADDING_H,
  },
  iconItem: {
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: { borderWidth: 1, borderColor: '#FF3B30', backgroundColor: '#fff0f0' },
  deleteText: { color: '#FF3B30' },
  closeIcon: {
    width: 24,
    height: 24,
  },
  optionChevronIcon: {
    width: 20,
    height: 20,
  },
});

export default PhotoSelectionModal;
