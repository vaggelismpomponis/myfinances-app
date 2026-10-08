import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => !Capacitor.isNativePlatform();

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bomponis.spendwise';
