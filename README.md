# Learning App - Educational Video Platform

A React Native + Expo educational app designed for iOS that provides video-based learning with interactive quizzes and progress tracking.

## Features

### 🎯 Core Functionality
- **6 Learning Categories**: Eat, Sleep, Play, Learn, Exercise, Communicate (expandable)
- **Sequential Video Learning**: Watch 11-12 videos per category (5 seconds each)
- **Interactive Quizzes**: Multiple choice questions after watching videos
- **Progress Tracking**: Detailed analytics for teachers and students
- **Offline Support**: All data stored locally using AsyncStorage

### 👥 User Roles
- **Teachers**: Manage students, view progress, access analytics dashboard
- **Students**: Watch videos, take quizzes, track personal progress

### 📱 App Flow
1. **Login**: Teacher selects their account
2. **Student Selection**: Teacher chooses which student to monitor
3. **Categories**: Student sees 6 learning categories
4. **Video Sequence**: Watch all videos in order (5 seconds each)
5. **Quiz**: Answer questions about the videos watched
6. **Video Selection**: Choose individual videos after completing sequence

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Expo Go app on your iPad

### Installation
```bash
cd LearningApp
npm install
```

### Running the App
```bash
npm start
```

### Testing on iPad
1. Install **Expo Go** from the App Store on your iPad
2. Scan the QR code that appears when you run `npm start`
3. The app will load on your iPad for testing

## Project Structure

```
LearningApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # All app screens
│   │   ├── LoginScreen.tsx
│   │   ├── StudentSelectScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   ├── VideoSequenceScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── VideoSelectionScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── TeacherDashboardScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Data service and utilities
│   └── assets/             # Videos and other assets
├── App.tsx                 # Main app component
└── package.json
```

## Adding Your Videos

To add your MP4 videos:

1. Create folders for each category in `src/assets/videos/`:
   ```
   src/assets/videos/
   ├── eat/
   ├── sleep/
   ├── play/
   ├── learn/
   ├── exercise/
   └── communicate/
   ```

2. Add your MP4 files to the appropriate category folders

3. Update the video data in `src/utils/dataService.ts` to reference your actual video files

## Key Features Implemented

### ✅ Authentication System
- Teacher login with student selection
- Role-based access control

### ✅ Video Learning System
- Sequential video playback (5-second auto-advance)
- Local video storage support
- Progress tracking per video

### ✅ Quiz System
- Multiple choice questions
- Answer validation
- Progress tracking (attempts, success/failure)

### ✅ Progress Analytics
- Individual student progress
- Teacher dashboard with class overview
- Category completion tracking
- Quiz performance metrics

### ✅ Offline Functionality
- All data stored locally using AsyncStorage
- No internet required for core functionality

## Next Steps

### For Production Deployment:
1. **Replace placeholder videos** with your actual MP4 content
2. **Add video player optimizations** for better local file handling
3. **Implement additional quiz formats** (icons vs text buttons)
4. **Add category expansion** functionality
5. **Export to native iOS** when MacBook is available

### Customization Options:
- Modify categories in `dataService.ts`
- Adjust video duration timing
- Customize UI colors and themes
- Add more quiz question types

## Technical Details

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation 7
- **Video**: Expo AV
- **Storage**: AsyncStorage
- **UI**: React Native Elements + Ionicons
- **Target**: iOS 16+

## Support

For technical support or questions about the app structure, refer to the code comments and TypeScript interfaces for guidance.
