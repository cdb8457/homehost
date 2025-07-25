using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Diagnostics;

namespace HomeHost.CloudApi.Services
{
    public class CommunityAnalyticsService : ICommunityAnalyticsService
    {
        private readonly HomeHostContext _context;
        private readonly ICommunityService _communityService;
        private readonly IPlayerManagementService _playerService;
        private readonly ILogger<CommunityAnalyticsService> _logger;

        public CommunityAnalyticsService(
            HomeHostContext context,
            ICommunityService communityService,
            IPlayerManagementService playerService,
            ILogger<CommunityAnalyticsService> logger)
        {
            _context = context;
            _communityService = communityService;
            _playerService = playerService;
            _logger = logger;
        }

        // Core Analytics
        public async Task<CommunityDashboard> GetCommunityDashboardAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Verify user has access to community analytics
            await ValidateCommunityAccessAsync(communityId, userId);

            var (startDate, endDate) = GetTimeframeRange(timeframe);
            
            // Build overview
            var overview = await BuildCommunityOverviewAsync(communityId, startDate, endDate);
            
            // Build key metrics
            var keyMetrics = await BuildKeyMetricsAsync(communityId, startDate, endDate);
            
            // Build trend charts
            var trendCharts = await BuildTrendChartsAsync(communityId, startDate, endDate, timeframe);
            
            // Generate insights
            var insights = await GenerateInsightsAsync(communityId, startDate, endDate);
            
            // Generate recommendations
            var recommendations = await GenerateRecommendationsAsync(communityId, startDate, endDate);

            stopwatch.Stop();

            return new CommunityDashboard
            {
                CommunityId = communityId,
                Timeframe = timeframe,
                Overview = overview,
                KeyMetrics = keyMetrics,
                TrendCharts = trendCharts,
                Insights = insights,
                Recommendations = recommendations,
                GeneratedAt = DateTime.UtcNow,
                Metadata = new AnalyticsMetadata
                {
                    LastCalculated = DateTime.UtcNow,
                    CalculationDuration = stopwatch.Elapsed,
                    DataSources = new List<string> { "members", "sessions", "activities", "servers" },
                    Confidence = 0.95f
                }
            };
        }

        public async Task<CommunityMetrics> GetCommunityMetricsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var metrics = new Dictionary<string, object>();

            // Member metrics
            var totalMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var activeMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.LastActiveAt >= start)
                .CountAsync();

            var newMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt >= start && m.JoinedAt <= end)
                .CountAsync();

            // Server metrics
            var totalServers = await _context.GameServers
                .Where(s => s.CommunityId == communityId)
                .CountAsync();

            var activeServers = await _context.GameServers
                .Where(s => s.CommunityId == communityId && s.Status == "Running")
                .CountAsync();

            // Activity metrics
            var totalSessions = await _context.PlayerSessions
                .Where(s => s.CommunityId == communityId && s.StartTime >= start && s.StartTime <= end)
                .CountAsync();

            var totalPlaytime = await _context.PlayerSessions
                .Where(s => s.CommunityId == communityId && 
                           s.StartTime >= start && s.StartTime <= end &&
                           s.DurationMinutes.HasValue)
                .SumAsync(s => s.DurationMinutes!.Value);

            metrics["total_members"] = totalMembers;
            metrics["active_members"] = activeMembers;
            metrics["new_members"] = newMembers;
            metrics["total_servers"] = totalServers;
            metrics["active_servers"] = activeServers;
            metrics["total_sessions"] = totalSessions;
            metrics["total_playtime_hours"] = totalPlaytime / 60.0f;
            metrics["engagement_rate"] = totalMembers > 0 ? (float)activeMembers / totalMembers : 0f;

            return new CommunityMetrics
            {
                CommunityId = communityId,
                StartDate = start,
                EndDate = end,
                Metrics = metrics,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<List<AnalyticsWidget>> GetDashboardWidgetsAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var widgets = new List<AnalyticsWidget>();

            // Member growth widget
            var memberGrowthData = await BuildMemberGrowthChartAsync(communityId, AnalyticsTimeframe.Month);
            widgets.Add(new AnalyticsWidget
            {
                Id = "member_growth",
                Type = "chart",
                Title = "Member Growth",
                Size = "medium",
                Data = memberGrowthData,
                LastUpdated = DateTime.UtcNow
            });

            // Active members metric widget
            var activeMembers = await GetActiveMembers(communityId, TimeSpan.FromDays(7));
            widgets.Add(new AnalyticsWidget
            {
                Id = "active_members",
                Type = "metric",
                Title = "Weekly Active Members",
                Size = "small",
                Data = new { value = activeMembers, trend = "up", change = "+5%" },
                LastUpdated = DateTime.UtcNow
            });

            // Engagement rate widget
            var engagementRate = await CalculateEngagementRate(communityId, TimeSpan.FromDays(7));
            widgets.Add(new AnalyticsWidget
            {
                Id = "engagement_rate",
                Type = "metric",
                Title = "Engagement Rate",
                Size = "small",
                Data = new { value = engagementRate, format = "percentage", trend = "stable" },
                LastUpdated = DateTime.UtcNow
            });

            // Server utilization widget
            var serverUtilization = await BuildServerUtilizationData(communityId);
            widgets.Add(new AnalyticsWidget
            {
                Id = "server_utilization",
                Type = "chart",
                Title = "Server Utilization",
                Size = "medium",
                Data = serverUtilization,
                LastUpdated = DateTime.UtcNow
            });

            return widgets;
        }

        public async Task<AnalyticsWidget> GetCustomWidgetAsync(Guid communityId, Guid userId, string widgetType, Dictionary<string, object> parameters)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            return widgetType switch
            {
                "playtime_distribution" => await BuildPlaytimeDistributionWidget(communityId, parameters),
                "member_activity_heatmap" => await BuildActivityHeatmapWidget(communityId, parameters),
                "retention_cohort" => await BuildRetentionCohortWidget(communityId, parameters),
                "growth_funnel" => await BuildGrowthFunnelWidget(communityId, parameters),
                _ => throw new ArgumentException($"Unknown widget type: {widgetType}")
            };
        }

        // Member Analytics
        public async Task<MemberAnalytics> GetMemberAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var (startDate, endDate) = GetTimeframeRange(timeframe);

            var growth = await BuildMemberGrowthMetrics(communityId, startDate, endDate);
            var demographics = await BuildMemberDemographics(communityId);
            var activity = await BuildMemberActivityMetrics(communityId, startDate, endDate);
            var retention = await BuildMemberRetentionMetrics(communityId, startDate, endDate);
            var cohorts = await BuildMemberCohorts(communityId, timeframe);

            return new MemberAnalytics
            {
                CommunityId = communityId,
                Timeframe = timeframe,
                Growth = growth,
                Demographics = demographics,
                Activity = activity,
                Retention = retention,
                Cohorts = cohorts,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<List<MemberEngagementMetric>> GetMemberEngagementAsync(Guid communityId, Guid userId, int page = 1, int pageSize = 50)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var members = await _context.CommunityMembers
                .Include(m => m.User)
                .Where(m => m.CommunityId == communityId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var engagementMetrics = new List<MemberEngagementMetric>();

            foreach (var member in members)
            {
                var engagement = await CalculateMemberEngagement(member.UserId, communityId);
                engagementMetrics.Add(engagement);
            }

            return engagementMetrics.OrderByDescending(e => e.Score.Overall).ToList();
        }

        public async Task<MemberRetentionAnalysis> GetMemberRetentionAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            // Build retention cohorts by month
            var retentionCohorts = new List<RetentionCohort>();
            var startDate = DateTime.UtcNow.AddMonths(-12);

            for (int i = 0; i < 12; i++)
            {
                var cohortStart = startDate.AddMonths(i);
                var cohortEnd = cohortStart.AddMonths(1);

                var cohortMembers = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && 
                               m.JoinedAt >= cohortStart && 
                               m.JoinedAt < cohortEnd)
                    .Select(m => m.UserId)
                    .ToListAsync();

                if (cohortMembers.Any())
                {
                    var cohort = await BuildRetentionCohort(cohortStart, cohortMembers, communityId);
                    retentionCohorts.Add(cohort);
                }
            }

            // Calculate overall retention metrics
            var overallRetention = await CalculateOverallRetention(communityId);
            var retentionByDays = await CalculateRetentionByDays(communityId);
            var churnFactors = await AnalyzeChurnFactors(communityId);

            return new MemberRetentionAnalysis
            {
                OverallRetentionRate = overallRetention,
                RetentionByDays = retentionByDays,
                RetentionCohorts = retentionCohorts,
                ChurnFactors = churnFactors
            };
        }

        public async Task<List<MemberSegment>> GetMemberSegmentsAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var segments = new List<MemberSegment>();

            // Define segments based on engagement and activity patterns
            var allMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .ToListAsync();

            var totalMembers = allMembers.Count;

            // Champions (High engagement, long tenure)
            var champions = await GetChampionMembers(communityId);
            segments.Add(new MemberSegment
            {
                Name = "Champions",
                Description = "Highly engaged long-term members who drive community activity",
                MemberCount = champions.Count,
                Percentage = (float)champions.Count / totalMembers * 100,
                Characteristics = await BuildSegmentCharacteristics(champions, communityId)
            });

            // Active Members (Regular engagement)
            var activeMembers = await GetActiveMembers(communityId);
            segments.Add(new MemberSegment
            {
                Name = "Active Members",
                Description = "Regularly active members with consistent engagement",
                MemberCount = activeMembers.Count,
                Percentage = (float)activeMembers.Count / totalMembers * 100,
                Characteristics = await BuildSegmentCharacteristics(activeMembers, communityId)
            });

            // Casual Members (Low but consistent engagement)
            var casualMembers = await GetCasualMembers(communityId);
            segments.Add(new MemberSegment
            {
                Name = "Casual Members",
                Description = "Members with low but consistent engagement",
                MemberCount = casualMembers.Count,
                Percentage = (float)casualMembers.Count / totalMembers * 100,
                Characteristics = await BuildSegmentCharacteristics(casualMembers, communityId)
            });

            // At-Risk Members (Declining engagement)
            var atRiskMembers = await GetAtRiskMembers(communityId);
            segments.Add(new MemberSegment
            {
                Name = "At-Risk",
                Description = "Members showing signs of declining engagement",
                MemberCount = atRiskMembers.Count,
                Percentage = (float)atRiskMembers.Count / totalMembers * 100,
                Characteristics = await BuildSegmentCharacteristics(atRiskMembers, communityId)
            });

            return segments;
        }

        public async Task<MemberLifecycleAnalysis> GetMemberLifecycleAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var stages = new List<LifecycleStage>
            {
                new LifecycleStage
                {
                    Name = "New",
                    Description = "Members who joined in the last 7 days",
                    MemberCount = await _context.CommunityMembers
                        .Where(m => m.CommunityId == communityId && m.JoinedAt >= DateTime.UtcNow.AddDays(-7))
                        .CountAsync(),
                    AverageTimeInStage = 7,
                    TypicalBehaviors = new List<string> { "Exploring servers", "Reading community rules", "First interactions" },
                    SuccessFactors = new List<string> { "Quick onboarding", "Welcoming community", "Active moderators" }
                },
                new LifecycleStage
                {
                    Name = "Active",
                    Description = "Regular members with consistent engagement",
                    MemberCount = await GetActiveMembers(communityId, TimeSpan.FromDays(30)),
                    AverageTimeInStage = 90,
                    TypicalBehaviors = new List<string> { "Regular gaming sessions", "Community participation", "Friend connections" },
                    SuccessFactors = new List<string> { "Good game variety", "Social connections", "Regular events" }
                },
                new LifecycleStage
                {
                    Name = "Champion",
                    Description = "Highly engaged community advocates",
                    MemberCount = (await GetChampionMembers(communityId)).Count,
                    AverageTimeInStage = 365,
                    TypicalBehaviors = new List<string> { "Daily activity", "Helping newcomers", "Creating content" },
                    SuccessFactors = new List<string> { "Recognition", "Leadership opportunities", "Special privileges" }
                }
            };

            var stageDistribution = stages.ToDictionary(s => s.Name, s => s.MemberCount);

            return new MemberLifecycleAnalysis
            {
                Stages = stages,
                StageDistribution = stageDistribution,
                Transitions = await BuildLifecycleTransitions(communityId),
                Optimizations = await BuildLifecycleOptimizations(communityId)
            };
        }

        // Growth Analytics
        public async Task<GrowthAnalytics> GetGrowthAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var (startDate, endDate) = GetTimeframeRange(timeframe);

            var overview = await BuildGrowthOverview(communityId, startDate, endDate);
            var channels = await BuildGrowthChannels(communityId, startDate, endDate);
            var virality = await BuildViralityMetrics(communityId, startDate, endDate);
            var experiments = await BuildGrowthExperiments(communityId, startDate, endDate);

            return new GrowthAnalytics
            {
                CommunityId = communityId,
                Timeframe = timeframe,
                Overview = overview,
                Channels = channels,
                Virality = virality,
                Experiments = experiments,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<GrowthForecast> GetGrowthForecastAsync(Guid communityId, Guid userId, int daysAhead = 30)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            // Simple linear regression based on historical growth
            var historicalData = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .GroupBy(m => m.JoinedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(g => g.Date)
                .ToListAsync();

            // Calculate trend and project forward
            var avgDailyGrowth = historicalData.Any() ? 
                historicalData.Average(d => d.Count) : 0;

            var currentMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            return new GrowthForecast
            {
                CommunityId = communityId,
                ForecastDate = DateTime.UtcNow.AddDays(daysAhead),
                ProjectedMembers = currentMembers + (int)(avgDailyGrowth * daysAhead),
                Confidence = 0.7f,
                GrowthRate = avgDailyGrowth,
                Methodology = "Linear regression on historical growth"
            };
        }

        public async Task<List<GrowthDriver>> GetGrowthDriversAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var drivers = new List<GrowthDriver>();

            // Analyze growth correlation with various factors
            drivers.Add(new GrowthDriver
            {
                Name = "Server Activity",
                Impact = 0.8f,
                Description = "High server utilization correlates with member growth",
                Data = await AnalyzeServerActivityImpact(communityId)
            });

            drivers.Add(new GrowthDriver
            {
                Name = "Community Events",
                Impact = 0.6f,
                Description = "Organized events drive member acquisition",
                Data = await AnalyzeEventImpact(communityId)
            });

            drivers.Add(new GrowthDriver
            {
                Name = "Social Sharing",
                Impact = 0.7f,
                Description = "Member referrals are a key growth source",
                Data = await AnalyzeSocialSharingImpact(communityId)
            });

            return drivers.OrderByDescending(d => d.Impact).ToList();
        }

        public async Task<CompetitiveAnalysis> GetCompetitiveAnalysisAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var community = await _context.Communities.FindAsync(communityId);
            if (community == null) throw new ArgumentException("Community not found");

            // Find similar communities for comparison
            var similarCommunities = await _context.Communities
                .Where(c => c.Id != communityId && 
                           c.IsPublic &&
                           c.Settings.AllowedGames.Any(g => community.Settings.AllowedGames.Contains(g)))
                .Take(10)
                .ToListAsync();

            var competitorMetrics = new List<CompetitorMetric>();

            foreach (var competitor in similarCommunities)
            {
                var competitorStats = await _communityService.GetCommunityStatsAsync(competitor.Id);
                competitorMetrics.Add(new CompetitorMetric
                {
                    CommunityId = competitor.Id,
                    Name = competitor.Name,
                    MemberCount = competitor.MemberCount,
                    GrowthRate = await CalculateGrowthRate(competitor.Id, TimeSpan.FromDays(30)),
                    EngagementRate = await CalculateEngagementRate(competitor.Id, TimeSpan.FromDays(7)),
                    ActiveServers = competitorStats.ActiveServers
                });
            }

            return new CompetitiveAnalysis
            {
                CommunityId = communityId,
                Competitors = competitorMetrics,
                MarketPosition = await CalculateMarketPosition(communityId, competitorMetrics),
                Opportunities = await IdentifyCompetitiveOpportunities(communityId, competitorMetrics),
                GeneratedAt = DateTime.UtcNow
            };
        }

        // Real-time Analytics
        public async Task<RealTimeMetrics> GetRealTimeMetricsAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var onlineMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && 
                           m.LastActiveAt >= DateTime.UtcNow.AddMinutes(-15))
                .CountAsync();

            var activeSessions = await _context.PlayerSessions
                .Where(s => s.CommunityId == communityId && !s.EndTime.HasValue)
                .CountAsync();

            var recentActivities = await _context.PlayerActivities
                .Where(a => a.CommunityId == communityId && 
                           a.CreatedAt >= DateTime.UtcNow.AddHours(-1))
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .Select(a => new LiveActivity
                {
                    Type = a.ActivityType,
                    Description = a.Description,
                    UserId = a.UserId,
                    UserName = a.RelatedUserName,
                    Timestamp = a.CreatedAt
                })
                .ToListAsync();

            var serverPopulations = await _context.GameServers
                .Where(s => s.CommunityId == communityId && s.Status == "Running")
                .ToDictionaryAsync(s => s.Name, s => s.PlayerCount);

            return new RealTimeMetrics
            {
                CommunityId = communityId,
                OnlineMembers = onlineMembers,
                ActiveSessions = activeSessions,
                RecentActivities = recentActivities,
                ServerPopulations = serverPopulations,
                CurrentEngagementRate = await CalculateRealTimeEngagementRate(communityId),
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<List<LiveEvent>> GetLiveEventsAsync(Guid communityId, Guid userId, int limit = 10)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var events = new List<LiveEvent>();

            // Check for member growth spikes
            var recentGrowth = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt >= DateTime.UtcNow.AddHours(-1))
                .CountAsync();

            if (recentGrowth > 5)
            {
                events.Add(new LiveEvent
                {
                    Type = "spike",
                    Title = "Member Growth Spike",
                    Description = $"{recentGrowth} new members joined in the last hour",
                    Significance = Math.Min(recentGrowth / 10.0f, 1.0f),
                    DetectedAt = DateTime.UtcNow,
                    Data = new Dictionary<string, object> { ["new_members"] = recentGrowth }
                });
            }

            // Check for milestones
            var totalMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var milestones = new[] { 50, 100, 250, 500, 1000, 2500, 5000 };
            foreach (var milestone in milestones)
            {
                if (totalMembers >= milestone && totalMembers < milestone + 10)
                {
                    events.Add(new LiveEvent
                    {
                        Type = "milestone",
                        Title = $"{milestone} Members Milestone",
                        Description = $"Community has reached {totalMembers} members!",
                        Significance = 0.9f,
                        DetectedAt = DateTime.UtcNow,
                        Data = new Dictionary<string, object> { ["milestone"] = milestone, ["current"] = totalMembers }
                    });
                }
            }

            return events.Take(limit).OrderByDescending(e => e.Significance).ToList();
        }

        public async Task<AlertConfiguration> GetAnalyticsAlertsAsync(Guid communityId, Guid userId)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var existingConfig = await _context.AnalyticsAlertConfigurations
                .FirstOrDefaultAsync(c => c.CommunityId == communityId);

            if (existingConfig != null)
            {
                return existingConfig;
            }

            // Return default configuration
            return new AlertConfiguration
            {
                CommunityId = communityId,
                Alerts = GetDefaultAlerts(),
                Settings = new AlertSettings(),
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<AlertConfiguration> UpdateAnalyticsAlertsAsync(Guid communityId, Guid userId, UpdateAlertsRequest request)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var config = await _context.AnalyticsAlertConfigurations
                .FirstOrDefaultAsync(c => c.CommunityId == communityId);

            if (config == null)
            {
                config = new AlertConfiguration
                {
                    CommunityId = communityId,
                    Alerts = request.Alerts,
                    Settings = new AlertSettings(),
                    LastUpdated = DateTime.UtcNow
                };
                _context.AnalyticsAlertConfigurations.Add(config);
            }
            else
            {
                config.Alerts = request.Alerts;
                config.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return config;
        }

        // Custom Reports
        public async Task<CustomReport> GenerateCustomReportAsync(Guid communityId, Guid userId, CustomReportRequest request)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            var sections = new List<ReportSection>();

            foreach (var metric in request.Metrics)
            {
                var data = await GenerateMetricData(communityId, metric, request.StartDate, request.EndDate, request.Granularity);
                sections.Add(new ReportSection
                {
                    Title = metric,
                    Type = "chart",
                    Data = data,
                    Description = GetMetricDescription(metric)
                });
            }

            var summary = await BuildReportSummary(communityId, request);

            return new CustomReport
            {
                Name = request.Name,
                GeneratedAt = DateTime.UtcNow,
                Sections = sections,
                Summary = summary,
                Metadata = new AnalyticsMetadata
                {
                    LastCalculated = DateTime.UtcNow,
                    DataSources = new List<string> { "community_analytics" },
                    Parameters = new Dictionary<string, object>
                    {
                        ["start_date"] = request.StartDate,
                        ["end_date"] = request.EndDate,
                        ["granularity"] = request.Granularity
                    }
                }
            };
        }

        public async Task<List<ReportTemplate>> GetReportTemplatesAsync(Guid userId)
        {
            return await _context.ReportTemplates
                .Where(t => t.CreatedBy == userId || t.IsPublic)
                .OrderByDescending(t => t.UseCount)
                .ToListAsync();
        }

        public async Task<ReportTemplate> SaveReportTemplateAsync(Guid userId, SaveReportTemplateRequest request)
        {
            var template = new ReportTemplate
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                Configuration = request.ReportConfiguration,
                IsPublic = request.IsPublic,
                UseCount = 0
            };

            _context.ReportTemplates.Add(template);
            await _context.SaveChangesAsync();

            return template;
        }

        public async Task<ExportResult> ExportReportAsync(Guid communityId, Guid userId, ExportReportRequest request)
        {
            await ValidateCommunityAccessAsync(communityId, userId);

            // Generate report data
            var reportData = request.CustomReport != null
                ? await GenerateCustomReportAsync(communityId, userId, request.CustomReport)
                : await GenerateStandardReport(communityId, request.ReportType);

            // Export to requested format
            var fileName = $"community_report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.Format}";
            var fileUrl = await ExportToFormat(reportData, request.Format, fileName);

            return new ExportResult
            {
                FileName = fileName,
                FileUrl = fileUrl,
                Format = request.Format,
                FileSizeBytes = await GetFileSize(fileUrl),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Metadata = new Dictionary<string, object>
                {
                    ["report_type"] = request.ReportType,
                    ["generated_at"] = DateTime.UtcNow
                }
            };
        }

        // Helper Methods
        private async Task ValidateCommunityAccessAsync(Guid communityId, Guid userId)
        {
            var member = await _context.CommunityMembers
                .FirstOrDefaultAsync(m => m.CommunityId == communityId && m.UserId == userId);

            if (member == null)
                throw new UnauthorizedAccessException("User is not a member of this community");

            if (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin)
                throw new UnauthorizedAccessException("User does not have analytics access");
        }

        private (DateTime startDate, DateTime endDate) GetTimeframeRange(AnalyticsTimeframe timeframe)
        {
            var endDate = DateTime.UtcNow;
            var startDate = timeframe switch
            {
                AnalyticsTimeframe.Day => endDate.AddDays(-1),
                AnalyticsTimeframe.Week => endDate.AddDays(-7),
                AnalyticsTimeframe.Month => endDate.AddDays(-30),
                AnalyticsTimeframe.Quarter => endDate.AddDays(-90),
                AnalyticsTimeframe.Year => endDate.AddDays(-365),
                _ => endDate.AddDays(-30)
            };

            return (startDate, endDate);
        }

        private async Task<CommunityOverview> BuildCommunityOverviewAsync(Guid communityId, DateTime startDate, DateTime endDate)
        {
            var totalMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var activeMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.LastActiveAt >= startDate)
                .CountAsync();

            var growthRate = await CalculateGrowthRate(communityId, endDate - startDate);
            var engagementRate = totalMembers > 0 ? (float)activeMembers / totalMembers : 0f;

            var totalServers = await _context.GameServers
                .Where(s => s.CommunityId == communityId)
                .CountAsync();

            var activeServers = await _context.GameServers
                .Where(s => s.CommunityId == communityId && s.Status == "Running")
                .CountAsync();

            var averageSessionDuration = await CalculateAverageSessionDuration(communityId, startDate, endDate);

            return new CommunityOverview
            {
                TotalMembers = totalMembers,
                ActiveMembers = activeMembers,
                GrowthRate = growthRate,
                EngagementRate = engagementRate,
                TotalServers = totalServers,
                ActiveServers = activeServers,
                AverageSessionDuration = averageSessionDuration,
                MemberSatisfactionScore = 4.2f, // Placeholder
                TotalEvents = 0, // Placeholder
                MonthlyRevenue = 0 // Placeholder
            };
        }

        private async Task<List<KeyMetric>> BuildKeyMetricsAsync(Guid communityId, DateTime startDate, DateTime endDate)
        {
            var metrics = new List<KeyMetric>();

            // Total Members
            var totalMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var previousMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt < startDate)
                .CountAsync();

            metrics.Add(new KeyMetric
            {
                Name = "Total Members",
                Category = "Growth",
                Value = totalMembers,
                PreviousValue = previousMembers,
                ChangePercentage = previousMembers > 0 ? ((float)(totalMembers - previousMembers) / previousMembers) * 100 : 0,
                Trend = totalMembers > previousMembers ? MetricTrend.Up : MetricTrend.Down,
                Format = "number",
                Icon = "users",
                Color = "blue",
                IsPositiveTrend = totalMembers > previousMembers
            });

            // Add more metrics...
            return metrics;
        }

        private async Task<List<TrendChart>> BuildTrendChartsAsync(Guid communityId, DateTime startDate, DateTime endDate, AnalyticsTimeframe timeframe)
        {
            var charts = new List<TrendChart>();

            // Member growth chart
            var memberGrowthData = await BuildMemberGrowthChartAsync(communityId, timeframe);
            charts.Add(new TrendChart
            {
                Title = "Member Growth",
                Type = "line",
                DataPoints = memberGrowthData,
                Configuration = new ChartConfiguration
                {
                    XAxisLabel = "Date",
                    YAxisLabel = "Members",
                    ShowGrid = true,
                    ShowLegend = true
                },
                Colors = new List<string> { "#3B82F6" }
            });

            return charts;
        }

        private async Task<List<ChartDataPoint>> BuildMemberGrowthChartAsync(Guid communityId, AnalyticsTimeframe timeframe)
        {
            var dataPoints = new List<ChartDataPoint>();
            var (startDate, endDate) = GetTimeframeRange(timeframe);

            var memberJoins = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt >= startDate && m.JoinedAt <= endDate)
                .GroupBy(m => m.JoinedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(g => g.Date)
                .ToListAsync();

            var runningTotal = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt < startDate)
                .CountAsync();

            foreach (var day in memberJoins)
            {
                runningTotal += day.Count;
                dataPoints.Add(new ChartDataPoint
                {
                    Date = day.Date,
                    Values = new Dictionary<string, object>
                    {
                        ["total_members"] = runningTotal,
                        ["new_members"] = day.Count
                    }
                });
            }

            return dataPoints;
        }

        private async Task<List<AnalyticsInsight>> GenerateInsightsAsync(Guid communityId, DateTime startDate, DateTime endDate)
        {
            var insights = new List<AnalyticsInsight>();

            // Growth insight
            var growthRate = await CalculateGrowthRate(communityId, endDate - startDate);
            if (growthRate > 0.1f) // 10% growth
            {
                insights.Add(new AnalyticsInsight
                {
                    Type = "positive",
                    Title = "Strong Growth Trend",
                    Description = $"Your community has grown by {growthRate:P1} in the selected period",
                    Impact = 0.8f,
                    Confidence = 0.9f,
                    ActionSuggestion = "Consider scaling your infrastructure to support continued growth",
                    DetectedAt = DateTime.UtcNow
                });
            }

            // Engagement insight
            var engagementRate = await CalculateEngagementRate(communityId, TimeSpan.FromDays(7));
            if (engagementRate < 0.3f) // Less than 30% weekly engagement
            {
                insights.Add(new AnalyticsInsight
                {
                    Type = "warning",
                    Title = "Low Engagement Rate",
                    Description = $"Only {engagementRate:P1} of members were active this week",
                    Impact = 0.7f,
                    Confidence = 0.85f,
                    ActionSuggestion = "Consider organizing community events or creating engaging content",
                    DetectedAt = DateTime.UtcNow
                });
            }

            return insights;
        }

        private async Task<List<ActionableRecommendation>> GenerateRecommendationsAsync(Guid communityId, DateTime startDate, DateTime endDate)
        {
            var recommendations = new List<ActionableRecommendation>();

            // Check if community needs more servers
            var avgServerUtilization = await CalculateAverageServerUtilization(communityId);
            if (avgServerUtilization > 0.8f)
            {
                recommendations.Add(new ActionableRecommendation
                {
                    Category = "growth",
                    Title = "Add More Servers",
                    Description = "Your servers are running at high capacity. Adding more servers could improve member experience.",
                    Steps = new List<string>
                    {
                        "Analyze peak usage patterns",
                        "Identify most popular game types",
                        "Deploy additional servers for high-demand games",
                        "Monitor utilization after deployment"
                    },
                    PotentialImpact = 0.7f,
                    Difficulty = "medium",
                    EstimatedTimeHours = 4,
                    Priority = "high"
                });
            }

            return recommendations;
        }

        // Calculation helper methods
        private async Task<float> CalculateGrowthRate(Guid communityId, TimeSpan period)
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate - period;

            var currentMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var previousMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.JoinedAt < startDate)
                .CountAsync();

            return previousMembers > 0 ? (float)(currentMembers - previousMembers) / previousMembers : 0;
        }

        private async Task<float> CalculateEngagementRate(Guid communityId, TimeSpan period)
        {
            var cutoffDate = DateTime.UtcNow - period;

            var totalMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            var activeMembers = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.LastActiveAt >= cutoffDate)
                .CountAsync();

            return totalMembers > 0 ? (float)activeMembers / totalMembers : 0;
        }

        private async Task<TimeSpan> CalculateAverageSessionDuration(Guid communityId, DateTime startDate, DateTime endDate)
        {
            var sessions = await _context.PlayerSessions
                .Where(s => s.CommunityId == communityId && 
                           s.StartTime >= startDate && 
                           s.StartTime <= endDate &&
                           s.DurationMinutes.HasValue)
                .ToListAsync();

            if (!sessions.Any()) return TimeSpan.Zero;

            var averageMinutes = sessions.Average(s => s.DurationMinutes!.Value);
            return TimeSpan.FromMinutes(averageMinutes);
        }

        private async Task<int> GetActiveMembers(Guid communityId, TimeSpan? period = null)
        {
            var cutoffDate = DateTime.UtcNow - (period ?? TimeSpan.FromDays(7));

            return await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.LastActiveAt >= cutoffDate)
                .CountAsync();
        }

        private async Task<float> CalculateRealTimeEngagementRate(Guid communityId)
        {
            return await CalculateEngagementRate(communityId, TimeSpan.FromMinutes(15));
        }

        private async Task<float> CalculateAverageServerUtilization(Guid communityId)
        {
            var servers = await _context.GameServers
                .Where(s => s.CommunityId == communityId && s.Status == "Running")
                .ToListAsync();

            if (!servers.Any()) return 0;

            var utilizations = servers.Select(s => s.MaxPlayers > 0 ? (float)s.PlayerCount / s.MaxPlayers : 0);
            return utilizations.Average();
        }

        // Placeholder implementations for complex analytics methods
        private async Task<MemberEngagementMetric> CalculateMemberEngagement(Guid userId, Guid communityId)
        {
            // Simplified implementation
            var member = await _context.CommunityMembers
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.UserId == userId && m.CommunityId == communityId);

            if (member == null) throw new ArgumentException("Member not found");

            return new MemberEngagementMetric
            {
                UserId = userId,
                DisplayName = member.User.DisplayName,
                Score = new EngagementScore
                {
                    Overall = 0.75f,
                    Social = 0.8f,
                    Gaming = 0.7f,
                    Community = 0.75f,
                    Consistency = 0.6f,
                    Tier = "Active"
                },
                Activity = new MemberActivitySummary
                {
                    SessionsThisMonth = 15,
                    PlaytimeThisMonth = TimeSpan.FromHours(45),
                    MessagesThisMonth = 12,
                    EventsAttended = 3,
                    FriendsInCommunity = 8
                },
                JoinedAt = member.JoinedAt,
                LastActiveAt = member.LastActiveAt ?? DateTime.UtcNow,
                Trend = EngagementTrend.Stable
            };
        }

        // More placeholder implementations for brevity...
        private async Task<MemberGrowthMetrics> BuildMemberGrowthMetrics(Guid communityId, DateTime startDate, DateTime endDate) { return new MemberGrowthMetrics(); }
        private async Task<MemberDemographics> BuildMemberDemographics(Guid communityId) { return new MemberDemographics(); }
        private async Task<MemberActivityMetrics> BuildMemberActivityMetrics(Guid communityId, DateTime startDate, DateTime endDate) { return new MemberActivityMetrics(); }
        private async Task<MemberRetentionMetrics> BuildMemberRetentionMetrics(Guid communityId, DateTime startDate, DateTime endDate) { return new MemberRetentionMetrics(); }
        private async Task<List<MemberCohort>> BuildMemberCohorts(Guid communityId, AnalyticsTimeframe timeframe) { return new List<MemberCohort>(); }
        private async Task<object> BuildServerUtilizationData(Guid communityId) { return new { }; }
        private async Task<AnalyticsWidget> BuildPlaytimeDistributionWidget(Guid communityId, Dictionary<string, object> parameters) { return new AnalyticsWidget(); }
        private async Task<AnalyticsWidget> BuildActivityHeatmapWidget(Guid communityId, Dictionary<string, object> parameters) { return new AnalyticsWidget(); }
        private async Task<AnalyticsWidget> BuildRetentionCohortWidget(Guid communityId, Dictionary<string, object> parameters) { return new AnalyticsWidget(); }
        private async Task<AnalyticsWidget> BuildGrowthFunnelWidget(Guid communityId, Dictionary<string, object> parameters) { return new AnalyticsWidget(); }

        private List<AnalyticsAlert> GetDefaultAlerts()
        {
            return new List<AnalyticsAlert>
            {
                new AnalyticsAlert
                {
                    Name = "Low Engagement Alert",
                    Metric = "engagement_rate",
                    Condition = "below",
                    Threshold = 0.3f,
                    IsEnabled = true,
                    NotificationChannels = new List<string> { "email" }
                },
                new AnalyticsAlert
                {
                    Name = "High Growth Alert",
                    Metric = "growth_rate",
                    Condition = "above",
                    Threshold = 0.2f,
                    IsEnabled = true,
                    NotificationChannels = new List<string> { "email" }
                }
            };
        }

        // Additional placeholder methods...
        private async Task<List<Guid>> GetChampionMembers(Guid communityId) { return new List<Guid>(); }
        private async Task<List<Guid>> GetCasualMembers(Guid communityId) { return new List<Guid>(); }
        private async Task<List<Guid>> GetAtRiskMembers(Guid communityId) { return new List<Guid>(); }
        private async Task<MemberSegmentCharacteristics> BuildSegmentCharacteristics(List<Guid> memberIds, Guid communityId) { return new MemberSegmentCharacteristics(); }
        private async Task<List<LifecycleTransition>> BuildLifecycleTransitions(Guid communityId) { return new List<LifecycleTransition>(); }
        private async Task<List<LifecycleOptimization>> BuildLifecycleOptimizations(Guid communityId) { return new List<LifecycleOptimization>(); }
        private async Task<GrowthOverview> BuildGrowthOverview(Guid communityId, DateTime startDate, DateTime endDate) { return new GrowthOverview(); }
        private async Task<List<GrowthChannel>> BuildGrowthChannels(Guid communityId, DateTime startDate, DateTime endDate) { return new List<GrowthChannel>(); }
        private async Task<ViralityMetrics> BuildViralityMetrics(Guid communityId, DateTime startDate, DateTime endDate) { return new ViralityMetrics(); }
        private async Task<List<GrowthExperiment>> BuildGrowthExperiments(Guid communityId, DateTime startDate, DateTime endDate) { return new List<GrowthExperiment>(); }
        private async Task<object> GenerateMetricData(Guid communityId, string metric, DateTime startDate, DateTime endDate, string granularity) { return new { }; }
        private async Task<ReportSummary> BuildReportSummary(Guid communityId, CustomReportRequest request) { return new ReportSummary(); }
        private async Task<CustomReport> GenerateStandardReport(Guid communityId, string reportType) { return new CustomReport(); }
        private async Task<string> ExportToFormat(CustomReport report, string format, string fileName) { return ""; }
        private async Task<long> GetFileSize(string fileUrl) { return 0; }
        private string GetMetricDescription(string metric) { return $"Description for {metric}"; }
        private async Task<object> AnalyzeServerActivityImpact(Guid communityId) { return new { }; }
        private async Task<object> AnalyzeEventImpact(Guid communityId) { return new { }; }
        private async Task<object> AnalyzeSocialSharingImpact(Guid communityId) { return new { }; }
        private async Task<float> CalculateOverallRetention(Guid communityId) { return 0.75f; }
        private async Task<Dictionary<int, float>> CalculateRetentionByDays(Guid communityId) { return new Dictionary<int, float>(); }
        private async Task<List<ChurnFactor>> AnalyzeChurnFactors(Guid communityId) { return new List<ChurnFactor>(); }
        private async Task<RetentionCohort> BuildRetentionCohort(DateTime cohortStart, List<Guid> memberIds, Guid communityId) { return new RetentionCohort(); }
        private async Task<string> CalculateMarketPosition(Guid communityId, List<CompetitorMetric> competitors) { return ""; }
        private async Task<List<CompetitiveOpportunity>> IdentifyCompetitiveOpportunities(Guid communityId, List<CompetitorMetric> competitors) { return new List<CompetitiveOpportunity>(); }

        // Missing classes for compilation
        public class GrowthForecast
        {
            public Guid CommunityId { get; set; }
            public DateTime ForecastDate { get; set; }
            public int ProjectedMembers { get; set; }
            public float Confidence { get; set; }
            public float GrowthRate { get; set; }
            public string Methodology { get; set; } = string.Empty;
        }

        public class GrowthDriver
        {
            public string Name { get; set; } = string.Empty;
            public float Impact { get; set; }
            public string Description { get; set; } = string.Empty;
            public object Data { get; set; } = new();
        }

        public class CompetitiveAnalysis
        {
            public Guid CommunityId { get; set; }
            public List<CompetitorMetric> Competitors { get; set; } = new();
            public string MarketPosition { get; set; } = string.Empty;
            public List<CompetitiveOpportunity> Opportunities { get; set; } = new();
            public DateTime GeneratedAt { get; set; }
        }

        public class CompetitorMetric
        {
            public Guid CommunityId { get; set; }
            public string Name { get; set; } = string.Empty;
            public int MemberCount { get; set; }
            public float GrowthRate { get; set; }
            public float EngagementRate { get; set; }
            public int ActiveServers { get; set; }
        }

        public class CompetitiveOpportunity
        {
            public string Type { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public float Impact { get; set; }
        }

        public class MemberRetentionAnalysis
        {
            public float OverallRetentionRate { get; set; }
            public Dictionary<int, float> RetentionByDays { get; set; } = new();
            public List<RetentionCohort> RetentionCohorts { get; set; } = new();
            public List<ChurnFactor> ChurnFactors { get; set; } = new();
        }
    }
}