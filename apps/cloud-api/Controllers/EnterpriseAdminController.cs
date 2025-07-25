using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeHost.CloudApi.Services;
using HomeHost.CloudApi.Models;
using System.Security.Claims;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnterpriseAdminController : ControllerBase
    {
        private readonly IEnterpriseAdminService _enterpriseAdminService;
        private readonly ILogger<EnterpriseAdminController> _logger;

        public EnterpriseAdminController(
            IEnterpriseAdminService enterpriseAdminService,
            ILogger<EnterpriseAdminController> logger)
        {
            _enterpriseAdminService = enterpriseAdminService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID");
            }
            return userId;
        }

        // Organization Management
        [HttpPost("organizations")]
        public async Task<ActionResult<Organization>> CreateOrganization(CreateOrganizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var organization = await _enterpriseAdminService.CreateOrganizationAsync(userId, request);
                return Ok(organization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations")]
        public async Task<ActionResult<List<Organization>>> GetOrganizations([FromQuery] OrganizationFilter? filter = null)
        {
            try
            {
                var organizations = await _enterpriseAdminService.GetOrganizationsAsync(filter);
                return Ok(organizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organizations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}")]
        public async Task<ActionResult<Organization>> GetOrganization(Guid organizationId)
        {
            try
            {
                var organization = await _enterpriseAdminService.GetOrganizationAsync(organizationId);
                return Ok(organization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("organizations/{organizationId}")]
        public async Task<ActionResult<Organization>> UpdateOrganization(Guid organizationId, UpdateOrganizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var organization = await _enterpriseAdminService.UpdateOrganizationAsync(organizationId, userId, request);
                return Ok(organization);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("organizations/{organizationId}")]
        public async Task<ActionResult> DeleteOrganization(Guid organizationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeleteOrganizationAsync(organizationId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/my")]
        public async Task<ActionResult<List<Organization>>> GetMyOrganizations()
        {
            try
            {
                var userId = GetUserId();
                var organizations = await _enterpriseAdminService.GetUserOrganizationsAsync(userId);
                return Ok(organizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user organizations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/transfer-ownership")]
        public async Task<ActionResult> TransferOrganizationOwnership(Guid organizationId, TransferOwnershipRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.TransferOrganizationOwnershipAsync(organizationId, userId, request.NewOwnerId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring organization ownership {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Organization Members
        [HttpPost("organizations/{organizationId}/members")]
        public async Task<ActionResult<OrganizationMember>> AddOrganizationMember(Guid organizationId, AddOrganizationMemberRequest request)
        {
            try
            {
                var userId = GetUserId();
                var member = await _enterpriseAdminService.AddOrganizationMemberAsync(organizationId, userId, request);
                return Ok(member);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding organization member to {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/members")]
        public async Task<ActionResult<List<OrganizationMember>>> GetOrganizationMembers(Guid organizationId, [FromQuery] OrganizationMemberFilter? filter = null)
        {
            try
            {
                var members = await _enterpriseAdminService.GetOrganizationMembersAsync(organizationId, filter);
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization members for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/members/{userId}")]
        public async Task<ActionResult<OrganizationMember>> GetOrganizationMember(Guid organizationId, Guid userId)
        {
            try
            {
                var member = await _enterpriseAdminService.GetOrganizationMemberAsync(organizationId, userId);
                return Ok(member);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization member {UserId} for {OrganizationId}", userId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("organizations/{organizationId}/members/{memberId}")]
        public async Task<ActionResult<OrganizationMember>> UpdateOrganizationMember(Guid organizationId, Guid memberId, UpdateOrganizationMemberRequest request)
        {
            try
            {
                var userId = GetUserId();
                var member = await _enterpriseAdminService.UpdateOrganizationMemberAsync(organizationId, memberId, userId, request);
                return Ok(member);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating organization member {MemberId} for {OrganizationId}", memberId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("organizations/{organizationId}/members/{memberId}")]
        public async Task<ActionResult> RemoveOrganizationMember(Guid organizationId, Guid memberId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.RemoveOrganizationMemberAsync(organizationId, memberId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing organization member {MemberId} from {OrganizationId}", memberId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/members/{memberId}/suspend")]
        public async Task<ActionResult> SuspendOrganizationMember(Guid organizationId, Guid memberId, SuspendMemberRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.SuspendOrganizationMemberAsync(organizationId, memberId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending organization member {MemberId} from {OrganizationId}", memberId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/members/{memberId}/reactivate")]
        public async Task<ActionResult> ReactivateOrganizationMember(Guid organizationId, Guid memberId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.ReactivateOrganizationMemberAsync(organizationId, memberId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating organization member {MemberId} from {OrganizationId}", memberId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Organization Invitations
        [HttpPost("organizations/{organizationId}/invitations")]
        public async Task<ActionResult<OrganizationInvitation>> CreateOrganizationInvitation(Guid organizationId, CreateOrganizationInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _enterpriseAdminService.CreateOrganizationInvitationAsync(organizationId, userId, request);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating organization invitation for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/invitations")]
        public async Task<ActionResult<List<OrganizationInvitation>>> GetOrganizationInvitations(Guid organizationId, [FromQuery] InvitationFilter? filter = null)
        {
            try
            {
                var invitations = await _enterpriseAdminService.GetOrganizationInvitationsAsync(organizationId, filter);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization invitations for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("invitations/{invitationId}")]
        public async Task<ActionResult<OrganizationInvitation>> GetOrganizationInvitation(Guid invitationId)
        {
            try
            {
                var invitation = await _enterpriseAdminService.GetOrganizationInvitationAsync(invitationId);
                return Ok(invitation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invitations/{invitationId}/accept")]
        public async Task<ActionResult> AcceptOrganizationInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.AcceptOrganizationInvitationAsync(invitationId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting organization invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invitations/{invitationId}/decline")]
        public async Task<ActionResult> DeclineOrganizationInvitation(Guid invitationId, DeclineInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeclineOrganizationInvitationAsync(invitationId, userId, request);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining organization invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invitations/{invitationId}/cancel")]
        public async Task<ActionResult> CancelOrganizationInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.CancelOrganizationInvitationAsync(invitationId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling organization invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invitations/{invitationId}/resend")]
        public async Task<ActionResult> ResendOrganizationInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.ResendOrganizationInvitationAsync(invitationId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending organization invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Role Management
        [HttpPost("organizations/{organizationId}/roles")]
        public async Task<ActionResult<Role>> CreateRole(Guid organizationId, CreateRoleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var role = await _enterpriseAdminService.CreateRoleAsync(organizationId, userId, request);
                return Ok(role);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/roles")]
        public async Task<ActionResult<List<Role>>> GetRoles(Guid organizationId, [FromQuery] RoleFilter? filter = null)
        {
            try
            {
                var roles = await _enterpriseAdminService.GetRolesAsync(organizationId, filter);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("roles/{roleId}")]
        public async Task<ActionResult<Role>> GetRole(Guid roleId)
        {
            try
            {
                var role = await _enterpriseAdminService.GetRoleAsync(roleId);
                return Ok(role);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role {RoleId}", roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("roles/{roleId}")]
        public async Task<ActionResult<Role>> UpdateRole(Guid roleId, UpdateRoleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var role = await _enterpriseAdminService.UpdateRoleAsync(roleId, userId, request);
                return Ok(role);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role {RoleId}", roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("roles/{roleId}")]
        public async Task<ActionResult> DeleteRole(Guid roleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeleteRoleAsync(roleId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role {RoleId}", roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("roles/{roleId}/assign/{userId}")]
        public async Task<ActionResult> AssignRoleToUser(Guid roleId, Guid userId)
        {
            try
            {
                var assignedBy = GetUserId();
                var success = await _enterpriseAdminService.AssignRoleToUserAsync(roleId, userId, assignedBy);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role {RoleId} to user {UserId}", roleId, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("roles/{roleId}/remove/{userId}")]
        public async Task<ActionResult> RemoveRoleFromUser(Guid roleId, Guid userId)
        {
            try
            {
                var removedBy = GetUserId();
                var success = await _enterpriseAdminService.RemoveRoleFromUserAsync(roleId, userId, removedBy);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {RoleId} from user {UserId}", roleId, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId}/organizations/{organizationId}/roles")]
        public async Task<ActionResult<List<Role>>> GetUserRoles(Guid userId, Guid organizationId)
        {
            try
            {
                var roles = await _enterpriseAdminService.GetUserRolesAsync(userId, organizationId);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user roles for {UserId} in {OrganizationId}", userId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Permission Management
        [HttpPost("organizations/{organizationId}/permissions")]
        public async Task<ActionResult<Permission>> CreatePermission(Guid organizationId, CreatePermissionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var permission = await _enterpriseAdminService.CreatePermissionAsync(organizationId, userId, request);
                return Ok(permission);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/permissions")]
        public async Task<ActionResult<List<Permission>>> GetPermissions(Guid organizationId, [FromQuery] PermissionFilter? filter = null)
        {
            try
            {
                var permissions = await _enterpriseAdminService.GetPermissionsAsync(organizationId, filter);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("permissions/{permissionId}")]
        public async Task<ActionResult<Permission>> GetPermission(Guid permissionId)
        {
            try
            {
                var permission = await _enterpriseAdminService.GetPermissionAsync(permissionId);
                return Ok(permission);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permission {PermissionId}", permissionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("permissions/{permissionId}")]
        public async Task<ActionResult<Permission>> UpdatePermission(Guid permissionId, UpdatePermissionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var permission = await _enterpriseAdminService.UpdatePermissionAsync(permissionId, userId, request);
                return Ok(permission);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission {PermissionId}", permissionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("permissions/{permissionId}")]
        public async Task<ActionResult> DeletePermission(Guid permissionId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeletePermissionAsync(permissionId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission {PermissionId}", permissionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("permissions/{permissionId}/assign/roles/{roleId}")]
        public async Task<ActionResult> AssignPermissionToRole(Guid permissionId, Guid roleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.AssignPermissionToRoleAsync(permissionId, roleId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permission {PermissionId} to role {RoleId}", permissionId, roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("permissions/{permissionId}/remove/roles/{roleId}")]
        public async Task<ActionResult> RemovePermissionFromRole(Guid permissionId, Guid roleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.RemovePermissionFromRoleAsync(permissionId, roleId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission {PermissionId} from role {RoleId}", permissionId, roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("roles/{roleId}/permissions")]
        public async Task<ActionResult<List<Permission>>> GetRolePermissions(Guid roleId)
        {
            try
            {
                var permissions = await _enterpriseAdminService.GetRolePermissionsAsync(roleId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting role permissions for {RoleId}", roleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId}/organizations/{organizationId}/permissions")]
        public async Task<ActionResult<List<Permission>>> GetUserPermissions(Guid userId, Guid organizationId)
        {
            try
            {
                var permissions = await _enterpriseAdminService.GetUserPermissionsAsync(userId, organizationId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user permissions for {UserId} in {OrganizationId}", userId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId}/organizations/{organizationId}/permissions/{permissionName}/check")]
        public async Task<ActionResult<bool>> CheckUserPermission(Guid userId, Guid organizationId, string permissionName)
        {
            try
            {
                var hasPermission = await _enterpriseAdminService.CheckUserPermissionAsync(userId, organizationId, permissionName);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user permission {PermissionName} for {UserId} in {OrganizationId}", permissionName, userId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Audit Logging
        [HttpGet("audit-logs")]
        public async Task<ActionResult<List<AuditLog>>> GetAuditLogs([FromQuery] AuditLogFilter? filter = null)
        {
            try
            {
                var logs = await _enterpriseAdminService.GetAuditLogsAsync(filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit logs");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("audit-logs/{auditLogId}")]
        public async Task<ActionResult<AuditLog>> GetAuditLog(Guid auditLogId)
        {
            try
            {
                var log = await _enterpriseAdminService.GetAuditLogAsync(auditLogId);
                return Ok(log);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit log {AuditLogId}", auditLogId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId}/audit-logs")]
        public async Task<ActionResult<List<AuditLog>>> GetUserAuditLogs(Guid userId, [FromQuery] UserAuditLogFilter? filter = null)
        {
            try
            {
                var logs = await _enterpriseAdminService.GetUserAuditLogsAsync(userId, filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user audit logs for {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/audit-logs")]
        public async Task<ActionResult<List<AuditLog>>> GetOrganizationAuditLogs(Guid organizationId, [FromQuery] OrganizationAuditLogFilter? filter = null)
        {
            try
            {
                var logs = await _enterpriseAdminService.GetOrganizationAuditLogsAsync(organizationId, filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting organization audit logs for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("audit-logs/resource/{resourceType}/{resourceId}")]
        public async Task<ActionResult<List<AuditLog>>> GetResourceAuditLogs(string resourceType, Guid resourceId, [FromQuery] ResourceAuditLogFilter? filter = null)
        {
            try
            {
                var logs = await _enterpriseAdminService.GetResourceAuditLogsAsync(resourceType, resourceId, filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource audit logs for {ResourceType} {ResourceId}", resourceType, resourceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("audit-logs/report")]
        public async Task<ActionResult<AuditReport>> GenerateAuditReport(AuditReportRequest request)
        {
            try
            {
                var report = await _enterpriseAdminService.GenerateAuditReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating audit report");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("audit-logs/export")]
        public async Task<ActionResult> ExportAuditLogs(ExportAuditLogsRequest request)
        {
            try
            {
                var success = await _enterpriseAdminService.ExportAuditLogsAsync(request);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting audit logs");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Security Compliance
        [HttpPost("organizations/{organizationId}/compliance-check")]
        public async Task<ActionResult<ComplianceCheck>> RunComplianceCheck(Guid organizationId, ComplianceCheckRequest request)
        {
            try
            {
                var check = await _enterpriseAdminService.RunComplianceCheckAsync(organizationId, request);
                return Ok(check);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running compliance check for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/compliance-checks")]
        public async Task<ActionResult<List<ComplianceCheck>>> GetComplianceChecks(Guid organizationId, [FromQuery] ComplianceCheckFilter? filter = null)
        {
            try
            {
                var checks = await _enterpriseAdminService.GetComplianceChecksAsync(organizationId, filter);
                return Ok(checks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance checks for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("compliance-checks/{checkId}")]
        public async Task<ActionResult<ComplianceCheck>> GetComplianceCheck(Guid checkId)
        {
            try
            {
                var check = await _enterpriseAdminService.GetComplianceCheckAsync(checkId);
                return Ok(check);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance check {CheckId}", checkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/compliance-report")]
        public async Task<ActionResult<ComplianceReport>> GenerateComplianceReport(Guid organizationId, ComplianceReportRequest request)
        {
            try
            {
                var report = await _enterpriseAdminService.GenerateComplianceReportAsync(organizationId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating compliance report for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/compliance-issues")]
        public async Task<ActionResult<List<ComplianceIssue>>> GetComplianceIssues(Guid organizationId, [FromQuery] ComplianceIssueFilter? filter = null)
        {
            try
            {
                var issues = await _enterpriseAdminService.GetComplianceIssuesAsync(organizationId, filter);
                return Ok(issues);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance issues for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("compliance-issues/{issueId}/resolve")]
        public async Task<ActionResult> ResolveComplianceIssue(Guid issueId, ResolveComplianceIssueRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.ResolveComplianceIssueAsync(issueId, userId, request);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving compliance issue {IssueId}", issueId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/compliance-score")]
        public async Task<ActionResult<ComplianceScore>> GetComplianceScore(Guid organizationId)
        {
            try
            {
                var score = await _enterpriseAdminService.GetComplianceScoreAsync(organizationId);
                return Ok(score);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting compliance score for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Security Policies
        [HttpPost("organizations/{organizationId}/security-policies")]
        public async Task<ActionResult<SecurityPolicy>> CreateSecurityPolicy(Guid organizationId, CreateSecurityPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _enterpriseAdminService.CreateSecurityPolicyAsync(organizationId, userId, request);
                return Ok(policy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating security policy for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/security-policies")]
        public async Task<ActionResult<List<SecurityPolicy>>> GetSecurityPolicies(Guid organizationId, [FromQuery] SecurityPolicyFilter? filter = null)
        {
            try
            {
                var policies = await _enterpriseAdminService.GetSecurityPoliciesAsync(organizationId, filter);
                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security policies for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("security-policies/{policyId}")]
        public async Task<ActionResult<SecurityPolicy>> GetSecurityPolicy(Guid policyId)
        {
            try
            {
                var policy = await _enterpriseAdminService.GetSecurityPolicyAsync(policyId);
                return Ok(policy);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("security-policies/{policyId}")]
        public async Task<ActionResult<SecurityPolicy>> UpdateSecurityPolicy(Guid policyId, UpdateSecurityPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _enterpriseAdminService.UpdateSecurityPolicyAsync(policyId, userId, request);
                return Ok(policy);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating security policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("security-policies/{policyId}")]
        public async Task<ActionResult> DeleteSecurityPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeleteSecurityPolicyAsync(policyId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting security policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("security-policies/{policyId}/enforce")]
        public async Task<ActionResult> EnforceSecurityPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.EnforceSecurityPolicyAsync(policyId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enforcing security policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/security-violations")]
        public async Task<ActionResult<List<SecurityViolation>>> GetSecurityViolations(Guid organizationId, [FromQuery] SecurityViolationFilter? filter = null)
        {
            try
            {
                var violations = await _enterpriseAdminService.GetSecurityViolationsAsync(organizationId, filter);
                return Ok(violations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security violations for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Authentication & SSO
        [HttpPost("organizations/{organizationId}/sso-configurations")]
        public async Task<ActionResult<SsoConfiguration>> CreateSsoConfiguration(Guid organizationId, CreateSsoConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var config = await _enterpriseAdminService.CreateSsoConfigurationAsync(organizationId, userId, request);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SSO configuration for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sso-configurations")]
        public async Task<ActionResult<List<SsoConfiguration>>> GetSsoConfigurations(Guid organizationId)
        {
            try
            {
                var configs = await _enterpriseAdminService.GetSsoConfigurationsAsync(organizationId);
                return Ok(configs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SSO configurations for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sso-configurations/{configId}")]
        public async Task<ActionResult<SsoConfiguration>> GetSsoConfiguration(Guid configId)
        {
            try
            {
                var config = await _enterpriseAdminService.GetSsoConfigurationAsync(configId);
                return Ok(config);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SSO configuration {ConfigId}", configId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("sso-configurations/{configId}")]
        public async Task<ActionResult<SsoConfiguration>> UpdateSsoConfiguration(Guid configId, UpdateSsoConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var config = await _enterpriseAdminService.UpdateSsoConfigurationAsync(configId, userId, request);
                return Ok(config);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SSO configuration {ConfigId}", configId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("sso-configurations/{configId}")]
        public async Task<ActionResult> DeleteSsoConfiguration(Guid configId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.DeleteSsoConfigurationAsync(configId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SSO configuration {ConfigId}", configId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("sso-configurations/{configId}/test")]
        public async Task<ActionResult> TestSsoConfiguration(Guid configId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.TestSsoConfigurationAsync(configId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing SSO configuration {ConfigId}", configId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/sso-login")]
        public async Task<ActionResult<SsoSession>> InitiateSsoLogin(Guid organizationId, SsoLoginRequest request)
        {
            try
            {
                var session = await _enterpriseAdminService.InitiateSsoLoginAsync(organizationId, request);
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating SSO login for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("sso-sessions/{sessionId}/complete")]
        public async Task<ActionResult<SsoSession>> CompleteSsoLogin(Guid sessionId, CompleteSsoLoginRequest request)
        {
            try
            {
                var session = await _enterpriseAdminService.CompleteSsoLoginAsync(sessionId, request);
                return Ok(session);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing SSO login for session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Multi-Factor Authentication
        [HttpPost("organizations/{organizationId}/mfa-configuration")]
        public async Task<ActionResult<MfaConfiguration>> CreateMfaConfiguration(Guid organizationId, CreateMfaConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var config = await _enterpriseAdminService.CreateMfaConfigurationAsync(organizationId, userId, request);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating MFA configuration for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/mfa-configuration")]
        public async Task<ActionResult<MfaConfiguration>> GetMfaConfiguration(Guid organizationId)
        {
            try
            {
                var config = await _enterpriseAdminService.GetMfaConfigurationAsync(organizationId);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting MFA configuration for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("organizations/{organizationId}/mfa-configuration")]
        public async Task<ActionResult<MfaConfiguration>> UpdateMfaConfiguration(Guid organizationId, UpdateMfaConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var config = await _enterpriseAdminService.UpdateMfaConfigurationAsync(organizationId, userId, request);
                return Ok(config);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating MFA configuration for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/mfa-enforcement")]
        public async Task<ActionResult> EnforceMfaForOrganization(Guid organizationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _enterpriseAdminService.EnforceMfaForOrganizationAsync(organizationId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enforcing MFA for {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("users/{userId}/mfa-token")]
        public async Task<ActionResult<MfaToken>> GenerateMfaToken(Guid userId, GenerateMfaTokenRequest request)
        {
            try
            {
                var token = await _enterpriseAdminService.GenerateMfaTokenAsync(userId, request);
                return Ok(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating MFA token for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("users/{userId}/mfa-verify")]
        public async Task<ActionResult> VerifyMfaToken(Guid userId, VerifyMfaTokenRequest request)
        {
            try
            {
                var success = await _enterpriseAdminService.VerifyMfaTokenAsync(userId, request);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying MFA token for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}