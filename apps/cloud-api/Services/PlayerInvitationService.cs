using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Security.Cryptography;
using System.Text;

namespace HomeHost.CloudApi.Services
{
    public class PlayerInvitationService : IPlayerInvitationService
    {
        private readonly HomeHostContext _context;
        private readonly ICommunityService _communityService;
        private readonly IPlayerManagementService _playerService;
        private readonly ILogger<PlayerInvitationService> _logger;

        public PlayerInvitationService(
            HomeHostContext context,
            ICommunityService communityService,
            IPlayerManagementService playerService,
            ILogger<PlayerInvitationService> logger)
        {
            _context = context;
            _communityService = communityService;
            _playerService = playerService;
            _logger = logger;
        }

        // Community Invitations
        public async Task<CommunityInvitation> CreateCommunityInvitationAsync(Guid inviterId, CreateCommunityInvitationRequest request)
        {
            // Validate inviter has permission to invite to community
            await ValidateInviterPermissionsAsync(inviterId, request.CommunityId);

            // Check for existing invitation
            var existingInvitation = await _context.CommunityInvitations
                .FirstOrDefaultAsync(i => i.CommunityId == request.CommunityId &&
                    ((request.InviteeId.HasValue && i.InviteeId == request.InviteeId) ||
                     (!string.IsNullOrEmpty(request.InviteeEmail) && i.InviteeEmail == request.InviteeEmail) ||
                     (!string.IsNullOrEmpty(request.InviteeUsername) && i.InviteeUsername == request.InviteeUsername)) &&
                    i.Status == InvitationStatus.Pending);

            if (existingInvitation != null)
            {
                throw new InvalidOperationException("An invitation already exists for this user to this community");
            }

            var invitation = new CommunityInvitation
            {
                Id = Guid.NewGuid(),
                CommunityId = request.CommunityId,
                InviterId = inviterId,
                InviteeId = request.InviteeId,
                InviteeEmail = request.InviteeEmail,
                InviteeUsername = request.InviteeUsername,
                Type = InvitationType.Direct,
                Status = InvitationStatus.Pending,
                PersonalMessage = request.PersonalMessage,
                Permissions = request.Permissions,
                Metadata = new InvitationMetadata
                {
                    Source = "manual",
                    CustomData = request.Metadata
                },
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddDays(7)
            };

            _context.CommunityInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Send notification
            await SendInvitationNotificationAsync(invitation.Id, NotificationChannel.Email);

            _logger.LogInformation("Community invitation {InvitationId} created by {InviterId} for community {CommunityId}",
                invitation.Id, inviterId, request.CommunityId);

            return invitation;
        }

        public async Task<CommunityInvitation> GetCommunityInvitationAsync(Guid invitationId)
        {
            var invitation = await _context.CommunityInvitations
                .Include(i => i.Community)
                .Include(i => i.Inviter)
                .Include(i => i.Invitee)
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Invitation {invitationId} not found");
            }

            return invitation;
        }

