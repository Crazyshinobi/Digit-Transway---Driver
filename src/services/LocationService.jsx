// src/services/LocationService.js
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let watchId = null;
let onPositionCallback = null; // optional callback set by caller
let lastPosition = null;
let updateIntervalId = null;
let isSending = false;

const LOCATION_UPDATE_URL = 'https://digittransway.com/api/location-update';
const UPDATE_INTERVAL_MS = 5000; // 5 seconds

async function requestAndroidLocationPermission() {
  if (Platform.OS !== 'android') return true;

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: 'This app needs access to your location to track trips.',
      buttonPositive: 'OK',
    },
  );

  // For background location on Android 10+ ask ACCESS_BACKGROUND_LOCATION separately (not in this helper).
  return fine === PermissionsAndroid.RESULTS.GRANTED;
}

async function sendLocationToServer(position) {
  if (!position) return;

  // avoid overlapping sends
  if (isSending) return;

  try {
    const vendorId = await AsyncStorage.getItem('@vendor_id');
    const token = await AsyncStorage.getItem('@user_token');

    if (!vendorId) {
      console.warn('[LocationService] vendor_id missing — skipping update');
      return;
    }

    const body = {
      vendor_id: Number(vendorId),
      current_latitude: Number(position.coords.latitude),
      current_longitude: Number(position.coords.longitude),
    };

    isSending = true;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(LOCATION_UPDATE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      console.warn(
        '[LocationService] location update failed',
        resp.status,
        text,
      );
    } else {
      const json = await resp.json().catch(() => null);
      console.log('[LocationService] location update success', json);
    }
  } catch (err) {
    console.warn('[LocationService] sendLocationToServer error', err);
  } finally {
    isSending = false;
  }
}

const start = async (opts = {}) => {
  const ok = await requestAndroidLocationPermission();
  if (!ok) {
    console.warn('[LocationService] Location permission not granted');
    return;
  }

  // optional callback to receive updates
  if (opts.onPosition) onPositionCallback = opts.onPosition;

  // get a one-time current position first (optional)
  try {
    Geolocation.getCurrentPosition(
      position => {
        console.log('[LocationService] getCurrentPosition', position);
        lastPosition = position;
        if (onPositionCallback) onPositionCallback(position);
        // send immediately (optional)
        sendLocationToServer(position).catch(() => {});
      },
      error => {
        console.warn('[LocationService] getCurrentPosition error', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  } catch (err) {
    console.warn('[LocationService] sync getCurrentPosition threw', err);
  }

  // then start watching
  try {
    watchId = Geolocation.watchPosition(
      position => {
        // update cached position
        lastPosition = position;
        console.log('[LocationService] watchPosition', position);
        if (onPositionCallback) onPositionCallback(position);
      },
      error => {
        console.warn('[LocationService] watchPosition error', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // meters
        interval: 5000, // Android: update interval (ms)
        fastestInterval: 2000,
        showsBackgroundLocationIndicator: false, // ios 11+
      },
    );

    console.log('[LocationService] started watching, id=', watchId);
  } catch (err) {
    console.warn('[LocationService] watchPosition threw', err);
  }

  // Set up periodic sender if not already running
  if (!updateIntervalId) {
    updateIntervalId = setInterval(() => {
      if (lastPosition) {
        sendLocationToServer(lastPosition).catch(() => {});
      }
    }, UPDATE_INTERVAL_MS);
    console.log(
      '[LocationService] location update interval started (ms)=',
      UPDATE_INTERVAL_MS,
    );
  }
};

const stop = () => {
  if (watchId != null) {
    try {
      Geolocation.clearWatch(watchId);
    } catch (e) {
      console.warn('[LocationService] clearWatch threw', e);
    }
    watchId = null;
    console.log('[LocationService] cleared watch');
  }

  if (updateIntervalId) {
    clearInterval(updateIntervalId);
    updateIntervalId = null;
    console.log('[LocationService] cleared update interval');
  }

  // reset caches
  lastPosition = null;
  isSending = false;
};

const setPositionListener = cb => {
  onPositionCallback = cb;
};

export default {
  start,
  stop,
  setPositionListener,
};
