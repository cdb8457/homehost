const { build } = require('electron-builder');
const path = require('path');

const buildOptions = {
  appId: 'com.homehost.desktop',
  productName: 'HomeHost Desktop',
  directories: {
    output: 'dist',
    app: '.',
    buildResources: 'build'
  },
  files: [
    'build/**/*',
    'src/main/**/*',
    'package.json',
    'node_modules/**/*'
  ],
  extraResources: [
    {
      from: 'assets/',
      to: 'assets/'
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.ico',
    requestedExecutionLevel: 'requireAdministrator'
  },
  nsis: {
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    uninstallDisplayName: 'HomeHost Desktop',
    license: 'LICENSE.md',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  publish: null
};

async function buildApp() {
  try {
    console.log('Building HomeHost Desktop...');
    const result = await build({ config: buildOptions });
    console.log('Build completed successfully!');
    return result;
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildApp();
}

module.exports = { buildApp, buildOptions };