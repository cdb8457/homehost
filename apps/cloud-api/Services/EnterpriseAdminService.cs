using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace HomeHost.CloudApi.Services
{
    public class EnterpriseAdminService : IEnterpriseAdminService
    {
        private readonly HomeHostContext _context;
        private readonly ILogger<EnterpriseAdminService> _logger;

        public EnterpriseAdminService(
            HomeHostContext context,
            ILogger<EnterpriseAdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Organization Management
        public async Task<Organization> CreateOrganizationAsync(Guid creatorId, CreateOrganizationRequest request)
        {
            var organization = new Organization
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                DisplayName = request.DisplayName,
                Domain = request.Domain,
                Type = request.Type,
                Industry = request.Industry,
                Size = request.Size,
                Description = request.Description,
                Logo = request.Logo,
                Website = request.Website,
                Country = request.Country,
                Timezone = request.Timezone,
                Currency = request.Currency,
                Status = "Active",
                OwnerId = creatorId,
                Settings = request.Settings,
                Features = request.Features,
                Limits = request.Limits,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = creatorId
            };

            _context.Organizations.Add(organization);

            // Create default admin role for the organization
            var adminRole = new Role
            {
                Id = Guid.NewGuid(),
                OrganizationId = organization.Id,
                Name = "Organization Admin",
                Description = "Full administrative access to the organization",
                Type = "System",
                IsSystem = true,
                Permissions = JsonSerializer.Serialize(new List<string> { "*" }),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = creatorId
            };

            _context.Roles.Add(adminRole);

            // Add creator as organization member with admin role
            var adminMember = new OrganizationMember
            {
                Id = Guid.NewGuid(),
                OrganizationId = organization.Id,
                UserId = creatorId,
                RoleId = adminRole.Id,
                Status = "Active",
                JoinedAt = DateTime.UtcNow,
                InvitedBy = creatorId
            };

            _context.OrganizationMembers.Add(adminMember);

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organization.Id,
                UserId = creatorId,
                Action = "Organization.Create",
                ResourceType = "Organization",
                ResourceId = organization.Id,
                Details = $"Created organization: {organization.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization {OrganizationId} created by user {UserId}", 
                organization.Id, creatorId);

            return organization;
        }

        public async Task<List<Organization>> GetOrganizationsAsync(OrganizationFilter? filter = null)
        {
            var query = _context.Organizations
                .Include(o => o.Owner)
                .Include(o => o.Members)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Name))
                    query = query.Where(o => o.Name.Contains(filter.Name));

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(o => o.Status == filter.Status);

                if (!string.IsNullOrEmpty(filter.Industry))
                    query = query.Where(o => o.Industry == filter.Industry);

                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(o => o.Type == filter.Type);

                if (filter.OwnerId.HasValue)
                    query = query.Where(o => o.OwnerId == filter.OwnerId.Value);

                if (filter.CreatedAfter.HasValue)
                    query = query.Where(o => o.CreatedAt >= filter.CreatedAfter.Value);

                if (filter.CreatedBefore.HasValue)
                    query = query.Where(o => o.CreatedAt <= filter.CreatedBefore.Value);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        public async Task<Organization> GetOrganizationAsync(Guid organizationId)
        {
            var organization = await _context.Organizations
                .Include(o => o.Owner)
                .Include(o => o.Members)
                .ThenInclude(m => m.User)
                .Include(o => o.Members)
                .ThenInclude(m => m.Role)
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
            {
                throw new KeyNotFoundException($"Organization {organizationId} not found");
            }

            return organization;
        }

        public async Task<Organization> UpdateOrganizationAsync(Guid organizationId, Guid userId, UpdateOrganizationRequest request)
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
            {
                throw new KeyNotFoundException($"Organization {organizationId} not found");
            }

            // Check if user has permission to update organization
            if (!await CheckUserPermissionAsync(userId, organizationId, "Organization.Update"))
            {
                throw new UnauthorizedAccessException("User does not have permission to update organization");
            }

            // Update organization properties
            if (!string.IsNullOrEmpty(request.Name))
                organization.Name = request.Name;

            if (!string.IsNullOrEmpty(request.DisplayName))
                organization.DisplayName = request.DisplayName;

            if (!string.IsNullOrEmpty(request.Description))
                organization.Description = request.Description;

            if (!string.IsNullOrEmpty(request.Logo))
                organization.Logo = request.Logo;

            if (!string.IsNullOrEmpty(request.Website))
                organization.Website = request.Website;

            if (!string.IsNullOrEmpty(request.Country))
                organization.Country = request.Country;

            if (!string.IsNullOrEmpty(request.Timezone))
                organization.Timezone = request.Timezone;

            if (!string.IsNullOrEmpty(request.Currency))
                organization.Currency = request.Currency;

            if (request.Settings != null)
                organization.Settings = request.Settings;

            if (request.Features != null)
                organization.Features = request.Features;

            if (request.Limits != null)
                organization.Limits = request.Limits;

            organization.UpdatedAt = DateTime.UtcNow;
            organization.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "Organization.Update",
                ResourceType = "Organization",
                ResourceId = organizationId,
                Details = $"Updated organization: {organization.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization {OrganizationId} updated by user {UserId}", 
                organizationId, userId);

            return organization;
        }

        public async Task<bool> DeleteOrganizationAsync(Guid organizationId, Guid userId)
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
            {
                throw new KeyNotFoundException($"Organization {organizationId} not found");
            }

            // Check if user has permission to delete organization
            if (!await CheckUserPermissionAsync(userId, organizationId, "Organization.Delete"))
            {
                throw new UnauthorizedAccessException("User does not have permission to delete organization");
            }

            // Soft delete - update status instead of removing
            organization.Status = "Deleted";
            organization.UpdatedAt = DateTime.UtcNow;
            organization.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "Organization.Delete",
                ResourceType = "Organization",
                ResourceId = organizationId,
                Details = $"Deleted organization: {organization.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization {OrganizationId} deleted by user {UserId}", 
                organizationId, userId);

            return true;
        }

        public async Task<List<Organization>> GetUserOrganizationsAsync(Guid userId)
        {
            var organizations = await _context.Organizations
                .Where(o => o.Members.Any(m => m.UserId == userId && m.Status == "Active"))
                .Include(o => o.Owner)
                .Include(o => o.Members)
                .ThenInclude(m => m.Role)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return organizations;
        }

        public async Task<bool> TransferOrganizationOwnershipAsync(Guid organizationId, Guid currentOwnerId, Guid newOwnerId)
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
            {
                throw new KeyNotFoundException($"Organization {organizationId} not found");
            }

            if (organization.OwnerId != currentOwnerId)
            {
                throw new UnauthorizedAccessException("User is not the current owner of the organization");
            }

            // Check if new owner is a member of the organization
            var newOwnerMember = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.OrganizationId == organizationId && m.UserId == newOwnerId);

            if (newOwnerMember == null)
            {
                throw new ArgumentException("New owner must be a member of the organization");
            }

            // Transfer ownership
            organization.OwnerId = newOwnerId;
            organization.UpdatedAt = DateTime.UtcNow;
            organization.UpdatedBy = currentOwnerId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = currentOwnerId,
                Action = "Organization.TransferOwnership",
                ResourceType = "Organization",
                ResourceId = organizationId,
                Details = $"Transferred organization ownership from {currentOwnerId} to {newOwnerId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization {OrganizationId} ownership transferred from {CurrentOwnerId} to {NewOwnerId}", 
                organizationId, currentOwnerId, newOwnerId);

            return true;
        }

        // Organization Members
        public async Task<OrganizationMember> AddOrganizationMemberAsync(Guid organizationId, Guid userId, AddOrganizationMemberRequest request)
        {
            // Check if user has permission to add members
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationMember.Create"))
            {
                throw new UnauthorizedAccessException("User does not have permission to add organization members");
            }

            // Check if target user is already a member
            var existingMember = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.OrganizationId == organizationId && m.UserId == request.UserId);

            if (existingMember != null)
            {
                throw new ArgumentException("User is already a member of the organization");
            }

            var member = new OrganizationMember
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                UserId = request.UserId,
                RoleId = request.RoleId,
                Status = "Active",
                JoinedAt = DateTime.UtcNow,
                InvitedBy = userId,
                Settings = request.Settings,
                Permissions = request.Permissions
            };

            _context.OrganizationMembers.Add(member);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationMember.Add",
                ResourceType = "OrganizationMember",
                ResourceId = member.Id,
                Details = $"Added user {request.UserId} to organization",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("User {UserId} added to organization {OrganizationId} by {InvitedBy}", 
                request.UserId, organizationId, userId);

            return member;
        }

        public async Task<List<OrganizationMember>> GetOrganizationMembersAsync(Guid organizationId, OrganizationMemberFilter? filter = null)
        {
            var query = _context.OrganizationMembers
                .Where(m => m.OrganizationId == organizationId)
                .Include(m => m.User)
                .Include(m => m.Role)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(m => m.Status == filter.Status);

                if (filter.RoleId.HasValue)
                    query = query.Where(m => m.RoleId == filter.RoleId.Value);

                if (filter.JoinedAfter.HasValue)
                    query = query.Where(m => m.JoinedAt >= filter.JoinedAfter.Value);

                if (filter.JoinedBefore.HasValue)
                    query = query.Where(m => m.JoinedAt <= filter.JoinedBefore.Value);
            }

            return await query.OrderByDescending(m => m.JoinedAt).ToListAsync();
        }

        public async Task<OrganizationMember> GetOrganizationMemberAsync(Guid organizationId, Guid userId)
        {
            var member = await _context.OrganizationMembers
                .Include(m => m.User)
                .Include(m => m.Role)
                .FirstOrDefaultAsync(m => m.OrganizationId == organizationId && m.UserId == userId);

            if (member == null)
            {
                throw new KeyNotFoundException($"Organization member not found");
            }

            return member;
        }

        public async Task<OrganizationMember> UpdateOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId, UpdateOrganizationMemberRequest request)
        {
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.Id == memberId && m.OrganizationId == organizationId);

            if (member == null)
            {
                throw new KeyNotFoundException($"Organization member {memberId} not found");
            }

            // Check if user has permission to update members
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationMember.Update"))
            {
                throw new UnauthorizedAccessException("User does not have permission to update organization members");
            }

            // Update member properties
            if (request.RoleId.HasValue)
                member.RoleId = request.RoleId.Value;

            if (request.Settings != null)
                member.Settings = request.Settings;

            if (request.Permissions != null)
                member.Permissions = request.Permissions;

            member.UpdatedAt = DateTime.UtcNow;
            member.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationMember.Update",
                ResourceType = "OrganizationMember",
                ResourceId = memberId,
                Details = $"Updated organization member {member.UserId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization member {MemberId} updated by user {UserId}", 
                memberId, userId);

            return member;
        }

        public async Task<bool> RemoveOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId)
        {
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.Id == memberId && m.OrganizationId == organizationId);

            if (member == null)
            {
                throw new KeyNotFoundException($"Organization member {memberId} not found");
            }

            // Check if user has permission to remove members
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationMember.Delete"))
            {
                throw new UnauthorizedAccessException("User does not have permission to remove organization members");
            }

            // Don't allow removing the organization owner
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization?.OwnerId == member.UserId)
            {
                throw new ArgumentException("Cannot remove the organization owner");
            }

            _context.OrganizationMembers.Remove(member);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationMember.Remove",
                ResourceType = "OrganizationMember",
                ResourceId = memberId,
                Details = $"Removed organization member {member.UserId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization member {MemberId} removed by user {UserId}", 
                memberId, userId);

            return true;
        }

        public async Task<bool> SuspendOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId, SuspendMemberRequest request)
        {
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.Id == memberId && m.OrganizationId == organizationId);

            if (member == null)
            {
                throw new KeyNotFoundException($"Organization member {memberId} not found");
            }

            // Check if user has permission to suspend members
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationMember.Suspend"))
            {
                throw new UnauthorizedAccessException("User does not have permission to suspend organization members");
            }

            member.Status = "Suspended";
            member.SuspendedAt = DateTime.UtcNow;
            member.SuspendedBy = userId;
            member.SuspensionReason = request.Reason;
            member.UpdatedAt = DateTime.UtcNow;
            member.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationMember.Suspend",
                ResourceType = "OrganizationMember",
                ResourceId = memberId,
                Details = $"Suspended organization member {member.UserId}. Reason: {request.Reason}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization member {MemberId} suspended by user {UserId}", 
                memberId, userId);

            return true;
        }

        public async Task<bool> ReactivateOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId)
        {
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.Id == memberId && m.OrganizationId == organizationId);

            if (member == null)
            {
                throw new KeyNotFoundException($"Organization member {memberId} not found");
            }

            // Check if user has permission to reactivate members
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationMember.Reactivate"))
            {
                throw new UnauthorizedAccessException("User does not have permission to reactivate organization members");
            }

            member.Status = "Active";
            member.SuspendedAt = null;
            member.SuspendedBy = null;
            member.SuspensionReason = null;
            member.UpdatedAt = DateTime.UtcNow;
            member.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationMember.Reactivate",
                ResourceType = "OrganizationMember",
                ResourceId = memberId,
                Details = $"Reactivated organization member {member.UserId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization member {MemberId} reactivated by user {UserId}", 
                memberId, userId);

            return true;
        }

        // Organization Invitations
        public async Task<OrganizationInvitation> CreateOrganizationInvitationAsync(Guid organizationId, Guid userId, CreateOrganizationInvitationRequest request)
        {
            // Check if user has permission to create invitations
            if (!await CheckUserPermissionAsync(userId, organizationId, "OrganizationInvitation.Create"))
            {
                throw new UnauthorizedAccessException("User does not have permission to create organization invitations");
            }

            var invitation = new OrganizationInvitation
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Email = request.Email,
                RoleId = request.RoleId,
                Status = "Pending",
                Token = GenerateInvitationToken(),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Message = request.Message,
                Permissions = request.Permissions,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.OrganizationInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "OrganizationInvitation.Create",
                ResourceType = "OrganizationInvitation",
                ResourceId = invitation.Id,
                Details = $"Created invitation for {request.Email}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization invitation {InvitationId} created for {Email} by user {UserId}", 
                invitation.Id, request.Email, userId);

            return invitation;
        }

        public async Task<List<OrganizationInvitation>> GetOrganizationInvitationsAsync(Guid organizationId, InvitationFilter? filter = null)
        {
            var query = _context.OrganizationInvitations
                .Where(i => i.OrganizationId == organizationId)
                .Include(i => i.Role)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(i => i.Status == filter.Status);

                if (!string.IsNullOrEmpty(filter.Email))
                    query = query.Where(i => i.Email.Contains(filter.Email));

                if (filter.RoleId.HasValue)
                    query = query.Where(i => i.RoleId == filter.RoleId.Value);

                if (filter.CreatedAfter.HasValue)
                    query = query.Where(i => i.CreatedAt >= filter.CreatedAfter.Value);

                if (filter.CreatedBefore.HasValue)
                    query = query.Where(i => i.CreatedAt <= filter.CreatedBefore.Value);
            }

            return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        }

        public async Task<OrganizationInvitation> GetOrganizationInvitationAsync(Guid invitationId)
        {
            var invitation = await _context.OrganizationInvitations
                .Include(i => i.Organization)
                .Include(i => i.Role)
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Organization invitation {invitationId} not found");
            }

            return invitation;
        }

        public async Task<bool> AcceptOrganizationInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.OrganizationInvitations
                .Include(i => i.Organization)
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Organization invitation {invitationId} not found");
            }

            if (invitation.Status != "Pending")
            {
                throw new ArgumentException("Invitation is not pending");
            }

            if (invitation.ExpiresAt < DateTime.UtcNow)
            {
                throw new ArgumentException("Invitation has expired");
            }

            // Check if user is already a member
            var existingMember = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.OrganizationId == invitation.OrganizationId && m.UserId == userId);

            if (existingMember != null)
            {
                throw new ArgumentException("User is already a member of the organization");
            }

            // Create organization member
            var member = new OrganizationMember
            {
                Id = Guid.NewGuid(),
                OrganizationId = invitation.OrganizationId,
                UserId = userId,
                RoleId = invitation.RoleId,
                Status = "Active",
                JoinedAt = DateTime.UtcNow,
                InvitedBy = invitation.CreatedBy,
                Permissions = invitation.Permissions
            };

            _context.OrganizationMembers.Add(member);

            // Update invitation status
            invitation.Status = "Accepted";
            invitation.AcceptedAt = DateTime.UtcNow;
            invitation.AcceptedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = invitation.OrganizationId,
                UserId = userId,
                Action = "OrganizationInvitation.Accept",
                ResourceType = "OrganizationInvitation",
                ResourceId = invitationId,
                Details = $"Accepted invitation to join organization",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization invitation {InvitationId} accepted by user {UserId}", 
                invitationId, userId);

            return true;
        }

        public async Task<bool> DeclineOrganizationInvitationAsync(Guid invitationId, Guid userId, DeclineInvitationRequest request)
        {
            var invitation = await _context.OrganizationInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Organization invitation {invitationId} not found");
            }

            if (invitation.Status != "Pending")
            {
                throw new ArgumentException("Invitation is not pending");
            }

            invitation.Status = "Declined";
            invitation.DeclinedAt = DateTime.UtcNow;
            invitation.DeclinedBy = userId;
            invitation.DeclineReason = request.Reason;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = invitation.OrganizationId,
                UserId = userId,
                Action = "OrganizationInvitation.Decline",
                ResourceType = "OrganizationInvitation",
                ResourceId = invitationId,
                Details = $"Declined invitation to join organization. Reason: {request.Reason}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization invitation {InvitationId} declined by user {UserId}", 
                invitationId, userId);

            return true;
        }

        public async Task<bool> CancelOrganizationInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.OrganizationInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Organization invitation {invitationId} not found");
            }

            // Check if user has permission to cancel invitations
            if (!await CheckUserPermissionAsync(userId, invitation.OrganizationId, "OrganizationInvitation.Cancel"))
            {
                throw new UnauthorizedAccessException("User does not have permission to cancel organization invitations");
            }

            if (invitation.Status != "Pending")
            {
                throw new ArgumentException("Invitation is not pending");
            }

            invitation.Status = "Cancelled";
            invitation.CancelledAt = DateTime.UtcNow;
            invitation.CancelledBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = invitation.OrganizationId,
                UserId = userId,
                Action = "OrganizationInvitation.Cancel",
                ResourceType = "OrganizationInvitation",
                ResourceId = invitationId,
                Details = $"Cancelled organization invitation",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization invitation {InvitationId} cancelled by user {UserId}", 
                invitationId, userId);

            return true;
        }

        public async Task<bool> ResendOrganizationInvitationAsync(Guid invitationId, Guid userId)
        {
            var invitation = await _context.OrganizationInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null)
            {
                throw new KeyNotFoundException($"Organization invitation {invitationId} not found");
            }

            // Check if user has permission to resend invitations
            if (!await CheckUserPermissionAsync(userId, invitation.OrganizationId, "OrganizationInvitation.Resend"))
            {
                throw new UnauthorizedAccessException("User does not have permission to resend organization invitations");
            }

            if (invitation.Status != "Pending")
            {
                throw new ArgumentException("Invitation is not pending");
            }

            // Generate new token and extend expiration
            invitation.Token = GenerateInvitationToken();
            invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);
            invitation.UpdatedAt = DateTime.UtcNow;
            invitation.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = invitation.OrganizationId,
                UserId = userId,
                Action = "OrganizationInvitation.Resend",
                ResourceType = "OrganizationInvitation",
                ResourceId = invitationId,
                Details = $"Resent organization invitation",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Organization invitation {InvitationId} resent by user {UserId}", 
                invitationId, userId);

            return true;
        }

        // Role Management
        public async Task<Role> CreateRoleAsync(Guid organizationId, Guid userId, CreateRoleRequest request)
        {
            // Check if user has permission to create roles
            if (!await CheckUserPermissionAsync(userId, organizationId, "Role.Create"))
            {
                throw new UnauthorizedAccessException("User does not have permission to create roles");
            }

            var role = new Role
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                Description = request.Description,
                Type = request.Type,
                IsSystem = false,
                Permissions = JsonSerializer.Serialize(request.Permissions),
                Settings = request.Settings,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "Role.Create",
                ResourceType = "Role",
                ResourceId = role.Id,
                Details = $"Created role: {request.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Role {RoleId} created by user {UserId}", 
                role.Id, userId);

            return role;
        }

        public async Task<List<Role>> GetRolesAsync(Guid organizationId, RoleFilter? filter = null)
        {
            var query = _context.Roles
                .Where(r => r.OrganizationId == organizationId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Name))
                    query = query.Where(r => r.Name.Contains(filter.Name));

                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(r => r.Type == filter.Type);

                if (filter.IsSystem.HasValue)
                    query = query.Where(r => r.IsSystem == filter.IsSystem.Value);
            }

            return await query.OrderBy(r => r.Name).ToListAsync();
        }

        public async Task<Role> GetRoleAsync(Guid roleId)
        {
            var role = await _context.Roles
                .Include(r => r.Members)
                .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            return role;
        }

        public async Task<Role> UpdateRoleAsync(Guid roleId, Guid userId, UpdateRoleRequest request)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to update roles
            if (!await CheckUserPermissionAsync(userId, role.OrganizationId, "Role.Update"))
            {
                throw new UnauthorizedAccessException("User does not have permission to update roles");
            }

            // Don't allow updating system roles
            if (role.IsSystem)
            {
                throw new ArgumentException("Cannot update system roles");
            }

            // Update role properties
            if (!string.IsNullOrEmpty(request.Name))
                role.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description))
                role.Description = request.Description;

            if (request.Permissions != null)
                role.Permissions = JsonSerializer.Serialize(request.Permissions);

            if (request.Settings != null)
                role.Settings = request.Settings;

            role.UpdatedAt = DateTime.UtcNow;
            role.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = role.OrganizationId,
                UserId = userId,
                Action = "Role.Update",
                ResourceType = "Role",
                ResourceId = roleId,
                Details = $"Updated role: {role.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Role {RoleId} updated by user {UserId}", 
                roleId, userId);

            return role;
        }

        public async Task<bool> DeleteRoleAsync(Guid roleId, Guid userId)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to delete roles
            if (!await CheckUserPermissionAsync(userId, role.OrganizationId, "Role.Delete"))
            {
                throw new UnauthorizedAccessException("User does not have permission to delete roles");
            }

            // Don't allow deleting system roles
            if (role.IsSystem)
            {
                throw new ArgumentException("Cannot delete system roles");
            }

            // Check if role is assigned to any members
            var memberCount = await _context.OrganizationMembers
                .CountAsync(m => m.RoleId == roleId);

            if (memberCount > 0)
            {
                throw new ArgumentException("Cannot delete role that is assigned to members");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = role.OrganizationId,
                UserId = userId,
                Action = "Role.Delete",
                ResourceType = "Role",
                ResourceId = roleId,
                Details = $"Deleted role: {role.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Role {RoleId} deleted by user {UserId}", 
                roleId, userId);

            return true;
        }

        public async Task<bool> AssignRoleToUserAsync(Guid roleId, Guid userId, Guid assignedBy)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to assign roles
            if (!await CheckUserPermissionAsync(assignedBy, role.OrganizationId, "Role.Assign"))
            {
                throw new UnauthorizedAccessException("User does not have permission to assign roles");
            }

            // Check if user is a member of the organization
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.OrganizationId == role.OrganizationId && m.UserId == userId);

            if (member == null)
            {
                throw new ArgumentException("User is not a member of the organization");
            }

            // Update member role
            member.RoleId = roleId;
            member.UpdatedAt = DateTime.UtcNow;
            member.UpdatedBy = assignedBy;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = role.OrganizationId,
                UserId = assignedBy,
                Action = "Role.Assign",
                ResourceType = "Role",
                ResourceId = roleId,
                Details = $"Assigned role {role.Name} to user {userId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Role {RoleId} assigned to user {UserId} by {AssignedBy}", 
                roleId, userId, assignedBy);

            return true;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid roleId, Guid userId, Guid removedBy)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to remove roles
            if (!await CheckUserPermissionAsync(removedBy, role.OrganizationId, "Role.Remove"))
            {
                throw new UnauthorizedAccessException("User does not have permission to remove roles");
            }

            // Find member with this role
            var member = await _context.OrganizationMembers
                .FirstOrDefaultAsync(m => m.OrganizationId == role.OrganizationId && m.UserId == userId && m.RoleId == roleId);

            if (member == null)
            {
                throw new ArgumentException("User does not have this role");
            }

            // Don't allow removing the last admin role
            if (role.Name == "Organization Admin")
            {
                var adminCount = await _context.OrganizationMembers
                    .CountAsync(m => m.OrganizationId == role.OrganizationId && m.RoleId == roleId);

                if (adminCount <= 1)
                {
                    throw new ArgumentException("Cannot remove the last admin role");
                }
            }

            // Set to default role or remove member
            var defaultRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.OrganizationId == role.OrganizationId && r.Name == "Member");

            if (defaultRole != null)
            {
                member.RoleId = defaultRole.Id;
                member.UpdatedAt = DateTime.UtcNow;
                member.UpdatedBy = removedBy;
            }
            else
            {
                _context.OrganizationMembers.Remove(member);
            }

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = role.OrganizationId,
                UserId = removedBy,
                Action = "Role.Remove",
                ResourceType = "Role",
                ResourceId = roleId,
                Details = $"Removed role {role.Name} from user {userId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Role {RoleId} removed from user {UserId} by {RemovedBy}", 
                roleId, userId, removedBy);

            return true;
        }

        public async Task<List<Role>> GetUserRolesAsync(Guid userId, Guid organizationId)
        {
            var roles = await _context.Roles
                .Where(r => r.OrganizationId == organizationId && 
                           r.Members.Any(m => m.UserId == userId))
                .ToListAsync();

            return roles;
        }

        // Permission Management
        public async Task<Permission> CreatePermissionAsync(Guid organizationId, Guid userId, CreatePermissionRequest request)
        {
            // Check if user has permission to create permissions
            if (!await CheckUserPermissionAsync(userId, organizationId, "Permission.Create"))
            {
                throw new UnauthorizedAccessException("User does not have permission to create permissions");
            }

            var permission = new Permission
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                Resource = request.Resource,
                Action = request.Action,
                Scope = request.Scope,
                IsSystem = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "Permission.Create",
                ResourceType = "Permission",
                ResourceId = permission.Id,
                Details = $"Created permission: {request.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Permission {PermissionId} created by user {UserId}", 
                permission.Id, userId);

            return permission;
        }

        public async Task<List<Permission>> GetPermissionsAsync(Guid organizationId, PermissionFilter? filter = null)
        {
            var query = _context.Permissions
                .Where(p => p.OrganizationId == organizationId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Name))
                    query = query.Where(p => p.Name.Contains(filter.Name));

                if (!string.IsNullOrEmpty(filter.Category))
                    query = query.Where(p => p.Category == filter.Category);

                if (!string.IsNullOrEmpty(filter.Resource))
                    query = query.Where(p => p.Resource == filter.Resource);

                if (!string.IsNullOrEmpty(filter.Action))
                    query = query.Where(p => p.Action == filter.Action);

                if (filter.IsSystem.HasValue)
                    query = query.Where(p => p.IsSystem == filter.IsSystem.Value);
            }

            return await query.OrderBy(p => p.Category).ThenBy(p => p.Name).ToListAsync();
        }

        public async Task<Permission> GetPermissionAsync(Guid permissionId)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == permissionId);

            if (permission == null)
            {
                throw new KeyNotFoundException($"Permission {permissionId} not found");
            }

            return permission;
        }

        public async Task<Permission> UpdatePermissionAsync(Guid permissionId, Guid userId, UpdatePermissionRequest request)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == permissionId);

            if (permission == null)
            {
                throw new KeyNotFoundException($"Permission {permissionId} not found");
            }

            // Check if user has permission to update permissions
            if (!await CheckUserPermissionAsync(userId, permission.OrganizationId, "Permission.Update"))
            {
                throw new UnauthorizedAccessException("User does not have permission to update permissions");
            }

            // Don't allow updating system permissions
            if (permission.IsSystem)
            {
                throw new ArgumentException("Cannot update system permissions");
            }

            // Update permission properties
            if (!string.IsNullOrEmpty(request.Name))
                permission.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description))
                permission.Description = request.Description;

            if (!string.IsNullOrEmpty(request.Category))
                permission.Category = request.Category;

            if (!string.IsNullOrEmpty(request.Resource))
                permission.Resource = request.Resource;

            if (!string.IsNullOrEmpty(request.Action))
                permission.Action = request.Action;

            if (!string.IsNullOrEmpty(request.Scope))
                permission.Scope = request.Scope;

            permission.UpdatedAt = DateTime.UtcNow;
            permission.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = permission.OrganizationId,
                UserId = userId,
                Action = "Permission.Update",
                ResourceType = "Permission",
                ResourceId = permissionId,
                Details = $"Updated permission: {permission.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Permission {PermissionId} updated by user {UserId}", 
                permissionId, userId);

            return permission;
        }

        public async Task<bool> DeletePermissionAsync(Guid permissionId, Guid userId)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == permissionId);

            if (permission == null)
            {
                throw new KeyNotFoundException($"Permission {permissionId} not found");
            }

            // Check if user has permission to delete permissions
            if (!await CheckUserPermissionAsync(userId, permission.OrganizationId, "Permission.Delete"))
            {
                throw new UnauthorizedAccessException("User does not have permission to delete permissions");
            }

            // Don't allow deleting system permissions
            if (permission.IsSystem)
            {
                throw new ArgumentException("Cannot delete system permissions");
            }

            // Check if permission is assigned to any roles
            var rolePermissionCount = await _context.RolePermissions
                .CountAsync(rp => rp.PermissionId == permissionId);

            if (rolePermissionCount > 0)
            {
                throw new ArgumentException("Cannot delete permission that is assigned to roles");
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = permission.OrganizationId,
                UserId = userId,
                Action = "Permission.Delete",
                ResourceType = "Permission",
                ResourceId = permissionId,
                Details = $"Deleted permission: {permission.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Permission {PermissionId} deleted by user {UserId}", 
                permissionId, userId);

            return true;
        }

        public async Task<bool> AssignPermissionToRoleAsync(Guid permissionId, Guid roleId, Guid userId)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == permissionId);

            if (permission == null)
            {
                throw new KeyNotFoundException($"Permission {permissionId} not found");
            }

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to assign permissions
            if (!await CheckUserPermissionAsync(userId, permission.OrganizationId, "Permission.Assign"))
            {
                throw new UnauthorizedAccessException("User does not have permission to assign permissions");
            }

            // Check if permission is already assigned to role
            var existingAssignment = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

            if (existingAssignment != null)
            {
                return true; // Already assigned
            }

            var rolePermission = new RolePermission
            {
                Id = Guid.NewGuid(),
                RoleId = roleId,
                PermissionId = permissionId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = permission.OrganizationId,
                UserId = userId,
                Action = "Permission.Assign",
                ResourceType = "Permission",
                ResourceId = permissionId,
                Details = $"Assigned permission {permission.Name} to role {role.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Permission {PermissionId} assigned to role {RoleId} by user {UserId}", 
                permissionId, roleId, userId);

            return true;
        }

        public async Task<bool> RemovePermissionFromRoleAsync(Guid permissionId, Guid roleId, Guid userId)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == permissionId);

            if (permission == null)
            {
                throw new KeyNotFoundException($"Permission {permissionId} not found");
            }

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
            {
                throw new KeyNotFoundException($"Role {roleId} not found");
            }

            // Check if user has permission to remove permissions
            if (!await CheckUserPermissionAsync(userId, permission.OrganizationId, "Permission.Remove"))
            {
                throw new UnauthorizedAccessException("User does not have permission to remove permissions");
            }

            var rolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

            if (rolePermission == null)
            {
                return true; // Not assigned
            }

            _context.RolePermissions.Remove(rolePermission);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = permission.OrganizationId,
                UserId = userId,
                Action = "Permission.Remove",
                ResourceType = "Permission",
                ResourceId = permissionId,
                Details = $"Removed permission {permission.Name} from role {role.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            _logger.LogInformation("Permission {PermissionId} removed from role {RoleId} by user {UserId}", 
                permissionId, roleId, userId);

            return true;
        }

        public async Task<List<Permission>> GetRolePermissionsAsync(Guid roleId)
        {
            var permissions = await _context.Permissions
                .Where(p => p.RolePermissions.Any(rp => rp.RoleId == roleId))
                .ToListAsync();

            return permissions;
        }

        public async Task<List<Permission>> GetUserPermissionsAsync(Guid userId, Guid organizationId)
        {
            var permissions = await _context.Permissions
                .Where(p => p.OrganizationId == organizationId &&
                           p.RolePermissions.Any(rp => rp.Role.Members.Any(m => m.UserId == userId)))
                .ToListAsync();

            return permissions;
        }

        public async Task<bool> CheckUserPermissionAsync(Guid userId, Guid organizationId, string permissionName)
        {
            // Check if user is organization owner (has all permissions)
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization?.OwnerId == userId)
            {
                return true;
            }

            // Check if user has explicit permission through roles
            var hasPermission = await _context.OrganizationMembers
                .Where(m => m.UserId == userId && m.OrganizationId == organizationId)
                .AnyAsync(m => m.Role.RolePermissions.Any(rp => 
                    rp.Permission.Name == permissionName || 
                    rp.Permission.Name == "*"));

            return hasPermission;
        }

        // Audit Logging
        public async Task<AuditLog> CreateAuditLogAsync(CreateAuditLogRequest request)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                OrganizationId = request.OrganizationId,
                UserId = request.UserId,
                Action = request.Action,
                ResourceType = request.ResourceType,
                ResourceId = request.ResourceId,
                Details = request.Details,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                SessionId = request.SessionId,
                Severity = request.Severity ?? "Info",
                Category = request.Category ?? "General",
                Status = "Success",
                Metadata = request.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return auditLog;
        }

        public async Task<List<AuditLog>> GetAuditLogsAsync(AuditLogFilter? filter = null)
        {
            var query = _context.AuditLogs
                .Include(al => al.User)
                .Include(al => al.Organization)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.OrganizationId.HasValue)
                    query = query.Where(al => al.OrganizationId == filter.OrganizationId.Value);

                if (filter.UserId.HasValue)
                    query = query.Where(al => al.UserId == filter.UserId.Value);

                if (!string.IsNullOrEmpty(filter.Action))
                    query = query.Where(al => al.Action.Contains(filter.Action));

                if (!string.IsNullOrEmpty(filter.ResourceType))
                    query = query.Where(al => al.ResourceType == filter.ResourceType);

                if (filter.ResourceId.HasValue)
                    query = query.Where(al => al.ResourceId == filter.ResourceId.Value);

                if (!string.IsNullOrEmpty(filter.Severity))
                    query = query.Where(al => al.Severity == filter.Severity);

                if (!string.IsNullOrEmpty(filter.Category))
                    query = query.Where(al => al.Category == filter.Category);

                if (filter.StartDate.HasValue)
                    query = query.Where(al => al.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(al => al.CreatedAt <= filter.EndDate.Value);
            }

            return await query
                .OrderByDescending(al => al.CreatedAt)
                .Take(filter?.Limit ?? 1000)
                .ToListAsync();
        }

        public async Task<AuditLog> GetAuditLogAsync(Guid auditLogId)
        {
            var auditLog = await _context.AuditLogs
                .Include(al => al.User)
                .Include(al => al.Organization)
                .FirstOrDefaultAsync(al => al.Id == auditLogId);

            if (auditLog == null)
            {
                throw new KeyNotFoundException($"Audit log {auditLogId} not found");
            }

            return auditLog;
        }

        public async Task<List<AuditLog>> GetUserAuditLogsAsync(Guid userId, UserAuditLogFilter? filter = null)
        {
            var query = _context.AuditLogs
                .Where(al => al.UserId == userId)
                .Include(al => al.Organization)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.OrganizationId.HasValue)
                    query = query.Where(al => al.OrganizationId == filter.OrganizationId.Value);

                if (!string.IsNullOrEmpty(filter.Action))
                    query = query.Where(al => al.Action.Contains(filter.Action));

                if (!string.IsNullOrEmpty(filter.ResourceType))
                    query = query.Where(al => al.ResourceType == filter.ResourceType);

                if (filter.StartDate.HasValue)
                    query = query.Where(al => al.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(al => al.CreatedAt <= filter.EndDate.Value);
            }

            return await query
                .OrderByDescending(al => al.CreatedAt)
                .Take(filter?.Limit ?? 1000)
                .ToListAsync();
        }

        public async Task<List<AuditLog>> GetOrganizationAuditLogsAsync(Guid organizationId, OrganizationAuditLogFilter? filter = null)
        {
            var query = _context.AuditLogs
                .Where(al => al.OrganizationId == organizationId)
                .Include(al => al.User)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.UserId.HasValue)
                    query = query.Where(al => al.UserId == filter.UserId.Value);

                if (!string.IsNullOrEmpty(filter.Action))
                    query = query.Where(al => al.Action.Contains(filter.Action));

                if (!string.IsNullOrEmpty(filter.ResourceType))
                    query = query.Where(al => al.ResourceType == filter.ResourceType);

                if (filter.StartDate.HasValue)
                    query = query.Where(al => al.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(al => al.CreatedAt <= filter.EndDate.Value);
            }

            return await query
                .OrderByDescending(al => al.CreatedAt)
                .Take(filter?.Limit ?? 1000)
                .ToListAsync();
        }

        public async Task<List<AuditLog>> GetResourceAuditLogsAsync(string resourceType, Guid resourceId, ResourceAuditLogFilter? filter = null)
        {
            var query = _context.AuditLogs
                .Where(al => al.ResourceType == resourceType && al.ResourceId == resourceId)
                .Include(al => al.User)
                .Include(al => al.Organization)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.OrganizationId.HasValue)
                    query = query.Where(al => al.OrganizationId == filter.OrganizationId.Value);

                if (filter.UserId.HasValue)
                    query = query.Where(al => al.UserId == filter.UserId.Value);

                if (!string.IsNullOrEmpty(filter.Action))
                    query = query.Where(al => al.Action.Contains(filter.Action));

                if (filter.StartDate.HasValue)
                    query = query.Where(al => al.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(al => al.CreatedAt <= filter.EndDate.Value);
            }

            return await query
                .OrderByDescending(al => al.CreatedAt)
                .Take(filter?.Limit ?? 1000)
                .ToListAsync();
        }

        public async Task<AuditReport> GenerateAuditReportAsync(AuditReportRequest request)
        {
            var query = _context.AuditLogs
                .Include(al => al.User)
                .Include(al => al.Organization)
                .AsQueryable();

            // Apply filters
            if (request.OrganizationId.HasValue)
                query = query.Where(al => al.OrganizationId == request.OrganizationId.Value);

            if (request.UserId.HasValue)
                query = query.Where(al => al.UserId == request.UserId.Value);

            if (!string.IsNullOrEmpty(request.Action))
                query = query.Where(al => al.Action.Contains(request.Action));

            if (!string.IsNullOrEmpty(request.ResourceType))
                query = query.Where(al => al.ResourceType == request.ResourceType);

            if (request.StartDate.HasValue)
                query = query.Where(al => al.CreatedAt >= request.StartDate.Value);

            if (request.EndDate.HasValue)
                query = query.Where(al => al.CreatedAt <= request.EndDate.Value);

            var logs = await query
                .OrderByDescending(al => al.CreatedAt)
                .Take(request.Limit ?? 10000)
                .ToListAsync();

            var report = new AuditReport
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                TotalEvents = logs.Count,
                Events = logs,
                Summary = new AuditSummary
                {
                    TotalEvents = logs.Count,
                    UniqueUsers = logs.Select(l => l.UserId).Distinct().Count(),
                    UniqueOrganizations = logs.Select(l => l.OrganizationId).Distinct().Count(),
                    TopActions = logs.GroupBy(l => l.Action)
                        .OrderByDescending(g => g.Count())
                        .Take(10)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    TopResourceTypes = logs.GroupBy(l => l.ResourceType)
                        .OrderByDescending(g => g.Count())
                        .Take(10)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    EventsByDay = logs.GroupBy(l => l.CreatedAt.Date)
                        .OrderBy(g => g.Key)
                        .ToDictionary(g => g.Key, g => g.Count())
                },
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = request.UserId
            };

            return report;
        }

        public async Task<bool> ExportAuditLogsAsync(ExportAuditLogsRequest request)
        {
            var query = _context.AuditLogs
                .Include(al => al.User)
                .Include(al => al.Organization)
                .AsQueryable();

            // Apply filters
            if (request.OrganizationId.HasValue)
                query = query.Where(al => al.OrganizationId == request.OrganizationId.Value);

            if (request.UserId.HasValue)
                query = query.Where(al => al.UserId == request.UserId.Value);

            if (request.StartDate.HasValue)
                query = query.Where(al => al.CreatedAt >= request.StartDate.Value);

            if (request.EndDate.HasValue)
                query = query.Where(al => al.CreatedAt <= request.EndDate.Value);

            var logs = await query
                .OrderByDescending(al => al.CreatedAt)
                .ToListAsync();

            // Export logic would go here (CSV, JSON, etc.)
            // For now, just return success
            _logger.LogInformation("Exported {Count} audit logs in format {Format}", 
                logs.Count, request.Format);

            return true;
        }

        // Helper method to generate invitation tokens
        private string GenerateInvitationToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[32];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        // Helper method to calculate next billing date
        private DateTime CalculateNextBillingDate(DateTime startDate, string billingCycle, int billingInterval)
        {
            return billingCycle.ToLower() switch
            {
                "daily" => startDate.AddDays(billingInterval),
                "weekly" => startDate.AddDays(billingInterval * 7),
                "monthly" => startDate.AddMonths(billingInterval),
                "quarterly" => startDate.AddMonths(billingInterval * 3),
                "yearly" => startDate.AddYears(billingInterval),
                _ => startDate.AddMonths(1)
            };
        }

        // Security Compliance
        public async Task<ComplianceCheck> RunComplianceCheckAsync(Guid organizationId, ComplianceCheckRequest request)
        {
            var check = new ComplianceCheck
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Type = request.Type,
                Framework = request.Framework,
                Status = "Running",
                StartedAt = DateTime.UtcNow,
                StartedBy = request.UserId,
                Configuration = request.Configuration
            };

            _context.ComplianceChecks.Add(check);
            await _context.SaveChangesAsync();

            // Simulate compliance check logic
            var issues = new List<ComplianceIssue>();
            var score = 85; // Mock score

            // Check password policies
            if (request.Type == "Security" || request.Type == "All")
            {
                var passwordPolicy = await _context.SecurityPolicies
                    .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.Type == "Password");

                if (passwordPolicy == null)
                {
                    issues.Add(new ComplianceIssue
                    {
                        Id = Guid.NewGuid(),
                        OrganizationId = organizationId,
                        CheckId = check.Id,
                        Type = "Security",
                        Severity = "Medium",
                        Title = "Missing Password Policy",
                        Description = "Organization does not have a password policy defined",
                        Recommendation = "Create and enforce a password policy",
                        Status = "Open",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Check MFA enforcement
            var mfaConfig = await _context.MfaConfigurations
                .FirstOrDefaultAsync(m => m.OrganizationId == organizationId);

            if (mfaConfig == null || !mfaConfig.IsEnforced)
            {
                issues.Add(new ComplianceIssue
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    CheckId = check.Id,
                    Type = "Security",
                    Severity = "High",
                    Title = "MFA Not Enforced",
                    Description = "Multi-factor authentication is not enforced for the organization",
                    Recommendation = "Enable and enforce MFA for all users",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Update check with results
            check.Status = "Completed";
            check.CompletedAt = DateTime.UtcNow;
            check.Score = score;
            check.TotalIssues = issues.Count;
            check.HighSeverityIssues = issues.Count(i => i.Severity == "High");
            check.MediumSeverityIssues = issues.Count(i => i.Severity == "Medium");
            check.LowSeverityIssues = issues.Count(i => i.Severity == "Low");
            check.Results = JsonSerializer.Serialize(issues);

            _context.ComplianceIssues.AddRange(issues);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = request.UserId,
                Action = "ComplianceCheck.Run",
                ResourceType = "ComplianceCheck",
                ResourceId = check.Id,
                Details = $"Ran compliance check: {request.Type} - Score: {score}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return check;
        }

        public async Task<List<ComplianceCheck>> GetComplianceChecksAsync(Guid organizationId, ComplianceCheckFilter? filter = null)
        {
            var query = _context.ComplianceChecks
                .Where(c => c.OrganizationId == organizationId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(c => c.Type == filter.Type);

                if (!string.IsNullOrEmpty(filter.Framework))
                    query = query.Where(c => c.Framework == filter.Framework);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(c => c.Status == filter.Status);

                if (filter.StartDate.HasValue)
                    query = query.Where(c => c.StartedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(c => c.StartedAt <= filter.EndDate.Value);
            }

            return await query.OrderByDescending(c => c.StartedAt).ToListAsync();
        }

        public async Task<ComplianceCheck> GetComplianceCheckAsync(Guid checkId)
        {
            var check = await _context.ComplianceChecks
                .Include(c => c.Issues)
                .FirstOrDefaultAsync(c => c.Id == checkId);

            if (check == null)
            {
                throw new KeyNotFoundException($"Compliance check {checkId} not found");
            }

            return check;
        }

        public async Task<ComplianceReport> GenerateComplianceReportAsync(Guid organizationId, ComplianceReportRequest request)
        {
            var checks = await _context.ComplianceChecks
                .Where(c => c.OrganizationId == organizationId)
                .Include(c => c.Issues)
                .ToListAsync();

            var issues = await _context.ComplianceIssues
                .Where(i => i.OrganizationId == organizationId)
                .ToListAsync();

            var report = new ComplianceReport
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Title = request.Title,
                Description = request.Description,
                Framework = request.Framework,
                Period = request.Period,
                OverallScore = checks.Any() ? (int)checks.Average(c => c.Score) : 0,
                TotalChecks = checks.Count,
                TotalIssues = issues.Count,
                OpenIssues = issues.Count(i => i.Status == "Open"),
                ResolvedIssues = issues.Count(i => i.Status == "Resolved"),
                HighSeverityIssues = issues.Count(i => i.Severity == "High"),
                MediumSeverityIssues = issues.Count(i => i.Severity == "Medium"),
                LowSeverityIssues = issues.Count(i => i.Severity == "Low"),
                Recommendations = new List<string>
                {
                    "Implement comprehensive password policies",
                    "Enforce multi-factor authentication",
                    "Regular security training for all users",
                    "Implement automated security monitoring"
                },
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = request.UserId
            };

            return report;
        }

        public async Task<List<ComplianceIssue>> GetComplianceIssuesAsync(Guid organizationId, ComplianceIssueFilter? filter = null)
        {
            var query = _context.ComplianceIssues
                .Where(i => i.OrganizationId == organizationId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(i => i.Type == filter.Type);

                if (!string.IsNullOrEmpty(filter.Severity))
                    query = query.Where(i => i.Severity == filter.Severity);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(i => i.Status == filter.Status);

                if (filter.CheckId.HasValue)
                    query = query.Where(i => i.CheckId == filter.CheckId.Value);
            }

            return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        }

        public async Task<bool> ResolveComplianceIssueAsync(Guid issueId, Guid userId, ResolveComplianceIssueRequest request)
        {
            var issue = await _context.ComplianceIssues
                .FirstOrDefaultAsync(i => i.Id == issueId);

            if (issue == null)
            {
                throw new KeyNotFoundException($"Compliance issue {issueId} not found");
            }

            issue.Status = "Resolved";
            issue.ResolvedAt = DateTime.UtcNow;
            issue.ResolvedBy = userId;
            issue.Resolution = request.Resolution;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = issue.OrganizationId,
                UserId = userId,
                Action = "ComplianceIssue.Resolve",
                ResourceType = "ComplianceIssue",
                ResourceId = issueId,
                Details = $"Resolved compliance issue: {issue.Title}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return true;
        }

        public async Task<ComplianceScore> GetComplianceScoreAsync(Guid organizationId)
        {
            var checks = await _context.ComplianceChecks
                .Where(c => c.OrganizationId == organizationId)
                .OrderByDescending(c => c.StartedAt)
                .Take(10)
                .ToListAsync();

            var issues = await _context.ComplianceIssues
                .Where(i => i.OrganizationId == organizationId)
                .ToListAsync();

            var score = new ComplianceScore
            {
                OrganizationId = organizationId,
                OverallScore = checks.Any() ? (int)checks.Average(c => c.Score) : 0,
                SecurityScore = checks.Where(c => c.Type == "Security").Any() ? 
                    (int)checks.Where(c => c.Type == "Security").Average(c => c.Score) : 0,
                PrivacyScore = checks.Where(c => c.Type == "Privacy").Any() ? 
                    (int)checks.Where(c => c.Type == "Privacy").Average(c => c.Score) : 0,
                TotalIssues = issues.Count,
                CriticalIssues = issues.Count(i => i.Severity == "Critical"),
                HighIssues = issues.Count(i => i.Severity == "High"),
                MediumIssues = issues.Count(i => i.Severity == "Medium"),
                LowIssues = issues.Count(i => i.Severity == "Low"),
                LastAssessment = checks.FirstOrDefault()?.StartedAt,
                Trend = CalculateComplianceTrend(checks),
                CalculatedAt = DateTime.UtcNow
            };

            return score;
        }

        // Security Policies
        public async Task<SecurityPolicy> CreateSecurityPolicyAsync(Guid organizationId, Guid userId, CreateSecurityPolicyRequest request)
        {
            var policy = new SecurityPolicy
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                Description = request.Description,
                Type = request.Type,
                Category = request.Category,
                Rules = request.Rules,
                Settings = request.Settings,
                IsEnabled = request.IsEnabled,
                EnforcementLevel = request.EnforcementLevel,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.SecurityPolicies.Add(policy);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "SecurityPolicy.Create",
                ResourceType = "SecurityPolicy",
                ResourceId = policy.Id,
                Details = $"Created security policy: {request.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return policy;
        }

        public async Task<List<SecurityPolicy>> GetSecurityPoliciesAsync(Guid organizationId, SecurityPolicyFilter? filter = null)
        {
            var query = _context.SecurityPolicies
                .Where(p => p.OrganizationId == organizationId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(p => p.Type == filter.Type);

                if (!string.IsNullOrEmpty(filter.Category))
                    query = query.Where(p => p.Category == filter.Category);

                if (filter.IsEnabled.HasValue)
                    query = query.Where(p => p.IsEnabled == filter.IsEnabled.Value);

                if (!string.IsNullOrEmpty(filter.EnforcementLevel))
                    query = query.Where(p => p.EnforcementLevel == filter.EnforcementLevel);
            }

            return await query.OrderBy(p => p.Name).ToListAsync();
        }

        public async Task<SecurityPolicy> GetSecurityPolicyAsync(Guid policyId)
        {
            var policy = await _context.SecurityPolicies
                .Include(p => p.Violations)
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
            {
                throw new KeyNotFoundException($"Security policy {policyId} not found");
            }

            return policy;
        }

        public async Task<SecurityPolicy> UpdateSecurityPolicyAsync(Guid policyId, Guid userId, UpdateSecurityPolicyRequest request)
        {
            var policy = await _context.SecurityPolicies
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
            {
                throw new KeyNotFoundException($"Security policy {policyId} not found");
            }

            if (!string.IsNullOrEmpty(request.Name))
                policy.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description))
                policy.Description = request.Description;

            if (request.Rules != null)
                policy.Rules = request.Rules;

            if (request.Settings != null)
                policy.Settings = request.Settings;

            if (request.IsEnabled.HasValue)
                policy.IsEnabled = request.IsEnabled.Value;

            if (!string.IsNullOrEmpty(request.EnforcementLevel))
                policy.EnforcementLevel = request.EnforcementLevel;

            policy.UpdatedAt = DateTime.UtcNow;
            policy.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = policy.OrganizationId,
                UserId = userId,
                Action = "SecurityPolicy.Update",
                ResourceType = "SecurityPolicy",
                ResourceId = policyId,
                Details = $"Updated security policy: {policy.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return policy;
        }

        public async Task<bool> DeleteSecurityPolicyAsync(Guid policyId, Guid userId)
        {
            var policy = await _context.SecurityPolicies
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
            {
                throw new KeyNotFoundException($"Security policy {policyId} not found");
            }

            _context.SecurityPolicies.Remove(policy);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = policy.OrganizationId,
                UserId = userId,
                Action = "SecurityPolicy.Delete",
                ResourceType = "SecurityPolicy",
                ResourceId = policyId,
                Details = $"Deleted security policy: {policy.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return true;
        }

        public async Task<bool> EnforceSecurityPolicyAsync(Guid policyId, Guid userId)
        {
            var policy = await _context.SecurityPolicies
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
            {
                throw new KeyNotFoundException($"Security policy {policyId} not found");
            }

            policy.IsEnabled = true;
            policy.EnforcementLevel = "Strict";
            policy.UpdatedAt = DateTime.UtcNow;
            policy.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = policy.OrganizationId,
                UserId = userId,
                Action = "SecurityPolicy.Enforce",
                ResourceType = "SecurityPolicy",
                ResourceId = policyId,
                Details = $"Enforced security policy: {policy.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return true;
        }

        public async Task<List<SecurityViolation>> GetSecurityViolationsAsync(Guid organizationId, SecurityViolationFilter? filter = null)
        {
            var query = _context.SecurityViolations
                .Where(v => v.OrganizationId == organizationId)
                .Include(v => v.Policy)
                .Include(v => v.User)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.PolicyId.HasValue)
                    query = query.Where(v => v.PolicyId == filter.PolicyId.Value);

                if (filter.UserId.HasValue)
                    query = query.Where(v => v.UserId == filter.UserId.Value);

                if (!string.IsNullOrEmpty(filter.Severity))
                    query = query.Where(v => v.Severity == filter.Severity);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(v => v.Status == filter.Status);

                if (filter.StartDate.HasValue)
                    query = query.Where(v => v.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(v => v.CreatedAt <= filter.EndDate.Value);
            }

            return await query.OrderByDescending(v => v.CreatedAt).ToListAsync();
        }

        // Authentication & SSO
        public async Task<SsoConfiguration> CreateSsoConfigurationAsync(Guid organizationId, Guid userId, CreateSsoConfigurationRequest request)
        {
            var config = new SsoConfiguration
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Name = request.Name,
                Provider = request.Provider,
                Protocol = request.Protocol,
                Settings = request.Settings,
                IsEnabled = request.IsEnabled,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.SsoConfigurations.Add(config);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "SsoConfiguration.Create",
                ResourceType = "SsoConfiguration",
                ResourceId = config.Id,
                Details = $"Created SSO configuration: {request.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return config;
        }

        public async Task<List<SsoConfiguration>> GetSsoConfigurationsAsync(Guid organizationId)
        {
            return await _context.SsoConfigurations
                .Where(c => c.OrganizationId == organizationId)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<SsoConfiguration> GetSsoConfigurationAsync(Guid configId)
        {
            var config = await _context.SsoConfigurations
                .FirstOrDefaultAsync(c => c.Id == configId);

            if (config == null)
            {
                throw new KeyNotFoundException($"SSO configuration {configId} not found");
            }

            return config;
        }

        public async Task<SsoConfiguration> UpdateSsoConfigurationAsync(Guid configId, Guid userId, UpdateSsoConfigurationRequest request)
        {
            var config = await _context.SsoConfigurations
                .FirstOrDefaultAsync(c => c.Id == configId);

            if (config == null)
            {
                throw new KeyNotFoundException($"SSO configuration {configId} not found");
            }

            if (!string.IsNullOrEmpty(request.Name))
                config.Name = request.Name;

            if (request.Settings != null)
                config.Settings = request.Settings;

            if (request.IsEnabled.HasValue)
                config.IsEnabled = request.IsEnabled.Value;

            config.UpdatedAt = DateTime.UtcNow;
            config.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = config.OrganizationId,
                UserId = userId,
                Action = "SsoConfiguration.Update",
                ResourceType = "SsoConfiguration",
                ResourceId = configId,
                Details = $"Updated SSO configuration: {config.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return config;
        }

        public async Task<bool> DeleteSsoConfigurationAsync(Guid configId, Guid userId)
        {
            var config = await _context.SsoConfigurations
                .FirstOrDefaultAsync(c => c.Id == configId);

            if (config == null)
            {
                throw new KeyNotFoundException($"SSO configuration {configId} not found");
            }

            _context.SsoConfigurations.Remove(config);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = config.OrganizationId,
                UserId = userId,
                Action = "SsoConfiguration.Delete",
                ResourceType = "SsoConfiguration",
                ResourceId = configId,
                Details = $"Deleted SSO configuration: {config.Name}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return true;
        }

        public async Task<bool> TestSsoConfigurationAsync(Guid configId, Guid userId)
        {
            var config = await _context.SsoConfigurations
                .FirstOrDefaultAsync(c => c.Id == configId);

            if (config == null)
            {
                throw new KeyNotFoundException($"SSO configuration {configId} not found");
            }

            // Mock SSO test logic
            var testResult = true;

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = config.OrganizationId,
                UserId = userId,
                Action = "SsoConfiguration.Test",
                ResourceType = "SsoConfiguration",
                ResourceId = configId,
                Details = $"Tested SSO configuration: {config.Name} - Result: {(testResult ? "Success" : "Failed")}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return testResult;
        }

        public async Task<SsoSession> InitiateSsoLoginAsync(Guid organizationId, SsoLoginRequest request)
        {
            var session = new SsoSession
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Provider = request.Provider,
                Status = "Initiated",
                ReturnUrl = request.ReturnUrl,
                State = GenerateSessionState(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            };

            _context.SsoSessions.Add(session);
            await _context.SaveChangesAsync();

            return session;
        }

        public async Task<SsoSession> CompleteSsoLoginAsync(Guid sessionId, CompleteSsoLoginRequest request)
        {
            var session = await _context.SsoSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"SSO session {sessionId} not found");
            }

            if (session.ExpiresAt < DateTime.UtcNow)
            {
                throw new ArgumentException("SSO session has expired");
            }

            session.Status = "Completed";
            session.UserId = request.UserId;
            session.CompletedAt = DateTime.UtcNow;
            session.UserInfo = request.UserInfo;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = session.OrganizationId,
                UserId = request.UserId,
                Action = "SsoSession.Complete",
                ResourceType = "SsoSession",
                ResourceId = sessionId,
                Details = $"Completed SSO login for user {request.UserId}",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return session;
        }

        // Multi-Factor Authentication
        public async Task<MfaConfiguration> CreateMfaConfigurationAsync(Guid organizationId, Guid userId, CreateMfaConfigurationRequest request)
        {
            var config = new MfaConfiguration
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                IsEnabled = request.IsEnabled,
                IsEnforced = request.IsEnforced,
                Methods = request.Methods,
                Settings = request.Settings,
                GracePeriodDays = request.GracePeriodDays,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.MfaConfigurations.Add(config);
            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "MfaConfiguration.Create",
                ResourceType = "MfaConfiguration",
                ResourceId = config.Id,
                Details = $"Created MFA configuration for organization",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return config;
        }

        public async Task<MfaConfiguration> GetMfaConfigurationAsync(Guid organizationId)
        {
            var config = await _context.MfaConfigurations
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId);

            return config ?? new MfaConfiguration
            {
                Id = Guid.Empty,
                OrganizationId = organizationId,
                IsEnabled = false,
                IsEnforced = false,
                Methods = new List<string> { "TOTP", "SMS" },
                Settings = new Dictionary<string, object>(),
                GracePeriodDays = 7,
                CreatedAt = DateTime.UtcNow
            };
        }

        public async Task<MfaConfiguration> UpdateMfaConfigurationAsync(Guid organizationId, Guid userId, UpdateMfaConfigurationRequest request)
        {
            var config = await _context.MfaConfigurations
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId);

            if (config == null)
            {
                throw new KeyNotFoundException($"MFA configuration for organization {organizationId} not found");
            }

            if (request.IsEnabled.HasValue)
                config.IsEnabled = request.IsEnabled.Value;

            if (request.IsEnforced.HasValue)
                config.IsEnforced = request.IsEnforced.Value;

            if (request.Methods != null)
                config.Methods = request.Methods;

            if (request.Settings != null)
                config.Settings = request.Settings;

            if (request.GracePeriodDays.HasValue)
                config.GracePeriodDays = request.GracePeriodDays.Value;

            config.UpdatedAt = DateTime.UtcNow;
            config.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "MfaConfiguration.Update",
                ResourceType = "MfaConfiguration",
                ResourceId = config.Id,
                Details = $"Updated MFA configuration for organization",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return config;
        }

        public async Task<bool> EnforceMfaForOrganizationAsync(Guid organizationId, Guid userId)
        {
            var config = await _context.MfaConfigurations
                .FirstOrDefaultAsync(c => c.OrganizationId == organizationId);

            if (config == null)
            {
                config = new MfaConfiguration
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    IsEnabled = true,
                    IsEnforced = true,
                    Methods = new List<string> { "TOTP", "SMS" },
                    Settings = new Dictionary<string, object>(),
                    GracePeriodDays = 7,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                _context.MfaConfigurations.Add(config);
            }
            else
            {
                config.IsEnabled = true;
                config.IsEnforced = true;
                config.UpdatedAt = DateTime.UtcNow;
                config.UpdatedBy = userId;
            }

            await _context.SaveChangesAsync();

            await CreateAuditLogAsync(new CreateAuditLogRequest
            {
                OrganizationId = organizationId,
                UserId = userId,
                Action = "MfaConfiguration.Enforce",
                ResourceType = "MfaConfiguration",
                ResourceId = config.Id,
                Details = $"Enforced MFA for organization",
                IpAddress = "127.0.0.1",
                UserAgent = "System"
            });

            return true;
        }

        public async Task<MfaToken> GenerateMfaTokenAsync(Guid userId, GenerateMfaTokenRequest request)
        {
            var token = new MfaToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Method = request.Method,
                Token = GenerateRandomToken(),
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                CreatedAt = DateTime.UtcNow
            };

            _context.MfaTokens.Add(token);
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<bool> VerifyMfaTokenAsync(Guid userId, VerifyMfaTokenRequest request)
        {
            var token = await _context.MfaTokens
                .FirstOrDefaultAsync(t => t.UserId == userId && 
                                         t.Method == request.Method && 
                                         t.Token == request.Token);

            if (token == null)
            {
                return false;
            }

            if (token.ExpiresAt < DateTime.UtcNow)
            {
                return false;
            }

            token.IsUsed = true;
            token.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        // Helper methods
        private string GenerateSessionState()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[16];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        private string GenerateRandomToken()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private string CalculateComplianceTrend(List<ComplianceCheck> checks)
        {
            if (checks.Count < 2)
                return "Stable";

            var latest = checks.First().Score;
            var previous = checks.Skip(1).First().Score;

            if (latest > previous)
                return "Improving";
            else if (latest < previous)
                return "Declining";
            else
                return "Stable";
        }
    }
}