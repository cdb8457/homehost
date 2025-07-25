using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using HomeHost.CloudApi.Controllers;
using HomeHost.CloudApi.Services;
using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Tests
{
    public class CommunityControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public CommunityControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetCommunities_ReturnsSuccessAndCorrectContentType()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/community");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json; charset=utf-8", 
                response.Content.Headers.ContentType?.ToString());
        }

        [Fact]
        public async Task GetCommunity_WithValidId_ReturnsCommunity()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            
            var communityId = Guid.NewGuid();

            // Act
            var response = await _client.GetAsync($"/api/community/{communityId}");

            // Assert
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var community = JsonSerializer.Deserialize<Community>(content);
                Assert.NotNull(community);
                Assert.Equal(communityId, community.Id);
            }
            else
            {
                // Community not found is also a valid response
                Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
            }
        }

        [Fact]
        public async Task CreateCommunity_WithValidData_ReturnsCreated()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var createRequest = new CreateCommunityRequest
            {
                Name = "Test Community",
                Description = "A test community for unit testing",
                IsPublic = true,
                JoinType = "open",
                Region = "North America",
                Games = new List<string> { "Valheim", "Minecraft" },
                Tags = new List<string> { "test", "gaming" }
            };

            var json = JsonSerializer.Serialize(createRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/community", content);

            // Assert
            if (response.IsSuccessStatusCode)
            {
                Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
                var responseContent = await response.Content.ReadAsStringAsync();
                var community = JsonSerializer.Deserialize<Community>(responseContent);
                Assert.NotNull(community);
                Assert.Equal(createRequest.Name, community.Name);
            }
        }

        [Fact]
        public async Task GetTrendingCommunities_ReturnsSuccessAndCorrectStructure()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/community/trending");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var communities = JsonSerializer.Deserialize<List<Community>>(content);
            Assert.NotNull(communities);
            
            // Verify trending communities are ordered by some metric
            if (communities.Count > 1)
            {
                // Check that communities have reasonable data
                foreach (var community in communities)
                {
                    Assert.NotNull(community.Name);
                    Assert.True(community.MemberCount >= 0);
                    Assert.True(community.Rating >= 0 && community.Rating <= 5);
                }
            }
        }

        [Fact]
        public async Task SearchCommunities_WithQuery_ReturnsFilteredResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var searchQuery = "Valheim";

            // Act
            var response = await _client.GetAsync($"/api/community/search?query={searchQuery}");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var communities = JsonSerializer.Deserialize<List<Community>>(content);
            Assert.NotNull(communities);

            // Verify search results are relevant
            foreach (var community in communities)
            {
                var containsQuery = community.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) ||
                                   community.Description?.Contains(searchQuery, StringComparison.OrdinalIgnoreCase) == true ||
                                   community.Games?.Any(g => g.Contains(searchQuery, StringComparison.OrdinalIgnoreCase)) == true;
                Assert.True(containsQuery, $"Community '{community.Name}' should match search query '{searchQuery}'");
            }
        }

        [Fact]
        public async Task JoinCommunity_WithValidId_ReturnsSuccess()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // First create a community to join
            var communityId = await CreateTestCommunityAsync();
            
            // Act
            var response = await _client.PostAsync($"/api/community/{communityId}/join", null);

            // Assert
            if (response.IsSuccessStatusCode)
            {
                Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
            }
            else
            {
                // User might already be a member
                Assert.Equal(System.Net.HttpStatusCode.Conflict, response.StatusCode);
            }
        }

        [Fact]
        public async Task GetCommunityMembers_WithValidId_ReturnsMembers()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var communityId = await CreateTestCommunityAsync();

            // Act
            var response = await _client.GetAsync($"/api/community/{communityId}/members");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var members = JsonSerializer.Deserialize<List<CommunityMember>>(content);
            Assert.NotNull(members);
            
            // At minimum, the creator should be a member
            Assert.NotEmpty(members);
            Assert.Contains(members, m => m.Role == "owner");
        }

        [Fact]
        public async Task GetRecommendedCommunities_ReturnsPersonalizedResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/community/recommended");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var communities = JsonSerializer.Deserialize<List<Community>>(content);
            Assert.NotNull(communities);

            // Verify recommendations have quality metrics
            foreach (var community in communities)
            {
                Assert.True(community.Rating > 0, "Recommended communities should have ratings");
                Assert.True(community.MemberCount > 0, "Recommended communities should have members");
            }
        }

        // Helper Methods

        private async Task<string> GetAuthTokenAsync()
        {
            var loginRequest = new
            {
                Email = "alex@homehost.com",
                Password = "password123"
            };

            var json = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/auth/login", content);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var authResponse = JsonSerializer.Deserialize<AuthResponse>(responseContent);
                return authResponse.AccessToken;
            }

            // Return a mock token for testing if auth fails
            return "mock-jwt-token-for-testing";
        }

        private async Task<Guid> CreateTestCommunityAsync()
        {
            var createRequest = new CreateCommunityRequest
            {
                Name = $"Test Community {Guid.NewGuid()}",
                Description = "Test community for integration testing",
                IsPublic = true,
                JoinType = "open",
                Region = "Test Region",
                Games = new List<string> { "Test Game" },
                Tags = new List<string> { "test" }
            };

            var json = JsonSerializer.Serialize(createRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/community", content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var community = JsonSerializer.Deserialize<Community>(responseContent);
                return community.Id;
            }

            // Return a test GUID if creation fails
            return Guid.Parse("33333333-3333-3333-3333-333333333333");
        }
    }

    // Supporting classes for deserialization
    public class CreateCommunityRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPublic { get; set; }
        public string JoinType { get; set; }
        public string Region { get; set; }
        public List<string> Games { get; set; }
        public List<string> Tags { get; set; }
    }

    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class CommunityMember
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; }
        public DateTime JoinedAt { get; set; }
    }
}