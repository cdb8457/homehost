import React, { useState, useEffect, useRef } from 'react';
import './SecurityMonitor.css';

/**
 * SecurityMonitor Component - Comprehensive security monitoring and audit dashboard
 * 
 * Provides real-time security status, audit results, threat detection,
 * and security configuration management for production deployment.
 */
const SecurityMonitor = ({ isVisible = true, onClose, onAuditComplete }) => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [latestAudit, setLatestAudit] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [rateLimitingStats, setRateLimitingStats] = useState(null);
  const [rateLimitingConfig, setRateLimitingConfig] = useState(null);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditInProgress, setAuditInProgress] = useState(false);
  const [vulnerabilityPatterns, setVulnerabilityPatterns] = useState([]);
  const [complianceStandards, setComplianceStandards] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      loadSecurityData();
      startRealTimeUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      // Load security status
      const status = await window.electronAPI.invoke('security:get-status');
      setSecurityStatus(status);

      // Load audit history
      const history = await window.electronAPI.invoke('security-audit:get-audit-history');
      setAuditHistory(history);

      // Load latest audit
      const latest = await window.electronAPI.invoke('security-audit:get-latest-audit');
      setLatestAudit(latest);

      // Load security events
      const events = await window.electronAPI.invoke('security:get-security-events', { limit: 50 });
      setSecurityEvents(events);

      // Load vulnerability patterns
      const patterns = await window.electronAPI.invoke('security-audit:get-vulnerability-patterns');
      setVulnerabilityPatterns(patterns);

      // Load compliance standards
      const standards = await window.electronAPI.invoke('security-audit:get-compliance-standards');
      setComplianceStandards(standards);

      // Load rate limiting statistics
      const rateLimitStats = await window.electronAPI.invoke('rate-limiting:get-statistics');
      setRateLimitingStats(rateLimitStats);

      // Load rate limiting configuration
      const rateLimitConfig = await window.electronAPI.invoke('rate-limiting:get-configuration');
      setRateLimitingConfig(rateLimitConfig);

      // Load blocked IPs
      const blocked = await window.electronAPI.invoke('rate-limiting:get-blocked-ips');
      setBlockedIPs(blocked);

      // Load suspicious activity
      const suspicious = await window.electronAPI.invoke('rate-limiting:get-suspicious-activity');
      setSuspiciousActivity(suspicious);

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(async () => {
      try {
        const events = await window.electronAPI.invoke('security:get-security-events', { limit: 50 });
        setSecurityEvents(events);
      } catch (error) {
        console.error('Failed to update security events:', error);
      }
    }, 5000); // Update every 5 seconds
  };

  const performSecurityAudit = async () => {
    try {
      setAuditInProgress(true);
      const auditResult = await window.electronAPI.invoke('security-audit:perform-audit', {
        options: { comprehensive: true }
      });
      
      setLatestAudit(auditResult);
      
      // Refresh audit history
      const history = await window.electronAPI.invoke('security-audit:get-audit-history');
      setAuditHistory(history);
      
      if (onAuditComplete) {
        onAuditComplete(auditResult);
      }
    } catch (error) {
      console.error('Security audit failed:', error);
    } finally {
      setAuditInProgress(false);
    }
  };

  const exportAuditReport = async (auditId) => {
    try {
      const exportData = await window.electronAPI.invoke('security-audit:export-audit', { auditId });
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-audit-${auditId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit report:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const renderOverviewTab = () => (
    <div className="security-overview">
      <div className="security-status-grid">
        <div className="status-card">
          <div className="status-header">
            <h3>Security Status</h3>
            <div className={`status-indicator ${securityStatus?.isInitialized ? 'active' : 'inactive'}`}>
              {securityStatus?.isInitialized ? 'Active' : 'Inactive'}
            </div>
          </div>
          {securityStatus && (
            <div className="status-details">
              <div className="stat-item">
                <span className="stat-label">Blocked IPs:</span>
                <span className="stat-value">{securityStatus.statistics.blockedIPs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Security Events:</span>
                <span className="stat-value">{securityStatus.statistics.securityEvents}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Threat Patterns:</span>
                <span className="stat-value">{securityStatus.statistics.threatPatterns}</span>
              </div>
            </div>
          )}
        </div>

        <div className="status-card">
          <div className="status-header">
            <h3>Latest Audit</h3>
            <button 
              className="audit-button"
              onClick={performSecurityAudit}
              disabled={auditInProgress}
            >
              {auditInProgress ? 'Running...' : 'Run Audit'}
            </button>
          </div>
          {latestAudit && (
            <div className="audit-summary">
              <div className="audit-score">
                <span className="score-label">Overall Risk:</span>
                <span 
                  className="score-value"
                  style={{ color: getSeverityColor(latestAudit.summary.overallRisk) }}
                >
                  {latestAudit.summary.overallRisk.toUpperCase()}
                </span>
              </div>
              <div className="audit-stats">
                <div className="audit-stat">
                  <span className="audit-stat-value critical">{latestAudit.summary.criticalIssues}</span>
                  <span className="audit-stat-label">Critical</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-value high">{latestAudit.summary.highIssues}</span>
                  <span className="audit-stat-label">High</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-value medium">{latestAudit.summary.mediumIssues}</span>
                  <span className="audit-stat-label">Medium</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-value low">{latestAudit.summary.lowIssues}</span>
                  <span className="audit-stat-label">Low</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="status-card">
          <div className="status-header">
            <h3>Recent Events</h3>
            <span className="event-count">{securityEvents.length} events</span>
          </div>
          <div className="recent-events">
            {securityEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="event-item">
                <div 
                  className="event-severity"
                  style={{ backgroundColor: getSeverityColor(event.severity) }}
                ></div>
                <div className="event-content">
                  <div className="event-type">{event.type.replace('_', ' ')}</div>
                  <div className="event-time">{formatTimestamp(event.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {latestAudit && latestAudit.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Security Recommendations</h3>
          <div className="recommendations-list">
            {latestAudit.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.priority}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`recommendation-priority ${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <div className="recommendation-description">{rec.description}</div>
                <div className="recommendation-action">{rec.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAuditTab = () => (
    <div className="audit-results">
      <div className="audit-controls">
        <button 
          className="audit-button primary"
          onClick={performSecurityAudit}
          disabled={auditInProgress}
        >
          {auditInProgress ? 'Running Audit...' : 'Run Security Audit'}
        </button>
        {latestAudit && (
          <button 
            className="audit-button"
            onClick={() => exportAuditReport(latestAudit.id)}
          >
            Export Report
          </button>
        )}
      </div>

      {latestAudit && (
        <div className="audit-details">
          <div className="audit-summary-section">
            <h3>Audit Summary</h3>
            <div className="audit-summary-grid">
              <div className="summary-card">
                <span className="summary-value">{latestAudit.summary.totalIssues}</span>
                <span className="summary-label">Total Issues</span>
              </div>
              <div className="summary-card critical">
                <span className="summary-value">{latestAudit.summary.criticalIssues}</span>
                <span className="summary-label">Critical</span>
              </div>
              <div className="summary-card high">
                <span className="summary-value">{latestAudit.summary.highIssues}</span>
                <span className="summary-label">High</span>
              </div>
              <div className="summary-card medium">
                <span className="summary-value">{latestAudit.summary.mediumIssues}</span>
                <span className="summary-label">Medium</span>
              </div>
              <div className="summary-card low">
                <span className="summary-value">{latestAudit.summary.lowIssues}</span>
                <span className="summary-label">Low</span>
              </div>
            </div>
          </div>

          <div className="audit-results-sections">
            {Object.entries(latestAudit.results).map(([category, results]) => (
              <div key={category} className="audit-category">
                <h4>{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                {results.vulnerabilities && results.vulnerabilities.length > 0 && (
                  <div className="vulnerabilities-list">
                    {results.vulnerabilities.slice(0, 10).map((vuln, index) => (
                      <div key={index} className={`vulnerability-item ${vuln.severity}`}>
                        <div className="vulnerability-header">
                          <span className="vulnerability-file">{vuln.file?.split('/').pop()}</span>
                          <span className={`vulnerability-severity ${vuln.severity}`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="vulnerability-description">{vuln.description}</div>
                        {vuln.line && (
                          <div className="vulnerability-location">Line {vuln.line}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {results.issues && results.issues.length > 0 && (
                  <div className="issues-list">
                    {results.issues.map((issue, index) => (
                      <div key={index} className={`issue-item ${issue.severity}`}>
                        <div className="issue-description">{issue.description}</div>
                        <div className="issue-recommendation">{issue.recommendation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="audit-history">
        <h3>Audit History</h3>
        <div className="history-list">
          {auditHistory.map((audit) => (
            <div key={audit.id} className="history-item">
              <div className="history-header">
                <span className="history-date">{formatTimestamp(audit.timestamp)}</span>
                <span className={`history-risk ${audit.summary.overallRisk}`}>
                  {audit.summary.overallRisk.toUpperCase()}
                </span>
              </div>
              <div className="history-summary">
                {audit.summary.totalIssues} issues found 
                ({audit.summary.criticalIssues} critical, {audit.summary.highIssues} high)
              </div>
              <button 
                className="export-button"
                onClick={() => exportAuditReport(audit.id)}
              >
                Export
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="security-events">
      <div className="events-header">
        <h3>Security Events</h3>
        <div className="events-summary">
          <span className="event-total">{securityEvents.length} total events</span>
        </div>
      </div>

      <div className="events-list">
        {securityEvents.map((event, index) => (
          <div key={index} className={`event-item detailed ${event.severity}`}>
            <div className="event-severity-indicator">
              <div 
                className="severity-dot"
                style={{ backgroundColor: getSeverityColor(event.severity) }}
              ></div>
              <span className="severity-text">{event.severity.toUpperCase()}</span>
            </div>
            
            <div className="event-main">
              <div className="event-header">
                <span className="event-type">{event.type.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="event-timestamp">{formatTimestamp(event.timestamp)}</span>
              </div>
              
              {event.threatType && (
                <div className="event-threat-type">
                  Threat Type: {event.threatType.replace(/_/g, ' ')}
                </div>
              )}
              
              {event.ip && (
                <div className="event-ip">IP: {event.ip}</div>
              )}
              
              {event.details && (
                <div className="event-details">
                  {typeof event.details === 'object' ? 
                    JSON.stringify(event.details, null, 2) : 
                    event.details
                  }
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRateLimitingTab = () => (
    <div className="rate-limiting-monitor">
      <div className="rate-limiting-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Request Statistics</h3>
              <div className="stat-period">Last 24 hours</div>
            </div>
            {rateLimitingStats && (
              <div className="stat-content">
                <div className="stat-item large">
                  <span className="stat-value">{rateLimitingStats.totalRequests.toLocaleString()}</span>
                  <span className="stat-label">Total Requests</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value blocked">{rateLimitingStats.blockedRequests.toLocaleString()}</span>
                  <span className="stat-label">Blocked</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value success">
                    {((rateLimitingStats.totalRequests - rateLimitingStats.blockedRequests) / rateLimitingStats.totalRequests * 100).toFixed(1)}%
                  </span>
                  <span className="stat-label">Success Rate</span>
                </div>
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>DDoS Protection</h3>
              <div className={`protection-status ${rateLimitingStats?.ddosAttacks === 0 ? 'safe' : 'alert'}`}>
                {rateLimitingStats?.ddosAttacks === 0 ? 'Protected' : 'Under Attack'}
              </div>
            </div>
            {rateLimitingStats && (
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-value">{rateLimitingStats.ddosAttacks}</span>
                  <span className="stat-label">DDoS Attacks</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{rateLimitingStats.blockedIPs}</span>
                  <span className="stat-label">Blocked IPs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{rateLimitingStats.suspiciousIPs}</span>
                  <span className="stat-label">Suspicious IPs</span>
                </div>
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>Rate Limiting Status</h3>
              <div className={`rate-status ${rateLimitingConfig?.global?.enabled ? 'enabled' : 'disabled'}`}>
                {rateLimitingConfig?.global?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
            {rateLimitingConfig && (
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-value">{rateLimitingConfig.global.maxRequests}</span>
                  <span className="stat-label">Max Requests</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{rateLimitingConfig.global.windowMs / 1000}s</span>
                  <span className="stat-label">Time Window</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Object.keys(rateLimitingConfig.endpoints).length}</span>
                  <span className="stat-label">Protected Endpoints</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rate-limiting-details">
        <div className="blocked-ips-section">
          <h3>Blocked IP Addresses</h3>
          <div className="blocked-ips-list">
            {blockedIPs.length === 0 ? (
              <div className="empty-state">No blocked IPs</div>
            ) : (
              blockedIPs.slice(0, 10).map((blockedIP, index) => (
                <div key={index} className="blocked-ip-item">
                  <div className="ip-info">
                    <span className="ip-address">{blockedIP.ip}</span>
                    <span className="block-reason">{blockedIP.reason}</span>
                  </div>
                  <div className="block-details">
                    <span className="block-time">
                      Blocked: {formatTimestamp(blockedIP.blockedAt)}
                    </span>
                    <span className="block-duration">
                      Until: {formatTimestamp(blockedIP.blockedUntil)}
                    </span>
                  </div>
                  <button 
                    className="unblock-button"
                    onClick={() => unblockIP(blockedIP.ip)}
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="suspicious-activity-section">
          <h3>Suspicious Activity</h3>
          <div className="suspicious-activity-list">
            {suspiciousActivity.length === 0 ? (
              <div className="empty-state">No suspicious activity detected</div>
            ) : (
              suspiciousActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="suspicious-activity-item">
                  <div className="activity-header">
                    <span className="activity-ip">{activity.ip}</span>
                    <span className="activity-time">{formatTimestamp(activity.firstSeen)}</span>
                  </div>
                  <div className="activity-details">
                    <div className="activity-stat">
                      <span className="stat-label">Requests:</span>
                      <span className="stat-value">{activity.requestCount}</span>
                    </div>
                    <div className="activity-stat">
                      <span className="stat-label">Endpoints:</span>
                      <span className="stat-value">{activity.patterns?.endpoints || 0}</span>
                    </div>
                    <div className="activity-stat">
                      <span className="stat-label">User Agents:</span>
                      <span className="stat-value">{activity.patterns?.userAgents || 0}</span>
                    </div>
                  </div>
                  <button 
                    className="block-button"
                    onClick={() => blockSuspiciousIP(activity.ip)}
                  >
                    Block IP
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="endpoint-config-section">
          <h3>Endpoint Configuration</h3>
          <div className="endpoint-config-list">
            {rateLimitingConfig && Object.entries(rateLimitingConfig.endpoints).map(([endpoint, config]) => (
              <div key={endpoint} className="endpoint-config-item">
                <div className="endpoint-header">
                  <span className="endpoint-path">{endpoint}</span>
                  <span className={`endpoint-status ${config.enabled !== false ? 'enabled' : 'disabled'}`}>
                    {config.enabled !== false ? 'Protected' : 'Disabled'}
                  </span>
                </div>
                <div className="endpoint-limits">
                  <div className="limit-item">
                    <span className="limit-label">Max Requests:</span>
                    <span className="limit-value">{config.maxRequests}</span>
                  </div>
                  <div className="limit-item">
                    <span className="limit-label">Window:</span>
                    <span className="limit-value">{config.windowMs / 1000}s</span>
                  </div>
                  <div className="limit-item">
                    <span className="limit-label">Burst Limit:</span>
                    <span className="limit-value">{config.burstLimit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const unblockIP = async (ip) => {
    try {
      await window.electronAPI.invoke('rate-limiting:unblock-ip', { ip });
      // Refresh blocked IPs list
      const blocked = await window.electronAPI.invoke('rate-limiting:get-blocked-ips');
      setBlockedIPs(blocked);
    } catch (error) {
      console.error('Failed to unblock IP:', error);
    }
  };

  const blockSuspiciousIP = async (ip) => {
    try {
      await window.electronAPI.invoke('rate-limiting:block-ip', { 
        ip, 
        duration: 60 * 60 * 1000, // 1 hour
        reason: 'SUSPICIOUS_ACTIVITY' 
      });
      // Refresh data
      const blocked = await window.electronAPI.invoke('rate-limiting:get-blocked-ips');
      setBlockedIPs(blocked);
      const suspicious = await window.electronAPI.invoke('rate-limiting:get-suspicious-activity');
      setSuspiciousActivity(suspicious);
    } catch (error) {
      console.error('Failed to block suspicious IP:', error);
    }
  };

  const renderConfigTab = () => (
    <div className="security-config">
      <div className="config-section">
        <h3>Security Configuration</h3>
        {securityStatus?.config && (
          <div className="config-grid">
            <div className="config-group">
              <h4>Rate Limiting</h4>
              <div className="config-item">
                <span>Enabled: {securityStatus.config.rateLimiting.enabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="config-item">
                <span>Window: {securityStatus.config.rateLimiting.windowMs / 1000}s</span>
              </div>
              <div className="config-item">
                <span>Max Requests: {securityStatus.config.rateLimiting.maxRequests}</span>
              </div>
            </div>

            <div className="config-group">
              <h4>Encryption</h4>
              <div className="config-item">
                <span>Algorithm: {securityStatus.config.encryption.algorithm}</span>
              </div>
              <div className="config-item">
                <span>Key Length: {securityStatus.config.encryption.keyLength} bytes</span>
              </div>
              <div className="config-item">
                <span>Salt Rounds: {securityStatus.config.encryption.saltRounds}</span>
              </div>
            </div>

            <div className="config-group">
              <h4>Validation</h4>
              <div className="config-item">
                <span>Max Input Length: {securityStatus.config.validation.maxInputLength}</span>
              </div>
              <div className="config-item">
                <span>Max File Size: {Math.round(securityStatus.config.validation.maxFileSize / 1024 / 1024)}MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="compliance-section">
        <h3>Compliance Standards</h3>
        <div className="compliance-grid">
          {complianceStandards.map(([standardId, standard]) => (
            <div key={standardId} className="compliance-item">
              <h4>{standard.name}</h4>
              <div className="compliance-checks">
                {standard.checks.map((check, index) => (
                  <div key={index} className={`compliance-check ${check.severity}`}>
                    <span className="check-name">{check.name}</span>
                    <span className={`check-severity ${check.severity}`}>
                      {check.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="security-monitor">
      <div className="security-monitor-header">
        <h2>Security Monitor</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="security-monitor-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Security Audit
        </button>
        <button 
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Security Events
        </button>
        <button 
          className={`tab-button ${activeTab === 'rate-limiting' ? 'active' : ''}`}
          onClick={() => setActiveTab('rate-limiting')}
        >
          Rate Limiting
        </button>
        <button 
          className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
      </div>

      <div className="security-monitor-content">
        {isLoading ? (
          <div className="loading">Loading security data...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'audit' && renderAuditTab()}
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'rate-limiting' && renderRateLimitingTab()}
            {activeTab === 'config' && renderConfigTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityMonitor;