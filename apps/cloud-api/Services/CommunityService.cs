using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace HomeHost.CloudApi.Services
{
    public class CommunityService : ICommunityService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CommunityService> _logger;

        public CommunityService(ApplicationDbContext context, ILogger<CommunityService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Community Profile Management
        public async Task<Community> CreateCommunityAsync(CreateCommunityRequest request, Guid ownerId)
        {
            var slug = await GenerateUniqueSlugAsync(request.Name);
            
            var community = new Community
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Slug = slug,
                Description = request.Description,
                LogoUrl = request.LogoUrl,
                BannerUrl = request.BannerUrl,
                IsPublic = request.IsPublic,
                OwnerId = ownerId,
                Tags = request.Tags,
                Settings = request.Settings ?? new CommunitySettings(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Communities.Add(community);
            
            // Add owner as admin member
            var ownerMember = new CommunityMember
            {
                Id = Guid.NewGuid(),
                CommunityId = community.Id,
                UserId = ownerId,
                Role = CommunityRole.Owner,
                JoinedAt = DateTime.UtcNow,
                LastActiveAt = DateTime.UtcNow
            };

            _context.CommunityMembers.Add(ownerMember);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Community created: {CommunityId} by user {UserId}", community.Id, ownerId);
            return community;
        }

        public async Task<Community?> GetCommunityAsync(Guid communityId)
        {
            return await _context.Communities
                .Include(c => c.Owner)
                .Include(c => c.Members)
                .ThenInclude(m => m.User)
                .Include(c => c.Servers)
                .FirstOrDefaultAsync(c => c.Id == communityId);
        }

        public async Task<Community?> GetCommunityBySlugAsync(string slug)
        {
            return await _context.Communities
                .Include(c => c.Owner)
                .Include(c => c.Members)
                .ThenInclude(m => m.User)
                .Include(c => c.Servers)
                .FirstOrDefaultAsync(c => c.Slug == slug);
        }

        public async Task<List<Community>> GetUserCommunitiesAsync(Guid userId)
        {
            return await _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.Members.Any(m => m.UserId == userId))
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Community> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequest request, Guid userId)
        {
            var community = await GetCommunityAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Name))
                community.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Description))
                community.Description = request.Description;
            if (request.LogoUrl != null)
                community.LogoUrl = request.LogoUrl;
            if (request.BannerUrl != null)
                community.BannerUrl = request.BannerUrl;
            if (request.IsPublic.HasValue)
                community.IsPublic = request.IsPublic.Value;
            if (request.Tags != null)
                community.Tags = request.Tags;

            community.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return community;
        }

        public async Task<bool> DeleteCommunityAsync(Guid communityId, Guid userId)
        {
            var community = await GetCommunityAsync(communityId);
            if (community == null)
                return false;

            if (community.OwnerId != userId)
                throw new UnauthorizedAccessException("Only the owner can delete a community");

            _context.Communities.Remove(community);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Community deleted: {CommunityId} by user {UserId}", communityId, userId);
            return true;
        }

        // Community Discovery
        public async Task<List<Community>> SearchCommunitiesAsync(CommunitySearchRequest request)
        {
            var query = _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic);

            // Apply search filters
            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(c => c.Name.Contains(request.Query) || 
                                       c.Description.Contains(request.Query) ||
                                       c.Tags.Any(t => t.Contains(request.Query)));
            }

            if (request.Tags.Any())
            {
                query = query.Where(c => c.Tags.Any(t => request.Tags.Contains(t)));
            }

            if (request.JoinRequirement.HasValue)
            {
                query = query.Where(c => c.Settings.JoinRequirement == request.JoinRequirement.Value);
            }

            if (request.MinMembers.HasValue)
            {
                query = query.Where(c => c.MemberCount >= request.MinMembers.Value);
            }

            if (request.MaxMembers.HasValue)
            {
                query = query.Where(c => c.MemberCount <= request.MaxMembers.Value);
            }

            // Apply sorting
            query = request.SortBy switch
            {
                "newest" => query.OrderByDescending(c => c.CreatedAt),
                "members" => query.OrderByDescending(c => c.MemberCount),
                "activity" => query.OrderByDescending(c => c.Stats.LastActivity),
                _ => query.OrderByDescending(c => c.MemberCount) // Default to popular
            };

            return await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();
        }

        public async Task<List<Community>> GetTrendingCommunitiesAsync(int limit = 10)
        {
            // Communities with high recent activity and growth
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            
            return await _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic && c.CreatedAt >= oneWeekAgo)
                .OrderByDescending(c => c.MemberCount)
                .ThenByDescending(c => c.Stats.LastActivity)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Community>> GetRecommendedCommunitiesAsync(Guid userId, int limit = 10)
        {
            // Get user's current communities to find similar ones
            var userCommunities = await GetUserCommunitiesAsync(userId);
            var userTags = userCommunities.SelectMany(c => c.Tags).Distinct().ToList();

            return await _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic && 
                           !c.Members.Any(m => m.UserId == userId) &&
                           c.Tags.Any(t => userTags.Contains(t)))
                .OrderByDescending(c => c.MemberCount)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Community>> GetPopularCommunitiesAsync(int limit = 10)
        {
            return await _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic)
                .OrderByDescending(c => c.MemberCount)
                .ThenByDescending(c => c.Stats.AverageRating)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<CommunitySearchResults> GetCommunitiesByGameAsync(string gameId, int page = 1, int pageSize = 20)
        {
            var query = _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic && c.Settings.AllowedGames.Contains(gameId));

            var totalCount = await query.CountAsync();
            var communities = await query
                .OrderByDescending(c => c.MemberCount)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new CommunitySearchResults
            {
                Communities = communities,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                AppliedFilters = new List<CommunityFilter>
                {
                    new CommunityFilter { Type = "game", Value = gameId, DisplayName = $"Game: {gameId}" }
                }
            };
        }

        // Member Management
        public async Task<CommunityMember> JoinCommunityAsync(Guid communityId, Guid userId, JoinCommunityRequest? request = null)
        {
            var community = await GetCommunityAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var existingMember = await GetCommunityMemberAsync(communityId, userId);
            if (existingMember != null)
                throw new InvalidOperationException("User is already a member");

            // Check join requirements
            if (community.Settings.JoinRequirement == JoinRequirement.InviteOnly)
            {
                if (request?.InviteCode == null)
                    throw new UnauthorizedAccessException("Invite code required");
                
                var invitation = await GetInvitationAsync(request.InviteCode);
                if (invitation == null || invitation.CommunityId != communityId || !invitation.IsActive)
                    throw new UnauthorizedAccessException("Invalid or expired invite code");
            }

            var member = new CommunityMember
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                UserId = userId,
                Role = CommunityRole.Member,
                JoinedAt = DateTime.UtcNow,
                LastActiveAt = DateTime.UtcNow,
                ApplicationMessage = request?.ApplicationMessage
            };

            _context.CommunityMembers.Add(member);
            
            // Update member count
            community.MemberCount++;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} joined community {CommunityId}", userId, communityId);
            return member;
        }

        public async Task<bool> LeaveCommunityAsync(Guid communityId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null)
                return false;

            if (member.Role == CommunityRole.Owner)
                throw new InvalidOperationException("Owner cannot leave community");

            _context.CommunityMembers.Remove(member);
            
            // Update member count
            var community = await GetCommunityAsync(communityId);
            if (community != null)
            {
                community.MemberCount--;
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User {UserId} left community {CommunityId}", userId, communityId);
            return true;
        }

        public async Task<List<CommunityMember>> GetCommunityMembersAsync(Guid communityId, int page = 1, int pageSize = 50)
        {
            return await _context.CommunityMembers
                .Include(m => m.User)
                .Where(m => m.CommunityId == communityId)
                .OrderBy(m => m.Role)
                .ThenBy(m => m.JoinedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<CommunityMember?> GetCommunityMemberAsync(Guid communityId, Guid userId)
        {
            return await _context.CommunityMembers
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.CommunityId == communityId && m.UserId == userId);
        }

        public async Task<CommunityMember> UpdateMemberRoleAsync(Guid communityId, Guid userId, CommunityRole role, Guid adminUserId)
        {
            var adminMember = await GetCommunityMemberAsync(communityId, adminUserId);
            if (adminMember == null || (adminMember.Role != CommunityRole.Owner && adminMember.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null)
                throw new ArgumentException("Member not found");

            if (member.Role == CommunityRole.Owner)
                throw new InvalidOperationException("Cannot change owner role");

            member.Role = role;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} role updated to {Role} in community {CommunityId} by {AdminUserId}", 
                userId, role, communityId, adminUserId);
            return member;
        }

        public async Task<bool> RemoveMemberAsync(Guid communityId, Guid userId, Guid adminUserId)
        {
            var adminMember = await GetCommunityMemberAsync(communityId, adminUserId);
            if (adminMember == null || (adminMember.Role != CommunityRole.Owner && adminMember.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null)
                return false;

            if (member.Role == CommunityRole.Owner)
                throw new InvalidOperationException("Cannot remove owner");

            _context.CommunityMembers.Remove(member);
            
            // Update member count
            var community = await GetCommunityAsync(communityId);
            if (community != null)
            {
                community.MemberCount--;
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User {UserId} removed from community {CommunityId} by {AdminUserId}", 
                userId, communityId, adminUserId);
            return true;
        }

        // Server Association
        public async Task<bool> AddServerToCommunityAsync(Guid communityId, Guid serverId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var server = await _context.GameServers.FindAsync(serverId);
            if (server == null)
                throw new ArgumentException("Server not found");

            server.CommunityId = communityId;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveServerFromCommunityAsync(Guid communityId, Guid serverId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var server = await _context.GameServers.FindAsync(serverId);
            if (server == null || server.CommunityId != communityId)
                return false;

            server.CommunityId = null;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<GameServer>> GetCommunityServersAsync(Guid communityId)
        {
            return await _context.GameServers
                .Where(s => s.CommunityId == communityId)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        // Community Analytics
        public async Task<CommunityAnalytics> GetCommunityAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var analytics = new CommunityAnalytics
            {
                CommunityId = communityId,
                StartDate = start,
                EndDate = end,
                NewMembers = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.JoinedAt >= start && m.JoinedAt <= end)
                    .CountAsync(),
                ActiveMembers = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.LastActiveAt >= start)
                    .CountAsync(),
                LostMembers = 0, // TODO: Track member departures
                TotalSessions = 0, // TODO: Track session data
                AverageSessionDuration = TimeSpan.Zero, // TODO: Calculate from session data
                GrowthRate = 0.0f, // TODO: Calculate growth rate
                RetentionRate = 0.0f // TODO: Calculate retention rate
            };

            return analytics;
        }

        public async Task<CommunityGrowthMetrics> GetGrowthMetricsAsync(Guid communityId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var community = await GetCommunityAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var today = DateTime.UtcNow.Date;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddDays(-30);

            var metrics = new CommunityGrowthMetrics
            {
                CommunityId = communityId,
                TotalMembers = community.MemberCount,
                NewMembersToday = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.JoinedAt >= today)
                    .CountAsync(),
                NewMembersThisWeek = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.JoinedAt >= weekAgo)
                    .CountAsync(),
                NewMembersThisMonth = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.JoinedAt >= monthAgo)
                    .CountAsync(),
                WeeklyGrowthRate = 0.0f, // TODO: Calculate from historical data
                MonthlyGrowthRate = 0.0f, // TODO: Calculate from historical data
                ChurnedMembersThisMonth = 0, // TODO: Track departures
                RetentionRate = 0.0f // TODO: Calculate retention
            };

            return metrics;
        }

        public async Task<List<CommunityInsight>> GetCommunityInsightsAsync(Guid communityId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var insights = new List<CommunityInsight>();

            // Generate insights based on community data
            var community = await GetCommunityAsync(communityId);
            if (community == null)
                return insights;

            // Low activity insight
            if (community.Stats.LastActivity < DateTime.UtcNow.AddDays(-7))
            {
                insights.Add(new CommunityInsight
                {
                    Type = "engagement_low",
                    Title = "Low Recent Activity",
                    Description = "Your community hasn't seen much activity in the past week. Consider organizing events or starting discussions.",
                    ActionText = "Plan Community Event",
                    Impact = 0.8f,
                    GeneratedAt = DateTime.UtcNow
                });
            }

            // Growth opportunity insight
            if (community.MemberCount < 10)
            {
                insights.Add(new CommunityInsight
                {
                    Type = "growth_opportunity",
                    Title = "Growth Opportunity",
                    Description = "Your community is still small. Consider inviting more friends or promoting on social media.",
                    ActionText = "Create Invite Links",
                    Impact = 0.9f,
                    GeneratedAt = DateTime.UtcNow
                });
            }

            return insights;
        }

        // Invitation System
        public async Task<CommunityInvitation> CreateInvitationAsync(Guid communityId, CreateInvitationRequest request, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null)
                throw new UnauthorizedAccessException("User is not a member of the community");

            var inviteCode = GenerateInviteCode();
            var invitation = new CommunityInvitation
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                CreatedByUserId = userId,
                InviteCode = inviteCode,
                Message = request.Message,
                MaxUses = request.MaxUses,
                ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };

            _context.CommunityInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            return invitation;
        }

        public async Task<CommunityInvitation?> GetInvitationAsync(string inviteCode)
        {
            return await _context.CommunityInvitations
                .Include(i => i.Community)
                .Include(i => i.CreatedBy)
                .FirstOrDefaultAsync(i => i.InviteCode == inviteCode && i.IsActive);
        }

        public async Task<CommunityMember> AcceptInvitationAsync(string inviteCode, Guid userId)
        {
            var invitation = await GetInvitationAsync(inviteCode);
            if (invitation == null || !invitation.IsActive)
                throw new ArgumentException("Invalid or expired invitation");

            if (invitation.ExpiresAt < DateTime.UtcNow)
                throw new ArgumentException("Invitation has expired");

            if (invitation.UsedCount >= invitation.MaxUses)
                throw new ArgumentException("Invitation has reached maximum uses");

            var member = await JoinCommunityAsync(invitation.CommunityId, userId, 
                new JoinCommunityRequest { InviteCode = inviteCode });

            // Update invitation usage
            invitation.UsedCount++;
            if (invitation.UsedCount >= invitation.MaxUses)
                invitation.IsActive = false;

            await _context.SaveChangesAsync();

            return member;
        }

        public async Task<bool> RevokeInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.CommunityInvitations.FindAsync(invitationId);
            if (invitation == null)
                return false;

            var member = await GetCommunityMemberAsync(invitation.CommunityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            invitation.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<CommunityInvitation>> GetCommunityInvitationsAsync(Guid communityId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            return await _context.CommunityInvitations
                .Include(i => i.CreatedBy)
                .Where(i => i.CommunityId == communityId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        // Community Settings
        public async Task<CommunitySettings> GetCommunitySettingsAsync(Guid communityId, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var community = await GetCommunityAsync(communityId);
            return community?.Settings ?? new CommunitySettings();
        }

        public async Task<CommunitySettings> UpdateCommunitySettingsAsync(Guid communityId, UpdateCommunitySettingsRequest request, Guid userId)
        {
            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null || (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var community = await GetCommunityAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var settings = community.Settings;

            // Update settings fields if provided
            if (request.JoinRequirement.HasValue)
                settings.JoinRequirement = request.JoinRequirement.Value;
            if (request.AllowedGames != null)
                settings.AllowedGames = request.AllowedGames;
            if (request.ModerationLevel.HasValue)
                settings.ModerationLevel = request.ModerationLevel.Value;
            if (request.MonetizationEnabled.HasValue)
                settings.MonetizationEnabled = request.MonetizationEnabled.Value;
            if (request.DiscordServerId != null)
                settings.DiscordServerId = request.DiscordServerId;
            if (request.DiscordInviteUrl != null)
                settings.DiscordInviteUrl = request.DiscordInviteUrl;
            if (request.RequireApplicationMessage.HasValue)
                settings.RequireApplicationMessage = request.RequireApplicationMessage.Value;
            if (request.WelcomeMessage != null)
                settings.WelcomeMessage = request.WelcomeMessage;
            if (request.Rules != null)
                settings.Rules = request.Rules;
            if (request.AllowServerSharing.HasValue)
                settings.AllowServerSharing = request.AllowServerSharing.Value;
            if (request.ShowMemberList.HasValue)
                settings.ShowMemberList = request.ShowMemberList.Value;

            community.Settings = settings;
            community.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return settings;
        }

        // Moderation
        public async Task<bool> BanMemberAsync(Guid communityId, Guid userId, BanMemberRequest request, Guid adminUserId)
        {
            var adminMember = await GetCommunityMemberAsync(communityId, adminUserId);
            if (adminMember == null || (adminMember.Role != CommunityRole.Owner && adminMember.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var member = await GetCommunityMemberAsync(communityId, userId);
            if (member == null)
                throw new ArgumentException("Member not found");

            if (member.Role == CommunityRole.Owner)
                throw new InvalidOperationException("Cannot ban owner");

            // Remove member
            _context.CommunityMembers.Remove(member);

            // Create ban record
            var ban = new CommunityBan
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                UserId = userId,
                BannedByUserId = adminUserId,
                Reason = request.Reason,
                BannedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt
            };

            _context.CommunityBans.Add(ban);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} banned from community {CommunityId} by {AdminUserId}", 
                userId, communityId, adminUserId);
            return true;
        }

        public async Task<bool> UnbanMemberAsync(Guid communityId, Guid userId, Guid adminUserId)
        {
            var adminMember = await GetCommunityMemberAsync(communityId, adminUserId);
            if (adminMember == null || (adminMember.Role != CommunityRole.Owner && adminMember.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            var ban = await _context.CommunityBans
                .FirstOrDefaultAsync(b => b.CommunityId == communityId && b.UserId == userId && b.IsActive);

            if (ban == null)
                return false;

            ban.IsActive = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} unbanned from community {CommunityId} by {AdminUserId}", 
                userId, communityId, adminUserId);
            return true;
        }

        public async Task<List<CommunityBan>> GetCommunityBansAsync(Guid communityId, Guid adminUserId)
        {
            var adminMember = await GetCommunityMemberAsync(communityId, adminUserId);
            if (adminMember == null || (adminMember.Role != CommunityRole.Owner && adminMember.Role != CommunityRole.Admin))
                throw new UnauthorizedAccessException("Insufficient permissions");

            return await _context.CommunityBans
                .Include(b => b.User)
                .Include(b => b.BannedBy)
                .Where(b => b.CommunityId == communityId && b.IsActive)
                .OrderByDescending(b => b.BannedAt)
                .ToListAsync();
        }

        // Public Profile Features
        public async Task<CommunityPublicProfile> GetPublicProfileAsync(Guid communityId)
        {
            var community = await GetCommunityAsync(communityId);
            if (community == null || !community.IsPublic)
                throw new ArgumentException("Community not found or not public");

            return await BuildPublicProfileAsync(community);
        }

        public async Task<CommunityPublicProfile> GetPublicProfileBySlugAsync(string slug)
        {
            var community = await GetCommunityBySlugAsync(slug);
            if (community == null || !community.IsPublic)
                throw new ArgumentException("Community not found or not public");

            return await BuildPublicProfileAsync(community);
        }

        public async Task<List<CommunityActivity>> GetCommunityActivityAsync(Guid communityId, int limit = 20)
        {
            return await _context.CommunityActivities
                .Where(a => a.CommunityId == communityId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<CommunityStats> GetCommunityStatsAsync(Guid communityId)
        {
            var community = await GetCommunityAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var stats = new CommunityStats
            {
                TotalMembers = community.MemberCount,
                OnlineMembers = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId && m.LastActiveAt >= DateTime.UtcNow.AddMinutes(-30))
                    .CountAsync(),
                ActiveServers = await _context.GameServers
                    .Where(s => s.CommunityId == communityId && s.Status == "Running")
                    .CountAsync(),
                TotalServers = await _context.GameServers
                    .Where(s => s.CommunityId == communityId)
                    .CountAsync(),
                TotalPlaytime = 0, // TODO: Calculate from session data
                PopularGames = community.Settings.AllowedGames.Take(5).ToList(),
                AverageRating = 0.0f, // TODO: Calculate from reviews
                ReviewCount = 0, // TODO: Count reviews
                LastActivity = await _context.CommunityMembers
                    .Where(m => m.CommunityId == communityId)
                    .MaxAsync(m => m.LastActiveAt)
            };

            return stats;
        }

        // Helper Methods
        private async Task<string> GenerateUniqueSlugAsync(string name)
        {
            var baseSlug = name.ToLower()
                .Replace(' ', '-')
                .Replace("'", "")
                .Replace("\"", "")
                .Replace(".", "")
                .Replace(",", "")
                .Replace("!", "")
                .Replace("?", "");

            var slug = baseSlug;
            var counter = 1;

            while (await _context.Communities.AnyAsync(c => c.Slug == slug))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private async Task<CommunityPublicProfile> BuildPublicProfileAsync(Community community)
        {
            var stats = await GetCommunityStatsAsync(community.Id);
            var featuredMembers = await _context.CommunityMembers
                .Include(m => m.User)
                .Where(m => m.CommunityId == community.Id)
                .OrderBy(m => m.Role)
                .ThenByDescending(m => m.ReputationScore)
                .Take(5)
                .Select(m => new CommunityMemberProfile
                {
                    UserId = m.UserId,
                    DisplayName = m.User.DisplayName,
                    Role = m.Role,
                    ReputationScore = m.ReputationScore,
                    JoinedAt = m.JoinedAt,
                    LastActiveAt = m.LastActiveAt
                })
                .ToListAsync();

            var featuredServers = await _context.GameServers
                .Where(s => s.CommunityId == community.Id)
                .OrderByDescending(s => s.PlayerCount)
                .Take(3)
                .Select(s => new CommunityServerInfo
                {
                    Id = s.Id,
                    Name = s.Name,
                    GameId = s.GameType,
                    GameName = s.GameType, // TODO: Get game name from game catalog
                    Status = s.Status,
                    CurrentPlayers = s.PlayerCount,
                    MaxPlayers = s.MaxPlayers
                })
                .ToListAsync();

            var recentActivity = await GetCommunityActivityAsync(community.Id, 10);

            return new CommunityPublicProfile
            {
                Id = community.Id,
                Name = community.Name,
                Slug = community.Slug,
                Description = community.Description,
                LogoUrl = community.LogoUrl,
                BannerUrl = community.BannerUrl,
                Tags = community.Tags,
                Stats = stats,
                FeaturedServers = featuredServers,
                FeaturedMembers = featuredMembers,
                RecentActivity = recentActivity,
                DiscordInviteUrl = community.Settings.DiscordInviteUrl,
                JoinRequirement = community.Settings.JoinRequirement,
                CanJoin = true, // TODO: Check if user can join based on requirements
                CreatedAt = community.CreatedAt
            };
        }
    }
}