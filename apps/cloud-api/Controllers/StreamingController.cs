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
    public class StreamingController : ControllerBase
    {
        private readonly IStreamingService _streamingService;
        private readonly ILogger<StreamingController> _logger;

        public StreamingController(
            IStreamingService streamingService,
            ILogger<StreamingController> logger)
        {
            _streamingService = streamingService;
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

        // Stream Management
        [HttpPost("organizations/{organizationId}/channels")]
        public async Task<ActionResult<StreamChannel>> CreateStreamChannel(Guid organizationId, CreateStreamChannelRequest request)
        {
            try
            {
                var userId = GetUserId();
                var channel = await _streamingService.CreateStreamChannelAsync(organizationId, userId, request);
                return Ok(channel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream channel for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/channels")]
        public async Task<ActionResult<List<StreamChannel>>> GetStreamChannels(Guid organizationId, [FromQuery] StreamChannelFilter filter)
        {
            try
            {
                var channels = await _streamingService.GetStreamChannelsAsync(organizationId, filter);
                return Ok(channels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream channels for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}")]
        public async Task<ActionResult<StreamChannel>> GetStreamChannel(Guid channelId)
        {
            try
            {
                var channel = await _streamingService.GetStreamChannelAsync(channelId);
                return Ok(channel);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("channels/{channelId}")]
        public async Task<ActionResult<StreamChannel>> UpdateStreamChannel(Guid channelId, UpdateStreamChannelRequest request)
        {
            try
            {
                var userId = GetUserId();
                var channel = await _streamingService.UpdateStreamChannelAsync(channelId, userId, request);
                return Ok(channel);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stream channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("channels/{channelId}")]
        public async Task<ActionResult> DeleteStreamChannel(Guid channelId)
        {
            try
            {
                var userId = GetUserId();
                await _streamingService.DeleteStreamChannelAsync(channelId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting stream channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/start")]
        public async Task<ActionResult> StartStream(Guid channelId, StartStreamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.StartStreamAsync(channelId, userId, request);
                return Ok(new { success, message = success ? "Stream started successfully" : "Failed to start stream" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting stream for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/stop")]
        public async Task<ActionResult> StopStream(Guid channelId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.StopStreamAsync(channelId, userId);
                return Ok(new { success, message = success ? "Stream stopped successfully" : "Failed to stop stream" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping stream for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/metrics")]
        public async Task<ActionResult<StreamMetrics>> GetStreamMetrics(Guid channelId, [FromQuery] StreamMetricsFilter filter)
        {
            try
            {
                var metrics = await _streamingService.GetStreamMetricsAsync(channelId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream metrics for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Live Streaming
        [HttpPost("channels/{channelId}/live-streams")]
        public async Task<ActionResult<LiveStream>> CreateLiveStream(Guid channelId, CreateLiveStreamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var stream = await _streamingService.CreateLiveStreamAsync(channelId, userId, request);
                return Ok(stream);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating live stream for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/live-streams")]
        public async Task<ActionResult<List<LiveStream>>> GetLiveStreams(Guid organizationId, [FromQuery] LiveStreamFilter filter)
        {
            try
            {
                var streams = await _streamingService.GetLiveStreamsAsync(organizationId, filter);
                return Ok(streams);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live streams for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("streams/{streamId}")]
        public async Task<ActionResult<LiveStream>> GetLiveStream(Guid streamId)
        {
            try
            {
                var stream = await _streamingService.GetLiveStreamAsync(streamId);
                return Ok(stream);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("streams/{streamId}")]
        public async Task<ActionResult<LiveStream>> UpdateLiveStream(Guid streamId, UpdateLiveStreamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var stream = await _streamingService.UpdateLiveStreamAsync(streamId, userId, request);
                return Ok(stream);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating live stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("streams/{streamId}/end")]
        public async Task<ActionResult> EndLiveStream(Guid streamId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.EndLiveStreamAsync(streamId, userId);
                return Ok(new { success, message = success ? "Stream ended successfully" : "Failed to end stream" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending live stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("streams/{streamId}/viewers")]
        public async Task<ActionResult<List<StreamViewer>>> GetStreamViewers(Guid streamId, [FromQuery] StreamViewerFilter filter)
        {
            try
            {
                var viewers = await _streamingService.GetStreamViewersAsync(streamId, filter);
                return Ok(viewers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream viewers for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("streams/{streamId}/analytics")]
        public async Task<ActionResult<StreamAnalytics>> GetLiveStreamAnalytics(Guid streamId, [FromQuery] StreamAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _streamingService.GetLiveStreamAnalyticsAsync(streamId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live stream analytics for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Recording & VOD
        [HttpPost("streams/{streamId}/recordings")]
        public async Task<ActionResult<StreamRecording>> CreateStreamRecording(Guid streamId, CreateStreamRecordingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var recording = await _streamingService.CreateStreamRecordingAsync(streamId, userId, request);
                return Ok(recording);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream recording for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/recordings")]
        public async Task<ActionResult<List<StreamRecording>>> GetStreamRecordings(Guid channelId, [FromQuery] StreamRecordingFilter filter)
        {
            try
            {
                var recordings = await _streamingService.GetStreamRecordingsAsync(channelId, filter);
                return Ok(recordings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream recordings for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recordings/{recordingId}")]
        public async Task<ActionResult<StreamRecording>> GetStreamRecording(Guid recordingId)
        {
            try
            {
                var recording = await _streamingService.GetStreamRecordingAsync(recordingId);
                return Ok(recording);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream recording {RecordingId}", recordingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("recordings/{recordingId}")]
        public async Task<ActionResult<StreamRecording>> UpdateStreamRecording(Guid recordingId, UpdateStreamRecordingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var recording = await _streamingService.UpdateStreamRecordingAsync(recordingId, userId, request);
                return Ok(recording);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stream recording {RecordingId}", recordingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("recordings/{recordingId}")]
        public async Task<ActionResult> DeleteStreamRecording(Guid recordingId)
        {
            try
            {
                var userId = GetUserId();
                await _streamingService.DeleteStreamRecordingAsync(recordingId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting stream recording {RecordingId}", recordingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("recordings/{recordingId}/process")]
        public async Task<ActionResult> ProcessRecording(Guid recordingId, ProcessRecordingRequest request)
        {
            try
            {
                var success = await _streamingService.ProcessRecordingAsync(recordingId, request);
                return Ok(new { success, message = success ? "Recording processed successfully" : "Failed to process recording" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recording {RecordingId}", recordingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recordings/{recordingId}/segments")]
        public async Task<ActionResult<List<RecordingSegment>>> GetRecordingSegments(Guid recordingId)
        {
            try
            {
                var segments = await _streamingService.GetRecordingSegmentsAsync(recordingId);
                return Ok(segments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recording segments for recording {RecordingId}", recordingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Content Creation
        [HttpPost("organizations/{organizationId}/projects")]
        public async Task<ActionResult<ContentProject>> CreateContentProject(Guid organizationId, CreateContentProjectRequest request)
        {
            try
            {
                var userId = GetUserId();
                var project = await _streamingService.CreateContentProjectAsync(organizationId, userId, request);
                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating content project for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/projects")]
        public async Task<ActionResult<List<ContentProject>>> GetContentProjects(Guid organizationId, [FromQuery] ContentProjectFilter filter)
        {
            try
            {
                var projects = await _streamingService.GetContentProjectsAsync(organizationId, filter);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content projects for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("projects/{projectId}")]
        public async Task<ActionResult<ContentProject>> GetContentProject(Guid projectId)
        {
            try
            {
                var project = await _streamingService.GetContentProjectAsync(projectId);
                return Ok(project);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("projects/{projectId}")]
        public async Task<ActionResult<ContentProject>> UpdateContentProject(Guid projectId, UpdateContentProjectRequest request)
        {
            try
            {
                var userId = GetUserId();
                var project = await _streamingService.UpdateContentProjectAsync(projectId, userId, request);
                return Ok(project);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating content project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("projects/{projectId}")]
        public async Task<ActionResult> DeleteContentProject(Guid projectId)
        {
            try
            {
                var userId = GetUserId();
                await _streamingService.DeleteContentProjectAsync(projectId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting content project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("projects/{projectId}/render")]
        public async Task<ActionResult> RenderContentProject(Guid projectId, RenderContentProjectRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.RenderContentProjectAsync(projectId, userId, request);
                return Ok(new { success, message = success ? "Project rendered successfully" : "Failed to render project" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rendering content project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("projects/{projectId}/assets")]
        public async Task<ActionResult<List<ContentAsset>>> GetContentAssets(Guid projectId, [FromQuery] ContentAssetFilter filter)
        {
            try
            {
                var assets = await _streamingService.GetContentAssetsAsync(projectId, filter);
                return Ok(assets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content assets for project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Analytics & Reporting
        [HttpGet("channels/{channelId}/analytics")]
        public async Task<ActionResult<StreamAnalytics>> GetStreamAnalytics(Guid channelId, [FromQuery] StreamAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _streamingService.GetStreamAnalyticsAsync(channelId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream analytics for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("content/{contentId}/analytics")]
        public async Task<ActionResult<ContentAnalytics>> GetContentAnalytics(Guid contentId, [FromQuery] ContentAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _streamingService.GetContentAnalyticsAsync(contentId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content analytics for content {ContentId}", contentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/viewer-analytics")]
        public async Task<ActionResult<ViewerAnalytics>> GetViewerAnalytics(Guid channelId, [FromQuery] ViewerAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _streamingService.GetViewerAnalyticsAsync(channelId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting viewer analytics for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/engagement-metrics")]
        public async Task<ActionResult<EngagementMetrics>> GetEngagementMetrics(Guid channelId, [FromQuery] EngagementMetricsFilter filter)
        {
            try
            {
                var metrics = await _streamingService.GetEngagementMetricsAsync(channelId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement metrics for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/revenue-analytics")]
        public async Task<ActionResult<RevenueAnalytics>> GetRevenueAnalytics(Guid channelId, [FromQuery] RevenueAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _streamingService.GetRevenueAnalyticsAsync(channelId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue analytics for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/reports")]
        public async Task<ActionResult<StreamReport>> GenerateStreamReport(Guid channelId, GenerateStreamReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _streamingService.GenerateStreamReportAsync(channelId, userId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating stream report for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/insights")]
        public async Task<ActionResult<List<StreamInsight>>> GetStreamInsights(Guid channelId, [FromQuery] StreamInsightFilter filter)
        {
            try
            {
                var insights = await _streamingService.GetStreamInsightsAsync(channelId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream insights for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Monetization
        [HttpPost("channels/{channelId}/donations")]
        public async Task<ActionResult<StreamDonation>> CreateStreamDonation(Guid channelId, CreateStreamDonationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var donation = await _streamingService.CreateStreamDonationAsync(channelId, userId, request);
                return Ok(donation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream donation for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/donations")]
        public async Task<ActionResult<List<StreamDonation>>> GetStreamDonations(Guid channelId, [FromQuery] StreamDonationFilter filter)
        {
            try
            {
                var donations = await _streamingService.GetStreamDonationsAsync(channelId, filter);
                return Ok(donations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream donations for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/subscriptions")]
        public async Task<ActionResult<StreamSubscription>> CreateStreamSubscription(Guid channelId, CreateStreamSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var subscription = await _streamingService.CreateStreamSubscriptionAsync(channelId, userId, request);
                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream subscription for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/subscriptions")]
        public async Task<ActionResult<List<StreamSubscription>>> GetStreamSubscriptions(Guid channelId, [FromQuery] StreamSubscriptionFilter filter)
        {
            try
            {
                var subscriptions = await _streamingService.GetStreamSubscriptionsAsync(channelId, filter);
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream subscriptions for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/revenue")]
        public async Task<ActionResult<StreamRevenue>> GetStreamRevenue(Guid channelId, [FromQuery] StreamRevenueFilter filter)
        {
            try
            {
                var revenue = await _streamingService.GetStreamRevenueAsync(channelId, filter);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream revenue for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Content Library
        [HttpPost("organizations/{organizationId}/libraries")]
        public async Task<ActionResult<ContentLibrary>> CreateContentLibrary(Guid organizationId, CreateContentLibraryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var library = await _streamingService.CreateContentLibraryAsync(organizationId, userId, request);
                return Ok(library);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating content library for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/libraries")]
        public async Task<ActionResult<List<ContentLibrary>>> GetContentLibraries(Guid organizationId, [FromQuery] ContentLibraryFilter filter)
        {
            try
            {
                var libraries = await _streamingService.GetContentLibrariesAsync(organizationId, filter);
                return Ok(libraries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content libraries for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("libraries/{libraryId}/items")]
        public async Task<ActionResult<ContentItem>> UploadContentItem(Guid libraryId, UploadContentItemRequest request)
        {
            try
            {
                var userId = GetUserId();
                var item = await _streamingService.UploadContentItemAsync(libraryId, userId, request);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading content item to library {LibraryId}", libraryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("libraries/{libraryId}/items")]
        public async Task<ActionResult<List<ContentItem>>> GetContentItems(Guid libraryId, [FromQuery] ContentItemFilter filter)
        {
            try
            {
                var items = await _streamingService.GetContentItemsAsync(libraryId, filter);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content items for library {LibraryId}", libraryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Highlights & Clips
        [HttpPost("streams/{streamId}/highlights")]
        public async Task<ActionResult<StreamHighlight>> CreateStreamHighlight(Guid streamId, CreateStreamHighlightRequest request)
        {
            try
            {
                var userId = GetUserId();
                var highlight = await _streamingService.CreateStreamHighlightAsync(streamId, userId, request);
                return Ok(highlight);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream highlight for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("streams/{streamId}/highlights")]
        public async Task<ActionResult<List<StreamHighlight>>> GetStreamHighlights(Guid streamId, [FromQuery] StreamHighlightFilter filter)
        {
            try
            {
                var highlights = await _streamingService.GetStreamHighlightsAsync(streamId, filter);
                return Ok(highlights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream highlights for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("streams/{streamId}/clips")]
        public async Task<ActionResult<StreamClip>> CreateStreamClip(Guid streamId, CreateStreamClipRequest request)
        {
            try
            {
                var userId = GetUserId();
                var clip = await _streamingService.CreateStreamClipAsync(streamId, userId, request);
                return Ok(clip);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream clip for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("streams/{streamId}/clips")]
        public async Task<ActionResult<List<StreamClip>>> GetStreamClips(Guid streamId, [FromQuery] StreamClipFilter filter)
        {
            try
            {
                var clips = await _streamingService.GetStreamClipsAsync(streamId, filter);
                return Ok(clips);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream clips for stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("clips/{clipId}/share")]
        public async Task<ActionResult> ShareStreamClip(Guid clipId, ShareStreamClipRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.ShareStreamClipAsync(clipId, userId, request);
                return Ok(new { success, message = success ? "Clip shared successfully" : "Failed to share clip" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sharing stream clip {ClipId}", clipId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Stream Overlay & Graphics
        [HttpPost("channels/{channelId}/overlays")]
        public async Task<ActionResult<StreamOverlay>> CreateStreamOverlay(Guid channelId, CreateStreamOverlayRequest request)
        {
            try
            {
                var userId = GetUserId();
                var overlay = await _streamingService.CreateStreamOverlayAsync(channelId, userId, request);
                return Ok(overlay);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stream overlay for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/overlays")]
        public async Task<ActionResult<List<StreamOverlay>>> GetStreamOverlays(Guid channelId, [FromQuery] StreamOverlayFilter filter)
        {
            try
            {
                var overlays = await _streamingService.GetStreamOverlaysAsync(channelId, filter);
                return Ok(overlays);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stream overlays for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("overlays/{overlayId}/activate")]
        public async Task<ActionResult> ActivateStreamOverlay(Guid overlayId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.ActivateStreamOverlayAsync(overlayId, userId);
                return Ok(new { success, message = success ? "Overlay activated successfully" : "Failed to activate overlay" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating stream overlay {OverlayId}", overlayId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("overlays/{overlayId}/deactivate")]
        public async Task<ActionResult> DeactivateStreamOverlay(Guid overlayId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.DeactivateStreamOverlayAsync(overlayId, userId);
                return Ok(new { success, message = success ? "Overlay deactivated successfully" : "Failed to deactivate overlay" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating stream overlay {OverlayId}", overlayId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Chat & Interaction
        [HttpPost("channels/{channelId}/chat")]
        public async Task<ActionResult<ChatRoom>> CreateChatRoom(Guid channelId, CreateChatRoomRequest request)
        {
            try
            {
                var userId = GetUserId();
                var chatRoom = await _streamingService.CreateChatRoomAsync(channelId, userId, request);
                return Ok(chatRoom);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating chat room for channel {ChannelId}", channelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("chat/{chatRoomId}/messages")]
        public async Task<ActionResult<ChatMessage>> SendChatMessage(Guid chatRoomId, SendChatMessageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var message = await _streamingService.SendChatMessageAsync(chatRoomId, userId, request);
                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending chat message to chat room {ChatRoomId}", chatRoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("chat/{chatRoomId}/messages")]
        public async Task<ActionResult<List<ChatMessage>>> GetChatMessages(Guid chatRoomId, [FromQuery] ChatMessageFilter filter)
        {
            try
            {
                var messages = await _streamingService.GetChatMessagesAsync(chatRoomId, filter);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat messages for chat room {ChatRoomId}", chatRoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("chat/messages/{messageId}/moderate")]
        public async Task<ActionResult> ModerateChatMessage(Guid messageId, ModerateChatMessageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _streamingService.ModerateChatMessageAsync(messageId, userId, request);
                return Ok(new { success, message = success ? "Message moderated successfully" : "Failed to moderate message" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moderating chat message {MessageId}", messageId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}