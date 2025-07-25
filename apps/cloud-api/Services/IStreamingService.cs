using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IStreamingService
    {
        // Stream Management
        Task<StreamChannel> CreateStreamChannelAsync(Guid organizationId, Guid userId, CreateStreamChannelRequest request);
        Task<List<StreamChannel>> GetStreamChannelsAsync(Guid organizationId, StreamChannelFilter? filter = null);
        Task<StreamChannel> GetStreamChannelAsync(Guid channelId);
        Task<StreamChannel> UpdateStreamChannelAsync(Guid channelId, Guid userId, UpdateStreamChannelRequest request);
        Task<bool> DeleteStreamChannelAsync(Guid channelId, Guid userId);
        Task<bool> StartStreamAsync(Guid channelId, Guid userId, StartStreamRequest request);
        Task<bool> StopStreamAsync(Guid channelId, Guid userId);
        Task<StreamMetrics> GetStreamMetricsAsync(Guid channelId, StreamMetricsFilter filter);

        // Live Streaming
        Task<LiveStream> CreateLiveStreamAsync(Guid channelId, Guid userId, CreateLiveStreamRequest request);
        Task<List<LiveStream>> GetLiveStreamsAsync(Guid organizationId, LiveStreamFilter? filter = null);
        Task<LiveStream> GetLiveStreamAsync(Guid streamId);
        Task<LiveStream> UpdateLiveStreamAsync(Guid streamId, Guid userId, UpdateLiveStreamRequest request);
        Task<bool> EndLiveStreamAsync(Guid streamId, Guid userId);
        Task<List<StreamViewer>> GetStreamViewersAsync(Guid streamId, StreamViewerFilter? filter = null);
        Task<StreamAnalytics> GetLiveStreamAnalyticsAsync(Guid streamId, StreamAnalyticsFilter filter);

        // Recording & VOD
        Task<StreamRecording> CreateStreamRecordingAsync(Guid streamId, Guid userId, CreateStreamRecordingRequest request);
        Task<List<StreamRecording>> GetStreamRecordingsAsync(Guid channelId, StreamRecordingFilter? filter = null);
        Task<StreamRecording> GetStreamRecordingAsync(Guid recordingId);
        Task<StreamRecording> UpdateStreamRecordingAsync(Guid recordingId, Guid userId, UpdateStreamRecordingRequest request);
        Task<bool> DeleteStreamRecordingAsync(Guid recordingId, Guid userId);
        Task<bool> ProcessRecordingAsync(Guid recordingId, ProcessRecordingRequest request);
        Task<List<RecordingSegment>> GetRecordingSegmentsAsync(Guid recordingId);

        // Content Creation
        Task<ContentProject> CreateContentProjectAsync(Guid organizationId, Guid userId, CreateContentProjectRequest request);
        Task<List<ContentProject>> GetContentProjectsAsync(Guid organizationId, ContentProjectFilter? filter = null);
        Task<ContentProject> GetContentProjectAsync(Guid projectId);
        Task<ContentProject> UpdateContentProjectAsync(Guid projectId, Guid userId, UpdateContentProjectRequest request);
        Task<bool> DeleteContentProjectAsync(Guid projectId, Guid userId);
        Task<bool> RenderContentProjectAsync(Guid projectId, Guid userId, RenderContentProjectRequest request);
        Task<List<ContentAsset>> GetContentAssetsAsync(Guid projectId, ContentAssetFilter? filter = null);

        // Video Editing
        Task<VideoEditingSession> CreateVideoEditingSessionAsync(Guid projectId, Guid userId, CreateVideoEditingSessionRequest request);
        Task<List<VideoEditingSession>> GetVideoEditingSessionsAsync(Guid projectId, VideoEditingSessionFilter? filter = null);
        Task<VideoEditingSession> GetVideoEditingSessionAsync(Guid sessionId);
        Task<VideoEditingSession> UpdateVideoEditingSessionAsync(Guid sessionId, Guid userId, UpdateVideoEditingSessionRequest request);
        Task<bool> DeleteVideoEditingSessionAsync(Guid sessionId, Guid userId);
        Task<bool> ApplyVideoEditAsync(Guid sessionId, Guid userId, ApplyVideoEditRequest request);
        Task<List<VideoClip>> GetVideoClipsAsync(Guid sessionId, VideoClipFilter? filter = null);

        // Audio Processing
        Task<AudioProcessingJob> CreateAudioProcessingJobAsync(Guid projectId, Guid userId, CreateAudioProcessingJobRequest request);
        Task<List<AudioProcessingJob>> GetAudioProcessingJobsAsync(Guid projectId, AudioProcessingJobFilter? filter = null);
        Task<AudioProcessingJob> GetAudioProcessingJobAsync(Guid jobId);
        Task<bool> CancelAudioProcessingJobAsync(Guid jobId, Guid userId);
        Task<AudioTrack> CreateAudioTrackAsync(Guid projectId, Guid userId, CreateAudioTrackRequest request);
        Task<List<AudioTrack>> GetAudioTracksAsync(Guid projectId, AudioTrackFilter? filter = null);
        Task<bool> MixAudioTracksAsync(Guid projectId, Guid userId, MixAudioTracksRequest request);

        // Thumbnail Generation
        Task<ThumbnailGenerationJob> CreateThumbnailGenerationJobAsync(Guid contentId, Guid userId, CreateThumbnailGenerationJobRequest request);
        Task<List<ThumbnailGenerationJob>> GetThumbnailGenerationJobsAsync(Guid contentId, ThumbnailGenerationJobFilter? filter = null);
        Task<ThumbnailGenerationJob> GetThumbnailGenerationJobAsync(Guid jobId);
        Task<bool> CancelThumbnailGenerationJobAsync(Guid jobId, Guid userId);
        Task<List<Thumbnail>> GetThumbnailsAsync(Guid contentId, ThumbnailFilter? filter = null);
        Task<bool> SetDefaultThumbnailAsync(Guid contentId, Guid thumbnailId, Guid userId);

        // Stream Overlay & Graphics
        Task<StreamOverlay> CreateStreamOverlayAsync(Guid channelId, Guid userId, CreateStreamOverlayRequest request);
        Task<List<StreamOverlay>> GetStreamOverlaysAsync(Guid channelId, StreamOverlayFilter? filter = null);
        Task<StreamOverlay> GetStreamOverlayAsync(Guid overlayId);
        Task<StreamOverlay> UpdateStreamOverlayAsync(Guid overlayId, Guid userId, UpdateStreamOverlayRequest request);
        Task<bool> DeleteStreamOverlayAsync(Guid overlayId, Guid userId);
        Task<bool> ActivateStreamOverlayAsync(Guid overlayId, Guid userId);
        Task<bool> DeactivateStreamOverlayAsync(Guid overlayId, Guid userId);

        // Chat & Interaction
        Task<ChatRoom> CreateChatRoomAsync(Guid channelId, Guid userId, CreateChatRoomRequest request);
        Task<List<ChatRoom>> GetChatRoomsAsync(Guid channelId, ChatRoomFilter? filter = null);
        Task<ChatRoom> GetChatRoomAsync(Guid chatRoomId);
        Task<ChatRoom> UpdateChatRoomAsync(Guid chatRoomId, Guid userId, UpdateChatRoomRequest request);
        Task<bool> DeleteChatRoomAsync(Guid chatRoomId, Guid userId);
        Task<ChatMessage> SendChatMessageAsync(Guid chatRoomId, Guid userId, SendChatMessageRequest request);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatRoomId, ChatMessageFilter? filter = null);
        Task<bool> ModerateChatMessageAsync(Guid messageId, Guid userId, ModerateChatMessageRequest request);

        // Monetization
        Task<StreamDonation> CreateStreamDonationAsync(Guid channelId, Guid userId, CreateStreamDonationRequest request);
        Task<List<StreamDonation>> GetStreamDonationsAsync(Guid channelId, StreamDonationFilter? filter = null);
        Task<StreamDonation> GetStreamDonationAsync(Guid donationId);
        Task<bool> ProcessStreamDonationAsync(Guid donationId, ProcessStreamDonationRequest request);
        Task<StreamSubscription> CreateStreamSubscriptionAsync(Guid channelId, Guid userId, CreateStreamSubscriptionRequest request);
        Task<List<StreamSubscription>> GetStreamSubscriptionsAsync(Guid channelId, StreamSubscriptionFilter? filter = null);
        Task<StreamRevenue> GetStreamRevenueAsync(Guid channelId, StreamRevenueFilter filter);

        // Content Library
        Task<ContentLibrary> CreateContentLibraryAsync(Guid organizationId, Guid userId, CreateContentLibraryRequest request);
        Task<List<ContentLibrary>> GetContentLibrariesAsync(Guid organizationId, ContentLibraryFilter? filter = null);
        Task<ContentLibrary> GetContentLibraryAsync(Guid libraryId);
        Task<ContentLibrary> UpdateContentLibraryAsync(Guid libraryId, Guid userId, UpdateContentLibraryRequest request);
        Task<bool> DeleteContentLibraryAsync(Guid libraryId, Guid userId);
        Task<ContentItem> UploadContentItemAsync(Guid libraryId, Guid userId, UploadContentItemRequest request);
        Task<List<ContentItem>> GetContentItemsAsync(Guid libraryId, ContentItemFilter? filter = null);
        Task<bool> DeleteContentItemAsync(Guid itemId, Guid userId);

        // Highlights & Clips
        Task<StreamHighlight> CreateStreamHighlightAsync(Guid streamId, Guid userId, CreateStreamHighlightRequest request);
        Task<List<StreamHighlight>> GetStreamHighlightsAsync(Guid streamId, StreamHighlightFilter? filter = null);
        Task<StreamHighlight> GetStreamHighlightAsync(Guid highlightId);
        Task<StreamHighlight> UpdateStreamHighlightAsync(Guid highlightId, Guid userId, UpdateStreamHighlightRequest request);
        Task<bool> DeleteStreamHighlightAsync(Guid highlightId, Guid userId);
        Task<StreamClip> CreateStreamClipAsync(Guid streamId, Guid userId, CreateStreamClipRequest request);
        Task<List<StreamClip>> GetStreamClipsAsync(Guid streamId, StreamClipFilter? filter = null);
        Task<bool> ShareStreamClipAsync(Guid clipId, Guid userId, ShareStreamClipRequest request);

        // Multi-Platform Publishing
        Task<PublishingTarget> CreatePublishingTargetAsync(Guid organizationId, Guid userId, CreatePublishingTargetRequest request);
        Task<List<PublishingTarget>> GetPublishingTargetsAsync(Guid organizationId, PublishingTargetFilter? filter = null);
        Task<PublishingTarget> GetPublishingTargetAsync(Guid targetId);
        Task<PublishingTarget> UpdatePublishingTargetAsync(Guid targetId, Guid userId, UpdatePublishingTargetRequest request);
        Task<bool> DeletePublishingTargetAsync(Guid targetId, Guid userId);
        Task<PublishingJob> PublishContentAsync(Guid contentId, Guid targetId, Guid userId, PublishContentRequest request);
        Task<List<PublishingJob>> GetPublishingJobsAsync(Guid organizationId, PublishingJobFilter? filter = null);

        // Analytics & Reporting
        Task<StreamAnalytics> GetStreamAnalyticsAsync(Guid channelId, StreamAnalyticsFilter filter);
        Task<ContentAnalytics> GetContentAnalyticsAsync(Guid contentId, ContentAnalyticsFilter filter);
        Task<ViewerAnalytics> GetViewerAnalyticsAsync(Guid channelId, ViewerAnalyticsFilter filter);
        Task<EngagementMetrics> GetEngagementMetricsAsync(Guid channelId, EngagementMetricsFilter filter);
        Task<RevenueAnalytics> GetRevenueAnalyticsAsync(Guid channelId, RevenueAnalyticsFilter filter);
        Task<StreamReport> GenerateStreamReportAsync(Guid channelId, Guid userId, GenerateStreamReportRequest request);
        Task<List<StreamInsight>> GetStreamInsightsAsync(Guid channelId, StreamInsightFilter? filter = null);

        // Collaboration
        Task<CollaborationInvite> CreateCollaborationInviteAsync(Guid projectId, Guid userId, CreateCollaborationInviteRequest request);
        Task<List<CollaborationInvite>> GetCollaborationInvitesAsync(Guid projectId, CollaborationInviteFilter? filter = null);
        Task<bool> AcceptCollaborationInviteAsync(Guid inviteId, Guid userId);
        Task<bool> DeclineCollaborationInviteAsync(Guid inviteId, Guid userId);
        Task<List<Collaborator>> GetCollaboratorsAsync(Guid projectId, CollaboratorFilter? filter = null);
        Task<bool> RemoveCollaboratorAsync(Guid projectId, Guid collaboratorId, Guid userId);
        Task<List<CollaborationActivity>> GetCollaborationActivitiesAsync(Guid projectId, CollaborationActivityFilter? filter = null);

        // Automation & Scheduling
        Task<StreamSchedule> CreateStreamScheduleAsync(Guid channelId, Guid userId, CreateStreamScheduleRequest request);
        Task<List<StreamSchedule>> GetStreamSchedulesAsync(Guid channelId, StreamScheduleFilter? filter = null);
        Task<StreamSchedule> GetStreamScheduleAsync(Guid scheduleId);
        Task<StreamSchedule> UpdateStreamScheduleAsync(Guid scheduleId, Guid userId, UpdateStreamScheduleRequest request);
        Task<bool> DeleteStreamScheduleAsync(Guid scheduleId, Guid userId);
        Task<AutomationRule> CreateAutomationRuleAsync(Guid channelId, Guid userId, CreateAutomationRuleRequest request);
        Task<List<AutomationRule>> GetAutomationRulesAsync(Guid channelId, AutomationRuleFilter? filter = null);
        Task<bool> ExecuteAutomationRuleAsync(Guid ruleId, Guid userId);

        // Quality & Encoding
        Task<EncodingProfile> CreateEncodingProfileAsync(Guid organizationId, Guid userId, CreateEncodingProfileRequest request);
        Task<List<EncodingProfile>> GetEncodingProfilesAsync(Guid organizationId, EncodingProfileFilter? filter = null);
        Task<EncodingProfile> GetEncodingProfileAsync(Guid profileId);
        Task<EncodingProfile> UpdateEncodingProfileAsync(Guid profileId, Guid userId, UpdateEncodingProfileRequest request);
        Task<bool> DeleteEncodingProfileAsync(Guid profileId, Guid userId);
        Task<EncodingJob> CreateEncodingJobAsync(Guid contentId, Guid profileId, Guid userId, CreateEncodingJobRequest request);
        Task<List<EncodingJob>> GetEncodingJobsAsync(Guid organizationId, EncodingJobFilter? filter = null);
        Task<EncodingJob> GetEncodingJobAsync(Guid jobId);

        // CDN & Distribution
        Task<CDNConfiguration> CreateCDNConfigurationAsync(Guid organizationId, Guid userId, CreateCDNConfigurationRequest request);
        Task<List<CDNConfiguration>> GetCDNConfigurationsAsync(Guid organizationId, CDNConfigurationFilter? filter = null);
        Task<CDNConfiguration> GetCDNConfigurationAsync(Guid configId);
        Task<CDNConfiguration> UpdateCDNConfigurationAsync(Guid configId, Guid userId, UpdateCDNConfigurationRequest request);
        Task<bool> DeleteCDNConfigurationAsync(Guid configId, Guid userId);
        Task<CDNMetrics> GetCDNMetricsAsync(Guid configId, CDNMetricsFilter filter);
        Task<List<CDNEdgeLocation>> GetCDNEdgeLocationsAsync(Guid configId);

        // Moderation & Safety
        Task<ModerationRule> CreateModerationRuleAsync(Guid channelId, Guid userId, CreateModerationRuleRequest request);
        Task<List<ModerationRule>> GetModerationRulesAsync(Guid channelId, ModerationRuleFilter? filter = null);
        Task<ModerationRule> UpdateModerationRuleAsync(Guid ruleId, Guid userId, UpdateModerationRuleRequest request);
        Task<bool> DeleteModerationRuleAsync(Guid ruleId, Guid userId);
        Task<ModerationAction> CreateModerationActionAsync(Guid channelId, Guid userId, CreateModerationActionRequest request);
        Task<List<ModerationAction>> GetModerationActionsAsync(Guid channelId, ModerationActionFilter? filter = null);
        Task<ContentModerationResult> ModerateContentAsync(Guid contentId, Guid userId, ModerateContentRequest request);
    }
}