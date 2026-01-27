package com.myfinances.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import android.content.SharedPreferences;
import android.content.Context;
import android.content.Intent;

@CapacitorPlugin(name = "TransactionReader")
public class TransactionPlugin extends Plugin {

    @PluginMethod
    public void getPendingTransactions(PluginCall call) {
        try {
            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences("com.myfinances.app.transactions", Context.MODE_PRIVATE);
            String existing = prefs.getString("pending", "[]");
            android.util.Log.d("TransactionReader", "Checking pending: " + existing);
            
            JSArray ret = new JSArray(existing);
            
            // Clear pending after reading
            prefs.edit().putString("pending", "[]").apply();
            
            JSObject result = new JSObject();
            result.put("transactions", ret);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to read transactions", e);
        }
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        getContext().startActivity(intent);
        call.resolve();
    }
}
