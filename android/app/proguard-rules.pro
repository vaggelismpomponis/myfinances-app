# ─── Capacitor Core ──────────────────────────────────────────────────────────
# Keep Capacitor plugin classes (entry points loaded via reflection)
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.PluginCall { *; }
-keep class com.getcapacitor.PluginMethod { *; }
-keep class com.getcapacitor.JSObject { *; }
-keep class com.getcapacitor.JSArray { *; }
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.CapConfig { *; }
-keep class com.getcapacitor.WebView { *; }

# Keep @PluginMethod-annotated methods (called via reflection from JS)
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod *;
}

# Keep JavaScript Interface methods (WebView bridge)
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-dontwarn com.getcapacitor.**

# ─── Capacitor Plugins (keep plugin entry classes only) ──────────────────────
-keep class com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth { *; }
-keep class ee.forgr.biometric.NativeBiometric { *; }
-keep class io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin { *; }
-keep class com.capacitorcommunity.speechrecognition.SpeechRecognition { *; }
-keep class com.capacitorjs.plugins.app.AppPlugin { *; }
-keep class com.capacitorjs.plugins.browser.BrowserPlugin { *; }
-keep class com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin { *; }
-keep class com.nicordesigns.capacitor.privacyscreen.PrivacyScreenPlugin { *; }

-dontwarn ee.forgr.biometric.**

# ─── Firebase (Auth only) ────────────────────────────────────────────────────
# Keep only the public API surfaces that are accessed via reflection
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.firebase.FirebaseApp { *; }
-keep class com.google.firebase.FirebaseOptions { *; }

# Firebase component discovery (uses reflection)
-keep class com.google.firebase.components.ComponentRegistrar { *; }
-keepnames class * implements com.google.firebase.components.ComponentRegistrar

-dontwarn com.google.firebase.**

# ─── Google Play Services (Auth only) ────────────────────────────────────────
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.api.** { *; }
-keep class com.google.android.gms.tasks.** { *; }

# Credential Manager / Identity Sign-In (used by newer Google Auth flows)
-keep class com.google.android.gms.auth.api.identity.** { *; }
-keep class com.google.android.gms.auth.api.signin.** { *; }

-dontwarn com.google.android.gms.**

# ─── OkHttp ──────────────────────────────────────────────────────────────────
# Only keep platform-specific adapters loaded via reflection
-keepnames class okhttp3.internal.platform.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ─── Kotlin ──────────────────────────────────────────────────────────────────
# Keep Kotlin metadata for reflection-based APIs, let R8 strip/obfuscate the rest
-keep class kotlin.Metadata { *; }
-keepclassmembers class kotlin.coroutines.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ─── reCAPTCHA Enterprise ────────────────────────────────────────────────────
-dontwarn com.google.android.recaptcha.**

# ─── Debugging (keep line numbers in crash reports) ──────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
