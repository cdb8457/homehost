# HomeHost UI Components Integration Guide

## Overview

This guide provides comprehensive instructions for integrating the production-ready UI component suite into the HomeHost desktop application. The suite includes four major dashboards for complete system monitoring and management.

## Components Summary

### 1. SecurityMonitor 
**File:** `src/renderer/components/SecurityMonitor.js`
- Real-time security monitoring and threat detection
- Security audit results and vulnerability scanning
- Rate limiting and DDoS protection controls
- Security event logging and analysis

### 2. PerformanceDashboard
**File:** `src/renderer/components/PerformanceDashboard.js`
- Real-time performance metrics visualization
- CPU, memory, and event loop monitoring
- Performance optimization recommendations
- Historical performance analysis

### 3. DeploymentManager
**File:** `src/renderer/components/DeploymentManager.js`
- Multi-environment deployment management
- Automated deployment pipeline controls
- Rollback capabilities and deployment history
- Active deployment monitoring

### 4. HealthMonitor
**File:** `src/renderer/components/HealthMonitor.js`
- System health and service status monitoring
- Health check automation and alerts
- Health history and trend analysis
- Configuration management

## Integration Steps

### Step 1: Import Components in Main App

Update your main App.js file to include the dashboard components:

```javascript
import React, { useState } from 'react';
import SecurityMonitor from './components/SecurityMonitor';
import PerformanceDashboard from './components/PerformanceDashboard';
import DeploymentManager from './components/DeploymentManager';
import HealthMonitor from './components/HealthMonitor';

function App() {
  const [activeComponent, setActiveComponent] = useState(null);

  const openComponent = (component) => {
    setActiveComponent(component);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  return (
    <div className="App">
      {/* Your existing app content */}
      
      {/* Navigation buttons */}
      <div className="dashboard-nav">
        <button onClick={() => openComponent('security')}>Security Monitor</button>
        <button onClick={() => openComponent('performance')}>Performance Dashboard</button>
        <button onClick={() => openComponent('deployment')}>Deployment Manager</button>
        <button onClick={() => openComponent('health')}>Health Monitor</button>
      </div>

      {/* Dashboard components */}
      <SecurityMonitor 
        isVisible={activeComponent === 'security'} 
        onClose={closeComponent} 
      />
      <PerformanceDashboard 
        isVisible={activeComponent === 'performance'} 
        onClose={closeComponent} 
      />
      <DeploymentManager 
        isVisible={activeComponent === 'deployment'} 
        onClose={closeComponent} 
      />
      <HealthMonitor 
        isVisible={activeComponent === 'health'} 
        onClose={closeComponent} 
      />
    </div>
  );
}
```

### Step 2: Required IPC Handlers

Ensure the following IPC handlers are implemented in your main process (`src/main/main.js`):

#### Security Monitoring IPC Handlers
```javascript
// Security status and monitoring
ipcMain.handle('security:get-status', async () => { /* ... */ });
ipcMain.handle('security:get-security-events', async (event, options) => { /* ... */ });
ipcMain.handle('security-audit:get-audit-history', async () => { /* ... */ });
ipcMain.handle('security-audit:get-latest-audit', async () => { /* ... */ });
ipcMain.handle('security-audit:perform-audit', async (event, options) => { /* ... */ });
ipcMain.handle('security-audit:export-audit', async (event, { auditId }) => { /* ... */ });

// Rate limiting and DDoS protection
ipcMain.handle('rate-limiting:get-statistics', async () => { /* ... */ });
ipcMain.handle('rate-limiting:get-configuration', async () => { /* ... */ });
ipcMain.handle('rate-limiting:get-blocked-ips', async () => { /* ... */ });
ipcMain.handle('rate-limiting:get-suspicious-activity', async () => { /* ... */ });
ipcMain.handle('rate-limiting:unblock-ip', async (event, { ip }) => { /* ... */ });
ipcMain.handle('rate-limiting:block-ip', async (event, { ip, duration, reason }) => { /* ... */ });
```

#### Performance Monitoring IPC Handlers
```javascript
// Performance metrics and monitoring
ipcMain.handle('performance:get-summary', async (event, { timeWindow }) => { /* ... */ });
ipcMain.handle('performance:get-latest-metrics', async (event, { type }) => { /* ... */ });
ipcMain.handle('performance:get-recent-metrics', async (event, { type, timeWindow }) => { /* ... */ });
ipcMain.handle('performance:get-alerts', async (event, { timeWindow }) => { /* ... */ });
ipcMain.handle('performance:get-recommendations', async () => { /* ... */ });
ipcMain.handle('performance:apply-optimization', async (event, { recommendationId, options }) => { /* ... */ });
ipcMain.handle('performance:get-configuration', async () => { /* ... */ });
ipcMain.handle('performance:export-data', async (event, { timeWindow }) => { /* ... */ });
```

#### Deployment Management IPC Handlers
```javascript
// Deployment pipeline and environment management
ipcMain.handle('deployment:get-configuration', async () => { /* ... */ });
ipcMain.handle('deployment:get-environment-status', async (event, { environment }) => { /* ... */ });
ipcMain.handle('deployment:get-deployment-history', async (event, { limit }) => { /* ... */ });
ipcMain.handle('deployment:get-active-deployments', async () => { /* ... */ });
ipcMain.handle('deployment:get-statistics', async () => { /* ... */ });
ipcMain.handle('deployment:deploy', async (event, { environment, options }) => { /* ... */ });
ipcMain.handle('deployment:rollback', async (event, { environment, targetVersion }) => { /* ... */ });
ipcMain.handle('deployment:cancel', async (event, { deploymentId }) => { /* ... */ });
ipcMain.handle('deployment:export-data', async () => { /* ... */ });
```

#### Health Monitoring IPC Handlers
```javascript
// Health checks and system monitoring
ipcMain.handle('health:get-configuration', async () => { /* ... */ });
ipcMain.handle('health:get-current-health', async () => { /* ... */ });
ipcMain.handle('health:get-health-history', async (event, { limit, timeWindow }) => { /* ... */ });
ipcMain.handle('health:get-health-summary', async (event, { timeWindow }) => { /* ... */ });
ipcMain.handle('health:get-service-statuses', async () => { /* ... */ });
ipcMain.handle('health:get-health-alerts', async (event, { timeWindow }) => { /* ... */ });
ipcMain.handle('health:perform-health-check', async () => { /* ... */ });
ipcMain.handle('health:export-data', async (event, { timeWindow }) => { /* ... */ });
```

### Step 3: Service Integration

Connect the IPC handlers to your existing backend services:

```javascript
// Import your services
const SecurityManager = require('./services/SecurityManager');
const SecurityAuditor = require('./services/SecurityAuditor');
const PerformanceMonitor = require('./services/PerformanceMonitor');
const DeploymentService = require('./services/DeploymentService');
const HealthCheckService = require('./services/HealthCheckService');

// Initialize services
const securityManager = new SecurityManager(store, logger);
const securityAuditor = new SecurityAuditor(store, logger);
const performanceMonitor = new PerformanceMonitor(store, logger);
const deploymentService = new DeploymentService(store, logger);
const healthCheckService = new HealthCheckService(store, logger, services);

// Connect handlers to services
ipcMain.handle('security:get-status', async () => {
  return securityManager.getStatus();
});

ipcMain.handle('performance:get-latest-metrics', async (event, { type }) => {
  return performanceMonitor.getLatestMetrics(type);
});

// ... continue for all handlers
```

### Step 4: CSS Variables Setup

Add the following CSS variables to your root CSS file for theme support:

```css
:root {
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --hover-color: #f1f5f9;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #6366f1;
  --secondary-hover: #5b21b6;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --surface-color: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --border-color: #475569;
    --hover-color: #475569;
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --secondary-color: #6366f1;
    --secondary-hover: #5b21b6;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
    --success-color: #10b981;
  }
}
```

## Component Features

### SecurityMonitor Features
- **Real-time threat monitoring** with event filtering
- **Security audit execution** with comprehensive reporting
- **Rate limiting controls** with IP blocking/unblocking
- **DDoS protection monitoring** with attack statistics
- **Vulnerability scanning** with severity classification
- **Configuration management** for security policies

### PerformanceDashboard Features
- **Real-time metrics** for CPU, memory, and event loop
- **Mini-charts** for performance trend visualization
- **Performance alerts** with configurable thresholds
- **Optimization recommendations** with one-click application
- **Time range filtering** (5m, 15m, 1h, 6h, 24h)
- **Data export** for external analysis

### DeploymentManager Features
- **Multi-environment support** (development, staging, production)
- **One-click deployment** with progress tracking
- **Rollback capabilities** to previous versions
- **Active deployment monitoring** with cancellation
- **Deployment history** with detailed logging
- **Environment health checking** integration

### HealthMonitor Features
- **System resource monitoring** with visual progress bars
- **Service status tracking** with real-time updates
- **Health percentage calculation** with circular progress
- **Health history visualization** with trend charts
- **Configurable health checks** with threshold management
- **Alert system** with severity-based notifications

## Best Practices

### 1. Error Handling
All components include comprehensive error handling. Ensure your IPC handlers return appropriate error responses:

```javascript
ipcMain.handle('security:get-status', async () => {
  try {
    return await securityManager.getStatus();
  } catch (error) {
    logger.error('Failed to get security status:', error);
    throw new Error(`Security status unavailable: ${error.message}`);
  }
});
```

### 2. Performance Optimization
- Components use `useEffect` cleanup to prevent memory leaks
- Real-time updates are throttled to appropriate intervals
- Large datasets are paginated and filtered on the backend

### 3. Security Considerations
- All data is validated before display
- Sensitive information is masked in UI components
- User actions require appropriate permissions

### 4. Responsive Design
All components are responsive and adapt to different screen sizes. Test on various window sizes to ensure proper layout.

## Testing Integration

### 1. Component Testing
Test each component in isolation:

```javascript
// Test component rendering
import { render, screen } from '@testing-library/react';
import SecurityMonitor from './SecurityMonitor';

test('renders security monitor', () => {
  render(<SecurityMonitor isVisible={true} onClose={() => {}} />);
  expect(screen.getByText('Security Monitor')).toBeInTheDocument();
});
```

### 2. Integration Testing
Test IPC communication between renderer and main processes:

```javascript
// Mock electronAPI for testing
window.electronAPI = {
  invoke: jest.fn().mockResolvedValue({ status: 'healthy' })
};
```

### 3. End-to-End Testing
Use the existing E2E tests in `tests/e2e/` directory as reference for testing the integrated dashboards.

## Troubleshooting

### Common Issues

1. **Component not rendering**: Check that `isVisible` prop is set correctly
2. **Data not loading**: Verify IPC handlers are properly registered
3. **Styling issues**: Ensure CSS variables are defined in root stylesheet
4. **Real-time updates not working**: Check service initialization and interval cleanup

### Debug Mode
Enable debug logging in components by setting:

```javascript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Component data:', data);
```

## Production Deployment

### Build Process
The components are included in the standard React build process. No additional build steps required.

### Performance Monitoring
Monitor component performance in production:
- Check memory usage with dev tools
- Monitor IPC call frequency
- Validate real-time update intervals

### Security Audit
Regularly audit the integrated components:
- Review data exposure in UI
- Validate user permission requirements
- Test error handling scenarios

## Support and Maintenance

### Code Organization
- Components are self-contained with their CSS files
- Shared utilities can be extracted to `src/renderer/utils/`
- Common styling patterns can be moved to shared CSS files

### Future Enhancements
The component architecture supports easy extension:
- Add new dashboard tabs
- Implement additional chart types
- Integrate with external monitoring services
- Add export formats (PDF, CSV, etc.)

This integration guide provides a complete pathway to implementing the production-ready UI component suite in your HomeHost application.