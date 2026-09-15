# Talent2Task — Android WebView Native Wrapper

This is the native Android WebView wrapper project for **Talent2Task**.

## Key Architecture
```
TALENT2TASK WEB APP (React + Vite + SQLite WASM + Live Sync)
             ↓
Deployed online with HTTPS (e.g. Vercel, Netlify, Custom Domain)
             ↓
Android APK (Talent2Task WebView Wrapper)
             ↓
Loads Live Website (Always pulls latest changes)
```

Whenever you update your website (frontend UI, React components, CSS, matching logic, backend sync), the existing installed APK **automatically displays the updated live version** without needing to build or reinstall a new APK.

---

## 1. Where to Configure the Live Website URL

Open [`android/app/src/main/res/values/strings.xml`](file:///c:/Users/Harshitha/Downloads/Talent2Task%20%281%29/android/app/src/main/res/values/strings.xml) and change the `<string name="web_app_url">` value:

```xml
<resources>
    <string name="app_name">Talent2Task</string>
    <!-- Put your live HTTPS domain here -->
    <string name="web_app_url">https://your-deployed-domain.vercel.app</string>
</resources>
```

> **Note**: Do not use `localhost` because physical mobile devices cannot access your computer's `localhost`. Always use a live HTTPS URL.

---

## 2. Built-in Native Features in the Android Wrapper

- **Live URL Loading**: Always fetches the latest live web app.
- **Hardware Back-Button Navigation**: Pressing the Android back button navigates backward inside the web page history (`webView.goBack()`). Double-pressing at the home page displays "Press back again to exit".
- **Camera & File Uploads**: Supports `<input type="file">` for taking live photos or picking gallery images/PDF resumes with `WebChromeClient.onShowFileChooser`.
- **GPS Radar / Geolocation**: Requests Android runtime location permission and passes GPS coordinates to HTML5 `navigator.geolocation` for real-time gig distance calculations and map radar.
- **Pull-To-Refresh**: Integrated `SwipeRefreshLayout` lets users swipe down to refresh the live app.
- **Offline Detection & Auto-Recovery**: Displays a clean offline screen with a "Try Again" button if disconnected, and automatically reloads as soon as internet connection is restored.
- **Deep Links & External Apps**: Automatically launches external apps for phone calls (`tel:`), emails (`mailto:`), WhatsApp (`whatsapp:` / `wa.me`), and Google Maps (`geo:`).
- **Download Manager**: Native handling for downloading PDF resumes, job sheets, and documents.

---

## 3. How to Build the APK

### Option A: Using Android Studio (Recommended)
1. Open **Android Studio**.
2. Click **Open** and select the `android` folder in this repository (`c:\Users\Harshitha\Downloads\Talent2Task (1)\android`).
3. Allow Gradle to sync dependencies.
4. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The generated APK will be at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Command Line (Terminal)
Navigate to the `android` directory and run:
```bash
# On Windows PowerShell / Command Prompt:
.\gradlew.bat assembleDebug

# On Linux / macOS:
./gradlew assembleDebug
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Option C: 1-Click GitHub Actions Cloud Build (No Local Setup Required)
1. Push your project to GitHub.
2. In GitHub, go to the **Actions** tab.
3. Select **Build Android APK** and click **Run workflow**.
4. Once completed, download the **Talent2Task-Android-APK** zip file containing the ready-to-install `.apk`.
