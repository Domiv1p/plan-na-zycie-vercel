const fs = require('fs');
let c = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

const regex = /const \[pushEnabled, setPushEnabled\] = useState\(false\);/;
const replacement = `const [pushEnabled, setPushEnabled] = useState(false);
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushEnabled(!!subscription);
        });
      });
    }
  }, []);`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/pages/SettingsPage.jsx', c, 'utf8');