        public async Task<List<CommunityInvitation>> GetCommunityInvitationsAsync(Guid communityId, InvitationStatus? status = null, int page = 1, int pageSize = 50)
        {
            var query = _context.CommunityInvitations
                .Include(i => i.Inviter)
                .Include(i => i.Invitee)
                .Where(i => i.CommunityId == communityId);

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            return await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<CommunityInvitation>> GetUserInvitationsAsync(Guid userId, InvitationStatus? status = null, int page = 1, int pageSize = 20)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            var query = _context.CommunityInvitations
                .Include(i => i.Community)
                .Include(i => i.Inviter)
                .Where(i => i.InviteeId == userId || i.InviteeEmail == user.Email || i.InviteeUsername == user.DisplayName);

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            return await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<CommunityInvitation> UpdateInvitationStatusAsync(Guid invitationId, Guid userId, InvitationAction action, string? message = null)
        {
            var invitation = await GetCommunityInvitationAsync(invitationId);

            // Validate user can perform this action
            if (action == InvitationAction.Revoke)
            {
                if (invitation.InviterId != userId)
                {
                    await ValidateInviterPermissionsAsync(userId, invitation.CommunityId);
                }
            }
            else
            {
                // Accepting/Declining - validate user is the invitee
                if (invitation.InviteeId != userId && invitation.InviteeEmail != await GetUserEmailAsync(userId))
                {
                    throw new UnauthorizedAccessException("User cannot perform this action on this invitation");
                }
            }

            switch (action)
            {
                case InvitationAction.Accept:
                    if (invitation.Status != InvitationStatus.Pending)
                        throw new InvalidOperationException("Cannot accept invitation with current status");

                    invitation.Status = InvitationStatus.Accepted;
                    invitation.AcceptedAt = DateTime.UtcNow;

                    // Add user to community
                    await _communityService.JoinCommunityAsync(invitation.CommunityId, userId);
                    break;

                case InvitationAction.Decline:
                    if (invitation.Status != InvitationStatus.Pending)
                        throw new InvalidOperationException("Cannot decline invitation with current status");

                    invitation.Status = InvitationStatus.Declined;
                    invitation.DeclinedAt = DateTime.UtcNow;
                    invitation.DeclineReason = message;
                    break;

                case InvitationAction.Revoke:
                    if (invitation.Status != InvitationStatus.Pending)
                        throw new InvalidOperationException("Cannot revoke invitation with current status");

                    invitation.Status = InvitationStatus.Revoked;
                    invitation.RevokedAt = DateTime.UtcNow;
                    invitation.RevokeReason = message;
                    break;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Invitation {InvitationId} {Action} by {UserId}", invitationId, action, userId);

            return invitation;
        }

        public async Task<bool> RevokeInvitationAsync(Guid invitationId, Guid revokerId)
        {
            await UpdateInvitationStatusAsync(invitationId, revokerId, InvitationAction.Revoke);
            return true;
        }

        public async Task<bool> ResendInvitationAsync(Guid invitationId, Guid senderId)
        {
            var invitation = await GetCommunityInvitationAsync(invitationId);

            if (invitation.InviterId != senderId)
            {
                await ValidateInviterPermissionsAsync(senderId, invitation.CommunityId);
            }

            if (invitation.Status != InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Cannot resend invitation with current status");
            }

            invitation.ResendCount++;
            invitation.LastResendAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await SendInvitationNotificationAsync(invitationId, NotificationChannel.Email);

            _logger.LogInformation("Invitation {InvitationId} resent by {SenderId}", invitationId, senderId);

            return true;
        }

        public async Task<InvitationLink> GenerateInvitationLinkAsync(Guid communityId, Guid creatorId, InvitationLinkSettings settings)
        {
            await ValidateInviterPermissionsAsync(creatorId, communityId);

            var inviteCode = GenerateInviteCode();

            var link = new InvitationLink
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                CreatorId = creatorId,
                InviteCode = inviteCode,
                DisplayName = $"Invite Link - {DateTime.UtcNow:yyyy-MM-dd}",
                Settings = settings,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = settings.ValidDuration.HasValue ? DateTime.UtcNow.Add(settings.ValidDuration.Value) : null
            };

            _context.InvitationLinks.Add(link);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Invitation link {InviteCode} created for community {CommunityId} by {CreatorId}",
                inviteCode, communityId, creatorId);

            return link;
        }

        public async Task<CommunityInvitation> AcceptInvitationByLinkAsync(string inviteCode, Guid userId)
        {
            var link = await _context.InvitationLinks
                .FirstOrDefaultAsync(l => l.InviteCode == inviteCode && l.IsActive);

            if (link == null)
            {
                throw new KeyNotFoundException("Invalid or expired invitation link");
            }

            // Validate link constraints
            if (link.ExpiresAt.HasValue && link.ExpiresAt.Value < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Invitation link has expired");
            }

            if (link.Settings.MaxUses.HasValue && link.Usage.TimesUsed >= link.Settings.MaxUses.Value)
            {
                throw new InvalidOperationException("Invitation link has reached maximum uses");
            }

            // Check if user is already in community
            var existingMember = await _context.CommunityMembers
                .FirstOrDefaultAsync(m => m.CommunityId == link.CommunityId && m.UserId == userId);

            if (existingMember != null)
            {
                throw new InvalidOperationException("User is already a member of this community");
            }

            // Record link usage
            link.Usage.TimesUsed++;
            link.Usage.LastUsed = DateTime.UtcNow;
            if (link.Usage.FirstUsed == null)
            {
                link.Usage.FirstUsed = DateTime.UtcNow;
            }

            var linkUse = new InvitationLinkUse
            {
                UserId = userId,
                UsedAt = DateTime.UtcNow,
                WasAccepted = true
            };
            link.Usage.RecentUses.Add(linkUse);

            // Create invitation record
            var invitation = new CommunityInvitation
            {
                Id = Guid.NewGuid(),
                CommunityId = link.CommunityId,
                InviterId = link.CreatorId,
                InviteeId = userId,
                Type = InvitationType.Link,
                Status = InvitationStatus.Accepted,
                CreatedAt = DateTime.UtcNow,
                AcceptedAt = DateTime.UtcNow,
                Metadata = new InvitationMetadata
                {
                    Source = "invitation_link",
                    CustomData = new Dictionary<string, object> { { "invite_code", inviteCode } }
                }
            };

            _context.CommunityInvitations.Add(invitation);

            // Add user to community
            await _communityService.JoinCommunityAsync(link.CommunityId, userId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} joined community {CommunityId} via invitation link {InviteCode}",
                userId, link.CommunityId, inviteCode);

