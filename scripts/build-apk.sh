#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/.android-tools"
JDK_DIR="$TOOLS_DIR/jdk"
GRADLE_DIR="$TOOLS_DIR/gradle"
SDK_DIR="$TOOLS_DIR/sdk"

mkdir -p "$TOOLS_DIR"

# 1. Setup JDK 21 if not present
if [ ! -f "$JDK_DIR/bin/javac" ]; then
    echo "=== [1/6] Downloading Adoptium OpenJDK 21 ==="
    mkdir -p "$JDK_DIR"
    curl -sL "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse" -o "$TOOLS_DIR/jdk21.tar.gz"
    tar -xzf "$TOOLS_DIR/jdk21.tar.gz" -C "$JDK_DIR" --strip-components=1
    rm -f "$TOOLS_DIR/jdk21.tar.gz"
    echo "JDK 21 installed successfully."
fi

export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Using Java: $($JAVA_HOME/bin/java -version 2>&1 | head -n 1)"

# 2. Setup Gradle 8.13 if not present
if [ ! -f "$GRADLE_DIR/bin/gradle" ]; then
    echo "=== [2/6] Downloading Gradle 8.13 ==="
    mkdir -p "$GRADLE_DIR"
    curl -sL "https://services.gradle.org/distributions/gradle-8.13-bin.zip" -o "$TOOLS_DIR/gradle.zip"
    unzip -q "$TOOLS_DIR/gradle.zip" -d "$TOOLS_DIR"
    mkdir -p "$GRADLE_DIR"
    cp -r "$TOOLS_DIR/gradle-8.13/"* "$GRADLE_DIR/"
    rm -rf "$TOOLS_DIR/gradle-8.13"
    rm -f "$TOOLS_DIR/gradle.zip"
    echo "Gradle 8.13 installed successfully."
fi

export PATH="$GRADLE_DIR/bin:$PATH"

# 3. Setup Android SDK cmdline-tools if not present
if [ ! -f "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo "=== [3/6] Downloading Android command-line tools ==="
    mkdir -p "$SDK_DIR/cmdline-tools"
    curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o "$TOOLS_DIR/cmdline-tools.zip"
    unzip -q "$TOOLS_DIR/cmdline-tools.zip" -d "$SDK_DIR/cmdline-tools"
    mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
    rm -f "$TOOLS_DIR/cmdline-tools.zip"
    echo "Android command-line tools installed."
fi

export ANDROID_HOME="$SDK_DIR"
export PATH="$SDK_DIR/cmdline-tools/latest/bin:$SDK_DIR/platform-tools:$PATH"

# Accept licenses & install platforms and build tools
mkdir -p "$SDK_DIR/licenses"
echo -e "24333f8a63b6825ea9c5514f83c2829b004d1fee\nd56f5187479451eabf01fb78af6dfcb131a6481e" > "$SDK_DIR/licenses/android-sdk-license"
echo -e "84831b9409646a918e30573bab4c9c91346d8abd" > "$SDK_DIR/licenses/android-sdk-preview-license"

yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" --licenses > /dev/null 2>&1 || true

if [ ! -d "$SDK_DIR/platforms/android-36" ]; then
    echo "=== [4/6] Installing Android Platforms & Build Tools ==="
    "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" "platform-tools" "platforms;android-35" "platforms;android-36" "build-tools;35.0.0" "build-tools;36.0.0" > /dev/null
fi

# 4. Configure local.properties
echo "sdk.dir=$SDK_DIR" > "$PROJECT_ROOT/android/local.properties"

# 5. Ensure web app is built and synced to android assets
echo "=== [5/6] Building Web App and syncing assets ==="
cd "$PROJECT_ROOT"
npm run build
npx cap copy android

# 6. Generate authentic Gradle wrapper and build APK
echo "=== [6/6] Building Android Debug APK with ./gradlew assembleDebug ==="
cd "$PROJECT_ROOT/android"
"$GRADLE_DIR/bin/gradle" wrapper --gradle-version 8.13 --no-daemon
chmod +x gradlew
./gradlew assembleDebug --no-daemon

APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "=================================================="
    echo "BUILD SUCCESSFUL! REAL ANDROID APK CREATED:"
    ls -lh "$APK_PATH"
    echo "=================================================="
else
    echo "ERROR: APK not found at $APK_PATH"
    exit 1
fi
