# TestFlight Deployment Guide for SlipTactix

## Prerequisites
- macOS with Xcode 15+ installed
- Apple Developer Account ($99/year)
- iOS device for testing

## Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

## Step 2: Build the Web App
\`\`\`bash
npm run export
\`\`\`

## Step 3: Initialize Capacitor (First time only)
\`\`\`bash
npx cap add ios
\`\`\`

## Step 4: Sync and Open iOS Project
\`\`\`bash
npm run ios:build
\`\`\`

This will:
- Build the Next.js app
- Sync with Capacitor
- Open Xcode with your iOS project

## Step 5: Configure in Xcode

### Bundle Identifier
1. In Xcode, select your project in the navigator
2. Under "Signing & Capabilities", set Bundle Identifier to: `com.sliptactix.app`
3. Select your Apple Developer Team

### App Icons
1. In Xcode, navigate to `App/Assets.xcassets/AppIcon.appiconset`
2. Drag and drop your app icons for different sizes:
   - 1024x1024 (App Store)
   - 180x180 (iPhone 3x)
   - 120x120 (iPhone 2x)
   - 167x167 (iPad Pro)
   - 152x152 (iPad 2x)
   - 76x76 (iPad 1x)

### Launch Screen
1. Navigate to `App/Base.lproj/LaunchScreen.storyboard`
2. Customize your launch screen design

## Step 6: Build for TestFlight

### Archive the App
1. In Xcode, select "Any iOS Device" as the destination
2. Go to Product → Archive
3. Wait for the archive to complete

### Upload to App Store Connect
1. In the Organizer window, select your archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Follow the prompts to upload

## Step 7: Configure TestFlight

### In App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to TestFlight tab
4. Select your build when it's processed
5. Add test information and notes

### Add Testers
1. Click "External Testing" or "Internal Testing"
2. Add tester emails
3. Testers will receive an email with TestFlight invitation

## Step 8: Testing

### For Testers
1. Install TestFlight app from App Store
2. Accept invitation email
3. Install and test your app
4. Provide feedback through TestFlight

## Troubleshooting

### Common Issues
- **Build fails**: Check Bundle Identifier matches your Apple Developer account
- **Upload fails**: Ensure you have the correct certificates and provisioning profiles
- **App crashes**: Check console logs in Xcode for debugging

### Useful Commands
\`\`\`bash
# Clean and rebuild
npm run export && npx cap sync

# Open iOS project
npx cap open ios

# Check Capacitor status
npx cap doctor
\`\`\`

## App Store Submission (After TestFlight)
Once testing is complete:
1. Go to App Store Connect
2. Create a new version under "App Store" tab
3. Fill in app information, screenshots, description
4. Submit for review

## Notes
- First review can take 24-48 hours
- Updates typically review faster
- Keep your Apple Developer account active
- TestFlight builds expire after 90 days
