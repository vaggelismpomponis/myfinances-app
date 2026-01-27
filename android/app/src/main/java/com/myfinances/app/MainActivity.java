package com.myfinances.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TransactionPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
