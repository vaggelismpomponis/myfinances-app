package com.myfinances.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Date;
import android.util.Log;

public class SMSNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "SMSListener";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        Notification notification = sbn.getNotification();
        Bundle extras = notification.extras;
        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence textCharSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
        CharSequence bigTextCharSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        
        String text = textCharSeq != null ? textCharSeq.toString() : "";
        if (text.isEmpty() && bigTextCharSeq != null) {
            text = bigTextCharSeq.toString();
        }

        Log.d(TAG, "Notification received from: " + packageName);
        Log.d(TAG, "Title: " + title);
        Log.d(TAG, "Text: " + text);

        String combined = (title + " " + text).toLowerCase();

        boolean match = combined.contains("€") || combined.contains("euro") || combined.contains("purchase") || combined.contains("αγορά") || combined.contains("χρέωση") || combined.matches(".*\\d+[.,]\\d{2}.*");
        
        Log.d(TAG, "Checking combined: '" + combined + "' Match: " + match);

        if (match) {
             saveTransaction(title, text);
        }
    }

    private void saveTransaction(String title, String text) {
        try {
            SharedPreferences prefs = getSharedPreferences("com.myfinances.app.transactions", Context.MODE_PRIVATE);
            String existing = prefs.getString("pending", "[]");
            JSONArray jsonArray = new JSONArray(existing);

            JSONObject obj = new JSONObject();
            obj.put("title", title);
            obj.put("text", text);
            obj.put("date", new Date().getTime());
            
            jsonArray.put(obj);

            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("pending", jsonArray.toString());
            editor.putString("pending", jsonArray.toString());
            boolean success = editor.commit(); // Synchronous save to be sure
            
            Log.d(TAG, "Transaction saved: " + text + " Success: " + success);
        } catch (Exception e) {
            Log.e(TAG, "Error saving transaction", e);
        }
    }
}
