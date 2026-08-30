const VAPID_PUBLIC_KEY = 'BE1oywJYD0j1iZT1cxeT3QB58Rovvdx-XmSJj4ycyAnkPHIXZV-yOwgUORGJcj_AyRBJo6DH6yYwwDMctmfefpo';
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    const token = localStorage.getItem('pnz-token');
    if (token) {
      await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription })
      });
    }

    return true;
  } catch (error) {
    console.error('Błąd subskrypcji push:', error);
    return false;
  }
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('Błąd odsubskrybowania push:', error);
    return false;
  }
}