            return invitation;
        }

        public async Task<bool> DeactivateInvitationLinkAsync(string inviteCode, Guid deactivatorId)
        {
            var link = await _context.InvitationLinks
                .FirstOrDefaultAsync(l => l.InviteCode == inviteCode);

            if (link == null)
            {
                throw new KeyNotFoundException("Invitation link not found");
            }

            await ValidateInviterPermissionsAsync(deactivatorId, link.CommunityId);

            link.IsActive = false;
            link.DeactivatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Invitation link {InviteCode} deactivated by {DeactivatorId}", inviteCode, deactivatorId);

            return true;
        }

        // Friend Invitations
        public async Task<FriendInvitation> SendFriendInvitationAsync(Guid senderId, Guid targetUserId, string? message = null)
        {
            if (senderId == targetUserId)
            {
                throw new InvalidOperationException("Cannot send friend invitation to yourself");
            }

            // Check for existing friendship or invitation
            var existingRelation = await _playerService.GetPlayerRelationshipAsync(senderId, targetUserId);
            if (existingRelation != null)
            {
                throw new InvalidOperationException("Relationship already exists with this user");
            }

            var existingInvitation = await _context.FriendInvitations
                .FirstOrDefaultAsync(i => (i.SenderId == senderId && i.TargetUserId == targetUserId) ||
                                         (i.SenderId == targetUserId && i.TargetUserId == senderId));

            if (existingInvitation != null && existingInvitation.Status == InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Friend invitation already exists");
            }

            var invitation = new FriendInvitation
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                TargetUserId = targetUserId,
                Status = InvitationStatus.Pending,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            _context.FriendInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            await SendInvitationNotificationAsync(invitation.Id, NotificationChannel.InApp);

            _logger.LogInformation("Friend invitation sent from {SenderId} to {TargetUserId}", senderId, targetUserId);

            return invitation;
        }

        public async Task<List<FriendInvitation>> GetFriendInvitationsAsync(Guid userId, InvitationDirection direction, InvitationStatus? status = null)
        {
            var query = _context.FriendInvitations
                .Include(i => i.Sender)
                .Include(i => i.TargetUser)
                .AsQueryable();

            query = direction switch
            {
                InvitationDirection.Sent => query.Where(i => i.SenderId == userId),
                InvitationDirection.Received => query.Where(i => i.TargetUserId == userId),
                _ => query.Where(i => i.SenderId == userId || i.TargetUserId == userId)
            };

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        }

        public async Task<FriendInvitation> RespondToFriendInvitationAsync(Guid invitationId, Guid userId, InvitationAction action)
        {
            var invitation = await _context.FriendInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException("Friend invitation not found");
            }

            if (invitation.TargetUserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot respond to this invitation");
            }

            if (invitation.Status != InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Invitation has already been responded to");
            }

            switch (action)
            {
                case InvitationAction.Accept:
                    invitation.Status = InvitationStatus.Accepted;
                    invitation.AcceptedAt = DateTime.UtcNow;

                    // Create friendship
                    await _playerService.CreatePlayerRelationshipAsync(invitation.SenderId, invitation.TargetUserId, new CreatePlayerRelationshipRequest
                    {
                        Type = PlayerRelationshipType.Friend,
                        Notes = "Friend invitation accepted"
                    });
                    break;

                case InvitationAction.Decline:
                    invitation.Status = InvitationStatus.Declined;
                    invitation.DeclinedAt = DateTime.UtcNow;
                    break;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Friend invitation {InvitationId} {Action} by {UserId}", invitationId, action, userId);

            return invitation;
        }

        public async Task<bool> CancelFriendInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.FriendInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException("Friend invitation not found");
            }

            if (invitation.SenderId != userId)
            {
                throw new UnauthorizedAccessException("Cannot cancel this invitation");
            }

            if (invitation.Status != InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Cannot cancel invitation with current status");
            }

            invitation.Status = InvitationStatus.Revoked;
            invitation.DeclinedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Friend invitation {InvitationId} cancelled by {UserId}", invitationId, userId);

            return true;
        }

        // Server Invitations
        public async Task<ServerInvitation> CreateServerInvitationAsync(Guid inviterId, CreateServerInvitationRequest request)
        {
            // Validate inviter has permission to invite to server
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == request.ServerId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            // Check if user is already on server
            // This would depend on your server member tracking implementation

            var invitation = new ServerInvitation
            {
                Id = Guid.NewGuid(),
                ServerId = request.ServerId,
                InviterId = inviterId,
                InviteeId = request.InviteeId,
                Status = InvitationStatus.Pending,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServerInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            await SendInvitationNotificationAsync(invitation.Id, NotificationChannel.InApp);

            _logger.LogInformation("Server invitation {InvitationId} created for server {ServerId}", invitation.Id, request.ServerId);

            return invitation;
        }

        public async Task<List<ServerInvitation>> GetServerInvitationsAsync(Guid serverId, InvitationStatus? status = null)
        {
            var query = _context.ServerInvitations
                .Include(i => i.Inviter)
                .Include(i => i.Invitee)
                .Where(i => i.ServerId == serverId);

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        }

        public async Task<ServerInvitation> AcceptServerInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.ServerInvitations
                .Include(i => i.Server)
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException("Server invitation not found");
            }

            if (invitation.InviteeId != userId)
            {
                throw new UnauthorizedAccessException("Cannot accept this invitation");
            }

            if (invitation.Status != InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Invitation has already been responded to");
            }

            invitation.Status = InvitationStatus.Accepted;
            invitation.AcceptedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Server invitation {InvitationId} accepted by {UserId}", invitationId, userId);

            return invitation;
        }

        public async Task<bool> DeclineServerInvitationAsync(Guid invitationId, Guid userId, string? reason = null)
        {
            var invitation = await _context.ServerInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException("Server invitation not found");
            }

            if (invitation.InviteeId != userId)
            {
                throw new UnauthorizedAccessException("Cannot decline this invitation");
            }

            if (invitation.Status != InvitationStatus.Pending)
            {
                throw new InvalidOperationException("Invitation has already been responded to");
            }

            invitation.Status = InvitationStatus.Declined;
            invitation.DeclinedAt = DateTime.UtcNow;
            invitation.DeclineReason = reason;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Server invitation {InvitationId} declined by {UserId}", invitationId, userId);

            return true;
        }

        // Bulk Invitations
        public async Task<BulkInvitationResult> SendBulkInvitationsAsync(Guid senderId, BulkInvitationRequest request)
        {
            await ValidateInviterPermissionsAsync(senderId, request.CommunityId);

            var result = new BulkInvitationResult
            {
                Id = Guid.NewGuid(),
                TotalTargets = request.Targets.Count,
                Status = new BulkInvitationStatus { Phase = "Processing", Progress = 0 },
                StartedAt = DateTime.UtcNow
            };

            // Process invitations in batches
            var batches = request.Targets
                .Select((target, index) => new { target, index })
                .GroupBy(x => x.index / request.Settings.BatchSize)
                .Select(g => g.Select(x => x.target).ToList())
                .ToList();

            foreach (var batch in batches)
            {
                foreach (var target in batch)
                {
                    try
                    {
                        var invitationRequest = new CreateCommunityInvitationRequest
                        {
                            CommunityId = request.CommunityId,
                            InviteeEmail = target.Email,
                            InviteeUsername = target.Username,
                            InviteeId = target.UserId,
                            PersonalMessage = target.PersonalMessage ?? request.DefaultMessage,
                            Permissions = request.Permissions,
                            ExpiresAt = request.ExpiresAt,
                            Metadata = target.CustomData
                        };

                        await CreateCommunityInvitationAsync(senderId, invitationRequest);
                        result.SuccessfulSends++;
                    }
                    catch (Exception ex)
                    {
                        result.FailedSends++;
                        result.Errors.Add(new BulkInvitationError
                        {
                            Target = target.Email ?? target.Username ?? target.UserId?.ToString() ?? "Unknown",
                            Error = ex.Message
                        });
                    }
                }

                // Update progress
                result.Status.Progress = (float)(result.SuccessfulSends + result.FailedSends) / result.TotalTargets;

                // Delay between batches if configured
                if (request.Settings.BatchDelay > TimeSpan.Zero)
                {
                    await Task.Delay(request.Settings.BatchDelay);
                }
            }

            result.Status.Phase = "Completed";
            result.CompletedAt = DateTime.UtcNow;

            _logger.LogInformation("Bulk invitation {BulkId} completed: {Success}/{Total} successful",
                result.Id, result.SuccessfulSends, result.TotalTargets);

            return result;
        }

        public async Task<BulkInvitationStatus> GetBulkInvitationStatusAsync(Guid bulkInvitationId)
        {
            // This would typically be stored in a separate tracking table or cache
            // For now, return a placeholder
            return new BulkInvitationStatus
            {
                Phase = "Completed",
                Progress = 1.0f,
                ProcessedCount = 0,
                RemainingCount = 0
            };
        }

        public async Task<bool> CancelBulkInvitationAsync(Guid bulkInvitationId, Guid cancelerId)
        {
            // Implementation would depend on how bulk invitations are tracked
            _logger.LogInformation("Bulk invitation {BulkId} cancelled by {CancelerId}", bulkInvitationId, cancelerId);
            return true;
        }

        // Invitation Analytics
        public async Task<InvitationAnalytics> GetInvitationAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            await ValidateInviterPermissionsAsync(userId, communityId);

            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var invitations = await _context.CommunityInvitations
                .Where(i => i.CommunityId == communityId && i.CreatedAt >= start && i.CreatedAt <= end)
                .ToListAsync();

            var metrics = new InvitationMetrics
            {
                TotalInvitations = invitations.Count,
                AcceptedInvitations = invitations.Count(i => i.Status == InvitationStatus.Accepted),
                DeclinedInvitations = invitations.Count(i => i.Status == InvitationStatus.Declined),
                PendingInvitations = invitations.Count(i => i.Status == InvitationStatus.Pending)
            };

            metrics.AcceptanceRate = metrics.TotalInvitations > 0 ? (float)metrics.AcceptedInvitations / metrics.TotalInvitations : 0;
            metrics.DeclineRate = metrics.TotalInvitations > 0 ? (float)metrics.DeclinedInvitations / metrics.TotalInvitations : 0;

            var respondedInvitations = invitations.Where(i => i.AcceptedAt.HasValue || i.DeclinedAt.HasValue).ToList();
            if (respondedInvitations.Any())
            {
                var avgResponseTicks = respondedInvitations.Average(i =>
                {
                    var responseTime = i.AcceptedAt ?? i.DeclinedAt ?? i.CreatedAt;
                    return (responseTime - i.CreatedAt).Ticks;
                });
                metrics.AverageResponseTime = new TimeSpan((long)avgResponseTicks);
            }

            var trends = invitations
                .GroupBy(i => i.CreatedAt.Date)
                .Select(g => new InvitationTrend
                {
                    Date = g.Key,
                    Sent = g.Count(),
                    Accepted = g.Count(i => i.Status == InvitationStatus.Accepted),
                    Declined = g.Count(i => i.Status == InvitationStatus.Declined),
                    AcceptanceRate = g.Count() > 0 ? (float)g.Count(i => i.Status == InvitationStatus.Accepted) / g.Count() : 0
                })
                .OrderBy(t => t.Date)
                .ToList();

            var conversionAnalysis = new InvitationConversionAnalysis
            {
                ConversionBySource = invitations
                    .GroupBy(i => i.Metadata.Source ?? "unknown")
                    .ToDictionary(g => g.Key, g => g.Count() > 0 ? (float)g.Count(i => i.Status == InvitationStatus.Accepted) / g.Count() : 0),
                ConversionByType = invitations
                    .GroupBy(i => i.Type)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count() > 0 ? (float)g.Count(i => i.Status == InvitationStatus.Accepted) / g.Count() : 0)
            };

            return new InvitationAnalytics
            {
                CommunityId = communityId,
                StartDate = start,
                EndDate = end,
                Metrics = metrics,
                Trends = trends,
                Conversion = conversionAnalysis,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<List<InvitationConversionMetric>> GetInvitationConversionMetricsAsync(Guid communityId, Guid userId)
        {
            await ValidateInviterPermissionsAsync(userId, communityId);
            return new List<InvitationConversionMetric>(); // Placeholder
        }

        public async Task<InvitationPerformanceReport> GetInvitationPerformanceReportAsync(Guid communityId, Guid userId, InvitationReportTimeframe timeframe)
        {
            await ValidateInviterPermissionsAsync(userId, communityId);
            return new InvitationPerformanceReport(); // Placeholder
        }

        // Onboarding Flows
        public async Task<OnboardingFlow> CreateOnboardingFlowAsync(Guid communityId, Guid creatorId, CreateOnboardingFlowRequest request)
        {
            await ValidateInviterPermissionsAsync(creatorId, communityId);

            var flow = new OnboardingFlow
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                CreatorId = creatorId,
                Name = request.Name,
                Description = request.Description,
                IsActive = true,
                IsDefault = request.IsDefault,
                Configuration = request.Configuration,
                Steps = request.Steps.Select((step, index) => new OnboardingStep
                {
                    Id = Guid.NewGuid(),
                    Order = index,
                    Name = step.Name,
                    Description = step.Description,
                    Type = step.Type,
                    Content = step.Content,
                    Validation = step.Validation,
                    IsRequired = step.IsRequired,
                    IsSkippable = step.IsSkippable,
                    EstimatedDuration = step.EstimatedDuration,
                    Prerequisites = step.Prerequisites
                }).ToList(),
                CreatedAt = DateTime.UtcNow,
                Version = 1
            };

            // If this is set as default, remove default from other flows
            if (request.IsDefault)
            {
                var existingDefault = await _context.OnboardingFlows
                    .Where(f => f.CommunityId == communityId && f.IsDefault)
                    .ToListAsync();

                foreach (var existing in existingDefault)
                {
                    existing.IsDefault = false;
                }
            }

            _context.OnboardingFlows.Add(flow);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding flow {FlowId} created for community {CommunityId} by {CreatorId}",
                flow.Id, communityId, creatorId);

            return flow;
        }

        public async Task<OnboardingFlow> GetOnboardingFlowAsync(Guid flowId)
        {
            var flow = await _context.OnboardingFlows
                .Include(f => f.Community)
                .Include(f => f.Creator)
                .FirstOrDefaultAsync(f => f.Id == flowId);

            if (flow == null)
            {
                throw new KeyNotFoundException($"Onboarding flow {flowId} not found");
            }

            return flow;
        }

        public async Task<List<OnboardingFlow>> GetCommunityOnboardingFlowsAsync(Guid communityId)
        {
            return await _context.OnboardingFlows
                .Where(f => f.CommunityId == communityId)
                .OrderBy(f => f.IsDefault ? 0 : 1)
                .ThenBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<OnboardingFlow> UpdateOnboardingFlowAsync(Guid flowId, Guid updaterId, UpdateOnboardingFlowRequest request)
        {
            var flow = await GetOnboardingFlowAsync(flowId);
            await ValidateInviterPermissionsAsync(updaterId, flow.CommunityId);

            if (request.Name != null) flow.Name = request.Name;
            if (request.Description != null) flow.Description = request.Description;
            if (request.IsActive.HasValue) flow.IsActive = request.IsActive.Value;
            if (request.Configuration != null) flow.Configuration = request.Configuration;
            if (request.Steps != null) flow.Steps = request.Steps;

            if (request.IsDefault.HasValue && request.IsDefault.Value && !flow.IsDefault)
            {
                // Remove default from other flows
                var existingDefault = await _context.OnboardingFlows
                    .Where(f => f.CommunityId == flow.CommunityId && f.IsDefault && f.Id != flowId)
                    .ToListAsync();

                foreach (var existing in existingDefault)
                {
                    existing.IsDefault = false;
                }

                flow.IsDefault = true;
            }

            flow.UpdatedAt = DateTime.UtcNow;
            flow.Version++;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding flow {FlowId} updated by {UpdaterId}", flowId, updaterId);

            return flow;
        }

        public async Task<bool> DeleteOnboardingFlowAsync(Guid flowId, Guid deleterId)
        {
            var flow = await GetOnboardingFlowAsync(flowId);
            await ValidateInviterPermissionsAsync(deleterId, flow.CommunityId);

            // Check if flow is in use
            var activeSessions = await _context.OnboardingSessions
                .Where(s => s.FlowId == flowId && s.Status == OnboardingStatus.InProgress)
                .CountAsync();

            if (activeSessions > 0)
            {
                throw new InvalidOperationException("Cannot delete onboarding flow with active sessions");
            }

            _context.OnboardingFlows.Remove(flow);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding flow {FlowId} deleted by {DeleterId}", flowId, deleterId);

            return true;
        }

        public async Task<OnboardingFlow> DuplicateOnboardingFlowAsync(Guid flowId, Guid duplicatorId, string newName)
        {
            var originalFlow = await GetOnboardingFlowAsync(flowId);
            await ValidateInviterPermissionsAsync(duplicatorId, originalFlow.CommunityId);

            var duplicatedFlow = new OnboardingFlow
            {
                Id = Guid.NewGuid(),
                CommunityId = originalFlow.CommunityId,
                CreatorId = duplicatorId,
                Name = newName,
                Description = $"Copy of {originalFlow.Description}",
                IsActive = false, // Start as inactive
                IsDefault = false,
                Configuration = originalFlow.Configuration,
                Steps = originalFlow.Steps.Select(step => new OnboardingStep
                {
                    Id = Guid.NewGuid(),
                    Order = step.Order,
                    Name = step.Name,
                    Description = step.Description,
                    Type = step.Type,
                    Content = step.Content,
                    Validation = step.Validation,
                    IsRequired = step.IsRequired,
                    IsSkippable = step.IsSkippable,
                    EstimatedDuration = step.EstimatedDuration,
                    Prerequisites = step.Prerequisites
                }).ToList(),
                CreatedAt = DateTime.UtcNow,
                Version = 1
            };

            _context.OnboardingFlows.Add(duplicatedFlow);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding flow {OriginalFlowId} duplicated as {NewFlowId} by {DuplicatorId}",
                flowId, duplicatedFlow.Id, duplicatorId);

            return duplicatedFlow;
        }

        // Player Onboarding Sessions
        public async Task<OnboardingSession> StartOnboardingSessionAsync(Guid userId, Guid communityId, Guid? flowId = null)
        {
            // Check if user already has an active session
            var existingSession = await _context.OnboardingSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.CommunityId == communityId &&
                    (s.Status == OnboardingStatus.InProgress || s.Status == OnboardingStatus.Paused));

            if (existingSession != null)
            {
                return existingSession; // Return existing session
            }

            // Get flow - use specified or default
            OnboardingFlow flow;
            if (flowId.HasValue)
            {
                flow = await GetOnboardingFlowAsync(flowId.Value);
            }
            else
            {
                flow = await _context.OnboardingFlows
                    .FirstOrDefaultAsync(f => f.CommunityId == communityId && f.IsDefault && f.IsActive);

                if (flow == null)
                {
                    flow = await _context.OnboardingFlows
                        .FirstOrDefaultAsync(f => f.CommunityId == communityId && f.IsActive);
                }

                if (flow == null)
                {
                    throw new InvalidOperationException("No active onboarding flow found for community");
                }
            }

            var session = new OnboardingSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CommunityId = communityId,
                FlowId = flow.Id,
                Status = OnboardingStatus.InProgress,
                CurrentStepIndex = 0,
                Progress = new OnboardingProgress
                {
                    TotalSteps = flow.Steps.Count
                },
                StartedAt = DateTime.UtcNow,
                LastActivityAt = DateTime.UtcNow
            };

            _context.OnboardingSessions.Add(session);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding session {SessionId} started for user {UserId} in community {CommunityId}",
                session.Id, userId, communityId);

            return session;
        }

        public async Task<OnboardingSession> GetOnboardingSessionAsync(Guid sessionId)
        {
            var session = await _context.OnboardingSessions
                .Include(s => s.User)
                .Include(s => s.Community)
                .Include(s => s.Flow)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Onboarding session {sessionId} not found");
            }

            return session;
        }

        public async Task<OnboardingSession> AdvanceOnboardingStepAsync(Guid sessionId, Guid userId, OnboardingStepResult stepResult)
        {
            var session = await GetOnboardingSessionAsync(sessionId);

            if (session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot advance this onboarding session");
            }

            if (session.Status != OnboardingStatus.InProgress)
            {
                throw new InvalidOperationException("Onboarding session is not in progress");
            }

            // Record step completion
            session.CompletedSteps.Add(stepResult);
            session.CurrentStepIndex++;
            session.LastActivityAt = DateTime.UtcNow;

            // Update progress
            session.Progress.StepsCompleted = session.CompletedSteps.Count;
            session.Progress.CompletionPercentage = session.Flow!.Steps.Count > 0 ?
                (float)session.Progress.StepsCompleted / session.Flow.Steps.Count : 0;

            // Calculate engagement score based on time spent and attempts
            var avgTimePerStep = session.CompletedSteps.Average(s => s.TimeSpent.TotalMinutes);
            var avgAttempts = session.CompletedSteps.Average(s => s.AttemptCount);
            session.Progress.EngagementScore = Math.Min(1.0f, (float)(avgTimePerStep / 5.0) * (1.0f / avgAttempts));

            // Check if onboarding is complete
            if (session.CurrentStepIndex >= session.Flow!.Steps.Count)
            {
                session.Status = OnboardingStatus.Completed;
                session.CompletedAt = DateTime.UtcNow;
                session.Progress.CompletionPercentage = 1.0f;

                _logger.LogInformation("Onboarding session {SessionId} completed by user {UserId}", sessionId, userId);
            }

            await _context.SaveChangesAsync();

            return session;
        }

        public async Task<OnboardingSession> CompleteOnboardingAsync(Guid sessionId, Guid userId, OnboardingCompletionData completionData)
        {
            var session = await GetOnboardingSessionAsync(sessionId);

            if (session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot complete this onboarding session");
            }

            session.Status = OnboardingStatus.Completed;
            session.CompletedAt = DateTime.UtcNow;
            session.Progress.CompletionPercentage = 1.0f;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding session {SessionId} manually completed by user {UserId}", sessionId, userId);

            return session;
        }

        public async Task<bool> AbandonOnboardingAsync(Guid sessionId, Guid userId, string? reason = null)
        {
            var session = await GetOnboardingSessionAsync(sessionId);

            if (session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot abandon this onboarding session");
            }

            session.Status = OnboardingStatus.Abandoned;
            session.AbandonedAt = DateTime.UtcNow;
            session.AbandonReason = reason;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding session {SessionId} abandoned by user {UserId} - Reason: {Reason}",
                sessionId, userId, reason ?? "Not specified");

            return true;
        }

        public async Task<OnboardingSession> RestartOnboardingAsync(Guid sessionId, Guid userId)
        {
            var session = await GetOnboardingSessionAsync(sessionId);

            if (session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Cannot restart this onboarding session");
            }

            session.Status = OnboardingStatus.InProgress;
            session.CurrentStepIndex = 0;
            session.CompletedSteps.Clear();
            session.Progress = new OnboardingProgress
            {
                TotalSteps = session.Flow!.Steps.Count
            };
            session.StartedAt = DateTime.UtcNow;
            session.LastActivityAt = DateTime.UtcNow;
            session.CompletedAt = null;
            session.AbandonedAt = null;
            session.AbandonReason = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding session {SessionId} restarted by user {UserId}", sessionId, userId);

            return session;
        }

        // Additional placeholder implementations for remaining interface methods
        public async Task<List<OnboardingSession>> GetUserOnboardingSessionsAsync(Guid userId, OnboardingStatus? status = null)
        {
            var query = _context.OnboardingSessions
                .Include(s => s.Community)
                .Include(s => s.Flow)
                .Where(s => s.UserId == userId);

            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            return await query.OrderByDescending(s => s.StartedAt).ToListAsync();
        }

        public async Task<OnboardingProgress> GetOnboardingProgressAsync(Guid sessionId)
        {
            var session = await GetOnboardingSessionAsync(sessionId);
            return session.Progress;
        }

        // Helper methods
        private async Task ValidateInviterPermissionsAsync(Guid userId, Guid communityId)
        {
            var member = await _context.CommunityMembers
                .FirstOrDefaultAsync(m => m.UserId == userId && m.CommunityId == communityId);

            if (member == null)
            {
                throw new UnauthorizedAccessException("User is not a member of this community");
            }

            if (member.Role != CommunityRole.Owner && member.Role != CommunityRole.Admin && member.Role != CommunityRole.Moderator)
            {
                throw new UnauthorizedAccessException("User does not have permission to send invitations");
            }
        }

        private async Task<string?> GetUserEmailAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return user?.Email;
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // Placeholder implementations for remaining interface methods
        public async Task<List<OnboardingCheckpoint>> GetOnboardingCheckpointsAsync(Guid sessionId) => new();
        public async Task<bool> UpdateOnboardingCheckpointAsync(Guid sessionId, Guid checkpointId, OnboardingCheckpointData data) => true;
        public async Task<OnboardingAnalytics> GetOnboardingAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null) => new();
        public async Task<OnboardingFunnelAnalysis> GetOnboardingFunnelAnalysisAsync(Guid flowId, Guid userId) => new();
        public async Task<List<OnboardingDropoffPoint>> GetOnboardingDropoffPointsAsync(Guid flowId, Guid userId) => new();
        public async Task<OnboardingOptimizationReport> GetOnboardingOptimizationReportAsync(Guid communityId, Guid userId) => new();
        public async Task<WelcomeExperience> CreateWelcomeExperienceAsync(Guid communityId, Guid creatorId, CreateWelcomeExperienceRequest request) => new();
        public async Task<WelcomeExperience> GetWelcomeExperienceAsync(Guid experienceId) => new();
        public async Task<WelcomeExperience> UpdateWelcomeExperienceAsync(Guid experienceId, Guid updaterId, UpdateWelcomeExperienceRequest request) => new();
        public async Task<WelcomeExperience> TriggerWelcomeExperienceAsync(Guid userId, Guid communityId, WelcomeTrigger trigger) => new();
        public async Task<BuddyAssignment> AssignBuddyAsync(Guid newUserId, Guid communityId, BuddyAssignmentCriteria? criteria = null) => new();
        public async Task<List<BuddyAssignment>> GetBuddyAssignmentsAsync(Guid userId, BuddyRole role) => new();
        public async Task<BuddyAssignment> UpdateBuddyAssignmentAsync(Guid assignmentId, Guid updaterId, UpdateBuddyAssignmentRequest request) => new();
        public async Task<bool> CompleteBuddyAssignmentAsync(Guid assignmentId, Guid completerId, BuddyCompletionData completionData) => true;
        public async Task<List<PotentialBuddy>> GetPotentialBuddiesAsync(Guid newUserId, Guid communityId, int limit = 10) => new();
        public async Task<InvitationTemplate> CreateInvitationTemplateAsync(Guid creatorId, CreateInvitationTemplateRequest request) => new();
        public async Task<List<InvitationTemplate>> GetInvitationTemplatesAsync(Guid userId, InvitationTemplateType? type = null) => new();
        public async Task<InvitationTemplate> UpdateInvitationTemplateAsync(Guid templateId, Guid updaterId, UpdateInvitationTemplateRequest request) => new();
        public async Task<bool> DeleteInvitationTemplateAsync(Guid templateId, Guid deleterId) => true;
        public async Task<ReferralCode> GenerateReferralCodeAsync(Guid userId, ReferralCodeSettings settings) => new();
        public async Task<List<ReferralCode>> GetUserReferralCodesAsync(Guid userId, bool activeOnly = true) => new();
        public async Task<ReferralResult> ProcessReferralAsync(string referralCode, Guid newUserId) => new();
        public async Task<ReferralAnalytics> GetReferralAnalyticsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null) => new();
        public async Task<List<ReferralReward>> GetReferralRewardsAsync(Guid userId, bool claimedOnly = false) => new();
        public async Task<bool> ClaimReferralRewardAsync(Guid rewardId, Guid userId) => true;
        public async Task<List<InvitationSuggestion>> GetInvitationSuggestionsAsync(Guid userId, Guid communityId, int limit = 10) => new();
        public async Task<List<OnboardingRecommendation>> GetOnboardingRecommendationsAsync(Guid userId, Guid communityId) => new();
        public async Task<PersonalizedInvitationContent> GeneratePersonalizedInvitationAsync(Guid senderId, Guid targetUserId, Guid communityId) => new();
        public async Task<bool> EnableDiscordIntegrationAsync(Guid communityId, Guid userId, DiscordIntegrationSettings settings) => true;
        public async Task<bool> SyncInvitationsWithDiscordAsync(Guid communityId) => true;
        public async Task<AutomationRule> CreateInvitationAutomationAsync(Guid communityId, Guid creatorId, CreateAutomationRuleRequest request) => new();
        public async Task<List<AutomationRule>> GetInvitationAutomationsAsync(Guid communityId) => new();
        public async Task<bool> TriggerAutomationRuleAsync(Guid ruleId, AutomationTriggerContext context) => true;
        public async Task<bool> SendInvitationNotificationAsync(Guid invitationId, NotificationChannel channel) => true;
        public async Task<List<InvitationNotification>> GetInvitationNotificationsAsync(Guid userId, bool unreadOnly = true) => new();
        public async Task<bool> MarkNotificationAsReadAsync(Guid notificationId, Guid userId) => true;
        public async Task<NotificationPreferences> GetNotificationPreferencesAsync(Guid userId) => new();
        public async Task<NotificationPreferences> UpdateNotificationPreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request) => new();
    }
}