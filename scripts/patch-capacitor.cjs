const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Only replace if it hasn't been replaced already
  if (content.includes("getDefaultProguardFile('proguard-android.txt')")) {
    content = content.replace(
      "getDefaultProguardFile('proguard-android.txt')", 
      "getDefaultProguardFile('proguard-android-optimize.txt')"
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched @capacitor/android build.gradle for modern AGP support.');
  } else {
    console.log('@capacitor/android is already patched or does not contain the target string.');
  }
} else {
  console.warn('Could not find @capacitor/android build.gradle. Skipping patch.');
}
