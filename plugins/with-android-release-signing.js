
const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidReleaseSigning(config) {
    return withAppBuildGradle(config, (config) => {
        const signingConfig = `
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
`;

        config.modResults.contents += signingConfig;
        return config;
    });
};
