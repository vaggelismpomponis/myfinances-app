const fs = require('fs');
const path = require('path');

// 1. Patch @capacitor/android for modern AGP proguard rule path
const capAndroidPath = path.join(__dirname, '..', 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle');

if (fs.existsSync(capAndroidPath)) {
  let content = fs.readFileSync(capAndroidPath, 'utf8');
  if (content.includes("getDefaultProguardFile('proguard-android.txt')")) {
    content = content.replace(
      "getDefaultProguardFile('proguard-android.txt')", 
      "getDefaultProguardFile('proguard-android-optimize.txt')"
    );
    fs.writeFileSync(capAndroidPath, content, 'utf8');
    console.log('Successfully patched @capacitor/android build.gradle for modern AGP support.');
  } else {
    console.log('@capacitor/android is already patched or does not contain the target string.');
  }
} else {
  console.warn('Could not find @capacitor/android build.gradle. Skipping patch.');
}

// 2. Patch @capacitor/privacy-screen for AGP 9+ built-in Kotlin compatibility
const capPrivacyScreenPath = path.join(__dirname, '..', 'node_modules', '@capacitor', 'privacy-screen', 'android', 'build.gradle');

if (fs.existsSync(capPrivacyScreenPath)) {
  let content = fs.readFileSync(capPrivacyScreenPath, 'utf8');
  let modified = false;

  // 2a. Conditional kotlin plugin application
  const targetPluginString = "apply plugin: 'org.jetbrains.kotlin.android'";
  const conditionalKotlinString = "if (!project.plugins.hasPlugin('org.jetbrains.kotlin.android') && project.extensions.findByName('kotlin') == null) {\n    apply plugin: 'org.jetbrains.kotlin.android'\n}";

  if (content.includes(targetPluginString) && !content.includes(conditionalKotlinString)) {
    content = content.replace(targetPluginString, conditionalKotlinString);
    modified = true;
  }

  // 2b. Remove top-level import that triggers IDE unresolved class errors prior to buildscript evaluation
  if (content.includes("import org.jetbrains.kotlin.gradle.dsl.JvmTarget\n")) {
    content = content.replace("import org.jetbrains.kotlin.gradle.dsl.JvmTarget\n", "");
    modified = true;
  } else if (content.includes("import org.jetbrains.kotlin.gradle.dsl.JvmTarget\r\n")) {
    content = content.replace("import org.jetbrains.kotlin.gradle.dsl.JvmTarget\r\n", "");
    modified = true;
  }

  // 2c. Qualify JvmTarget reference
  if (content.includes("jvmTarget = JvmTarget.JVM_21")) {
    content = content.replace("jvmTarget = JvmTarget.JVM_21", "jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(capPrivacyScreenPath, content, 'utf8');
    console.log('Successfully patched @capacitor/privacy-screen build.gradle for modern AGP and IDE support.');
  } else {
    console.log('@capacitor/privacy-screen is already patched or does not contain the target strings.');
  }
} else {
  console.warn('Could not find @capacitor/privacy-screen build.gradle. Skipping patch.');
}

