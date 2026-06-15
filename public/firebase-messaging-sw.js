
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDXbipH1eI81O4iW5YPXBCWAZM29IPeDsY",
  authDomain: "studio-4565976316-37893.firebaseapp.com",
  projectId: "studio-4565976316-37893",
  storageBucket: "studio-4565976316-37893.firebasestorage.app",
  messagingSenderId: "485069025590",
  appId: "1:485069025590:web:1243edbb56b640d44e0397"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// 1. Handle Background Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://cdn-icons-png.flaticon.com/512/2438/2438078.png', 
    badge: 'https://cdn-icons-png.flaticon.com/512/2438/2438078.png',
    sound: 'default', // Ensures sound plays if supported
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. Handle Notification Click (Opens the App when clicked)
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
  
  event.notification.close(); 

  // Open the app or focus if already open
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      // Check if there is already a window/tab open
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
