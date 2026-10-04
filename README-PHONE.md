# SnapBack — Phone (Capacitor Android)

**Build:** v258 (web assets)

## Clean install on your laptop
1. Delete old `snapback-capacitor` / phone folders if they confuse you.
2. Unzip **SNAPBACK-PHONE-v258**.
3. Copy the **www** folder contents into your Capacitor project’s `www` folder (replace all).
4. In PowerShell (project root that contains `package.json` and `android`):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx cap sync android
```

5. Open the **android** folder in Android Studio → Build → Build APK(s) (or Run).
6. APK is usually under `android/app/build/outputs/apk/debug/`. Rename the file to **SnapBack.apk** before sharing if you want.

## Native pieces you already installed
Keep your existing Android native nudge / alarm Java files and manifest permissions. Syncing **www** does not remove those.

## Google sign-in on phone
Requires Firebase Android app + `google-services.json` + SHA-1 (steps you already completed). If Gmail fails, re-check SHA-1 and package name `app.snapback.study`.

## Tour on phone
Settings → **Take a tour**. Overlay is forced on top (z-index) so it should appear on the device.

## Nudge alarm
Needs the native AlarmManager path (Java files + permissions). Web-only install will not ring like a clock.

## Students
Share the APK. They install and sign in. Web link for laptop use is in Settings (your GitHub Pages URL).
