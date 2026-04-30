# ─── Capacitor / WebView ─────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-dontwarn com.getcapacitor.**

# Keep JavaScript Interface classes from being obfuscated
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── Firebase / Google Auth ──────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Firebase Authentication plugin
-keep class io.capawesome.capacitorjs.plugins.firebase.** { *; }

# Google Auth plugin
-keep class com.codetrixstudio.capacitor.GoogleAuth.** { *; }

# ─── Biometric ───────────────────────────────────────────────────────────────
-keep class ee.forgr.biometric.** { *; }
-dontwarn ee.forgr.biometric.**

# ─── Supabase / OkHttp / Retrofit ────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ─── Kotlin ──────────────────────────────────────────────────────────────────
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**

# ─── App-specific ────────────────────────────────────────────────────────────
-keep class com.myfinances.app.** { *; }

# ─── Debugging (keep line numbers in crash reports) ──────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
