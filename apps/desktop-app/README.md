# HomeHost Desktop

HomeHost Desktop is an Electron-based application for managing local game servers with Steam integration, real-time monitoring, and cloud synchronization.

## 🎮 Features

- **Game Library**: Netflix-style browsing of 5 supported games (Valheim, Rust, CS2, 7 Days to Die, MotorTown)
- **One-Click Deployment**: Easy server setup with game-specific configurations
- **Steam Integration**: Automated game server downloads via SteamCMD
- **Real-Time Monitoring**: System performance tracking and server status
- **Cloud Sync**: Backup and sync server configurations across devices
- **Professional UI**: Modern glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Windows (for full Steam integration)
- SteamCMD (optional, for automatic game downloads)

### Installation

1. **Clone and Install**
   ```bash
   cd apps/desktop-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run start
   ```
   This will start both the React dev server (port 3001) and Electron.

3. **Alternative Development Command**
   ```bash
   npm run dev
   ```
   Uses the custom development script for better control.

### Building for Production

```bash
# Build React app and create Windows installer
npm run dist:win

# Cross-platform build
npm run build && npm run build-app
```

## 🔧 Configuration

### Steam Setup

1. Download SteamCMD from [Valve's website](https://developer.valvesoftware.com/wiki/SteamCMD)
2. Extract to a folder (e.g., `C:\SteamCMD`)
3. Open HomeHost Desktop → Settings → Steam Configuration
4. Set the SteamCMD path to your installation directory
5. Set a default installation path for game servers

### First Server Deployment

1. Go to **Game Library**
2. Select a game (e.g., Valheim)
3. Click **Deploy Server**
4. Configure server settings:
   - Server name
   - Port (default provided)
   - Max players
   - Password (optional)
   - Installation path
5. Click **Deploy Server**

## 📁 Project Structure

```
src/
├── main/                   # Electron main process
│   ├── main.js            # Application entry point
│   ├── preload.js         # Secure IPC bridge
│   └── services/          # Backend services
│       ├── GameServerManager.js    # Server lifecycle management
│       ├── SteamService.js         # SteamCMD integration
│       ├── SteamIntegration.js     # Enhanced Steam features
│       ├── SystemMonitor.js       # Hardware monitoring
│       └── CloudSync.js           # Cloud API integration
├── renderer/              # React UI
│   ├── App.js             # Main application shell
│   ├── components/        # React components
│   │   ├── Dashboard.js          # System overview
│   │   ├── GameLibrary.js        # Game browsing & deployment
│   │   ├── ServerManager.js      # Server management
│   │   ├── Settings.js           # Application settings
│   │   ├── Sidebar.js            # Navigation sidebar
│   │   └── LoadingScreen.js      # Startup screen
│   └── index.js           # React entry point
public/                    # Static assets
scripts/                   # Build and development scripts
```

## 🎯 Supported Games

| Game | Steam App ID | Default Port | Requirements |
|------|-------------|--------------|-------------|
| Valheim | 896660 | 2456 | 4GB RAM, 2 cores |
| Rust | 258550 | 28015 | 8GB RAM, 4 cores |
| Counter-Strike 2 | 730 | 27015 | 2GB RAM, 2 cores |
| 7 Days to Die | 294420 | 26900 | 6GB RAM, 3 cores |
| MotorTown | 1090000* | 27016 | 3GB RAM, 2 cores |

*Placeholder Steam App ID

## 🛠️ Development

### Available Scripts

- `npm start` - Start development with concurrency
- `npm run dev` - Start with custom development script  
- `npm run electron` - Run Electron only
- `npm run build` - Build React app
- `npm run dist` - Create production installer
- `npm test` - Run React tests

### Adding New Games

1. **Update GameServerManager.js**:
   ```javascript
   this.supportedGames = {
     'new_game': {
       name: 'New Game',
       executable: 'game_server.exe',
       defaultPort: 27020,
       steamAppId: '123456',
       arguments: ['-port', '{port}', '-name', '{serverName}']
     }
   };
   ```

2. **Add to GameLibrary.js**:
   ```javascript
   const supportedGames = [
     {
       id: 'new_game',
       name: 'New Game',
       tagline: 'Game description',
       // ... other metadata
     }
   ];
   ```

### Custom Styling

The app uses CSS custom properties for theming:
```css
:root {
  --primary-gradient: linear-gradient(45deg, #667eea, #764ba2);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

## 🔌 API Integration

### Cloud Sync

Configure cloud synchronization in `CloudSync.js`:
```javascript
this.baseUrl = 'https://api.homehost.cloud';
```

Set API key in Settings → Cloud Sync.

### Custom Plugins

Extend functionality through the plugin system:
1. Create plugin in `src/plugins/`
2. Register in `PluginManager.js`
3. Add UI in Settings → Plugins

## 🐛 Troubleshooting

### Common Issues

**SteamCMD not found**
- Verify SteamCMD path in Settings
- Ensure steamcmd.exe exists and is executable
- Run steamcmd.exe once manually to complete setup

**Server won't start**
- Check if game is installed in specified path
- Verify port is not in use
- Check Windows Firewall settings
- Review server logs in Server Manager

**High CPU usage**
- Disable system monitoring in Settings
- Reduce monitoring interval
- Close unnecessary background applications

**Memory leaks**
- Restart application periodically
- Check for stuck server processes
- Monitor memory usage in Dashboard

### Debug Mode

Start with debug logging:
```bash
npm run electron -- --enable-logging
```

### Log Files

- Application logs: `%APPDATA%/homehost-desktop/logs/`
- Server logs: Available in Server Manager → View Logs
- System logs: Windows Event Viewer

## 📊 Performance

### System Requirements

**Minimum:**
- Windows 10 x64
- 4GB RAM
- 2GB free disk space
- DirectX 11 compatible graphics

**Recommended:**
- Windows 11 x64
- 8GB+ RAM
- 10GB+ free disk space
- Dedicated GPU

### Optimization

- Close unused servers to save resources
- Use SSD for game installations
- Configure Windows for gaming performance
- Keep system drivers updated

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Submit pull request

### Code Style

- Use ESLint configuration
- Follow React best practices
- Comment complex logic
- Write tests for new features

## 📄 License

This project is part of the HomeHost ecosystem. See the main project LICENSE for details.

## 🔗 Links

- [HomeHost Cloud API](https://api.homehost.cloud)
- [Documentation](https://docs.homehost.io)
- [Support](https://support.homehost.io)
- [SteamCMD Documentation](https://developer.valvesoftware.com/wiki/SteamCMD)

---

**HomeHost Desktop v1.0.0** - Game server hosting made simple. 🎮