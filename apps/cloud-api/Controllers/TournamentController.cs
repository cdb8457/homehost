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
    public class TournamentController : ControllerBase
    {
        private readonly ITournamentService _tournamentService;
        private readonly ILogger<TournamentController> _logger;

        public TournamentController(
            ITournamentService tournamentService,
            ILogger<TournamentController> logger)
        {
            _tournamentService = tournamentService;
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

        // Tournament Management
        [HttpPost]
        public async Task<ActionResult<Tournament>> CreateTournament(CreateTournamentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tournament = await _tournamentService.CreateTournamentAsync(userId, request);
                return Ok(tournament);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tournament");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<Tournament>>> GetTournaments([FromQuery] TournamentFilter? filter = null)
        {
            try
            {
                var tournaments = await _tournamentService.GetTournamentsAsync(filter);
                return Ok(tournaments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournaments");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}")]
        public async Task<ActionResult<Tournament>> GetTournament(Guid tournamentId)
        {
            try
            {
                var tournament = await _tournamentService.GetTournamentAsync(tournamentId);
                return Ok(tournament);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{tournamentId}")]
        public async Task<ActionResult<Tournament>> UpdateTournament(Guid tournamentId, UpdateTournamentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tournament = await _tournamentService.UpdateTournamentAsync(tournamentId, userId, request);
                return Ok(tournament);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{tournamentId}")]
        public async Task<ActionResult> DeleteTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.DeleteTournamentAsync(tournamentId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-tournaments")]
        public async Task<ActionResult<List<Tournament>>> GetUserTournaments([FromQuery] TournamentFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var tournaments = await _tournamentService.GetUserTournamentsAsync(userId, filter);
                return Ok(tournaments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user tournaments");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Participation
        [HttpPost("{tournamentId}/join")]
        public async Task<ActionResult<TournamentParticipation>> JoinTournament(Guid tournamentId, JoinTournamentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var participation = await _tournamentService.JoinTournamentAsync(tournamentId, userId, request);
                return Ok(participation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/leave")]
        public async Task<ActionResult> LeaveTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.LeaveTournamentAsync(tournamentId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/participants")]
        public async Task<ActionResult<List<TournamentParticipation>>> GetTournamentParticipants(Guid tournamentId)
        {
            try
            {
                var participants = await _tournamentService.GetTournamentParticipantsAsync(tournamentId);
                return Ok(participants);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament participants {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/my-participation")]
        public async Task<ActionResult<TournamentParticipation>> GetMyParticipation(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var participation = await _tournamentService.GetParticipationAsync(tournamentId, userId);
                return Ok(participation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting participation for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{tournamentId}/participants/{participantId}")]
        public async Task<ActionResult> KickParticipant(Guid tournamentId, Guid participantId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.KickParticipantAsync(tournamentId, participantId, userId);
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
                _logger.LogError(ex, "Error kicking participant {ParticipantId} from tournament {TournamentId}", participantId, tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Brackets & Matchmaking
        [HttpPost("{tournamentId}/generate-bracket")]
        public async Task<ActionResult<TournamentBracket>> GenerateBracket(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var bracket = await _tournamentService.GenerateBracketAsync(tournamentId, userId);
                return Ok(bracket);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bracket for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/bracket")]
        public async Task<ActionResult<TournamentBracket>> GetTournamentBracket(Guid tournamentId)
        {
            try
            {
                var bracket = await _tournamentService.GetTournamentBracketAsync(tournamentId);
                return Ok(bracket);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bracket for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/matches")]
        public async Task<ActionResult<List<TournamentMatch>>> GetTournamentMatches(Guid tournamentId)
        {
            try
            {
                var matches = await _tournamentService.GetTournamentMatchesAsync(tournamentId);
                return Ok(matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting matches for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("matches/{matchId}")]
        public async Task<ActionResult<TournamentMatch>> GetMatch(Guid matchId)
        {
            try
            {
                var match = await _tournamentService.GetMatchAsync(matchId);
                return Ok(match);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting match {MatchId}", matchId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("matches/{matchId}/result")]
        public async Task<ActionResult<TournamentMatch>> UpdateMatchResult(Guid matchId, UpdateMatchResultRequest request)
        {
            try
            {
                var userId = GetUserId();
                var match = await _tournamentService.UpdateMatchResultAsync(matchId, userId, request);
                return Ok(match);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating match result {MatchId}", matchId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Administration
        [HttpPost("{tournamentId}/start")]
        public async Task<ActionResult> StartTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.StartTournamentAsync(tournamentId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/pause")]
        public async Task<ActionResult> PauseTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.PauseTournamentAsync(tournamentId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pausing tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/resume")]
        public async Task<ActionResult> ResumeTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.ResumeTournamentAsync(tournamentId, userId);
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
                _logger.LogError(ex, "Error resuming tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/cancel")]
        public async Task<ActionResult> CancelTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.CancelTournamentAsync(tournamentId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/finalize")]
        public async Task<ActionResult> FinalizeTournament(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.FinalizeTournamentAsync(tournamentId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finalizing tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Statistics & Analytics
        [HttpGet("{tournamentId}/statistics")]
        public async Task<ActionResult<TournamentStatistics>> GetTournamentStatistics(Guid tournamentId)
        {
            try
            {
                var statistics = await _tournamentService.GetTournamentStatisticsAsync(tournamentId);
                return Ok(statistics);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament statistics {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/participants/{participantId}/statistics")]
        public async Task<ActionResult<ParticipantStatistics>> GetParticipantStatistics(Guid tournamentId, Guid participantId)
        {
            try
            {
                var statistics = await _tournamentService.GetParticipantStatisticsAsync(tournamentId, participantId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting participant statistics {ParticipantId} for tournament {TournamentId}", participantId, tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/leaderboard")]
        public async Task<ActionResult<List<TournamentLeaderboard>>> GetTournamentLeaderboard(Guid tournamentId)
        {
            try
            {
                var leaderboard = await _tournamentService.GetTournamentLeaderboardAsync(tournamentId);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament leaderboard {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/analytics")]
        public async Task<ActionResult<TournamentAnalytics>> GetTournamentAnalytics(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _tournamentService.GetTournamentAnalyticsAsync(tournamentId, userId);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament analytics {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Formats
        [HttpPost("formats")]
        public async Task<ActionResult<TournamentFormat>> CreateTournamentFormat(CreateTournamentFormatRequest request)
        {
            try
            {
                var userId = GetUserId();
                var format = await _tournamentService.CreateTournamentFormatAsync(userId, request);
                return Ok(format);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tournament format");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("formats")]
        public async Task<ActionResult<List<TournamentFormat>>> GetTournamentFormats([FromQuery] Guid? gameId = null)
        {
            try
            {
                var formats = await _tournamentService.GetTournamentFormatsAsync(gameId);
                return Ok(formats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament formats");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("formats/{formatId}")]
        public async Task<ActionResult<TournamentFormat>> GetTournamentFormat(Guid formatId)
        {
            try
            {
                var format = await _tournamentService.GetTournamentFormatAsync(formatId);
                return Ok(format);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament format {FormatId}", formatId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("formats/{formatId}")]
        public async Task<ActionResult<TournamentFormat>> UpdateTournamentFormat(Guid formatId, UpdateTournamentFormatRequest request)
        {
            try
            {
                var userId = GetUserId();
                var format = await _tournamentService.UpdateTournamentFormatAsync(formatId, userId, request);
                return Ok(format);
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
                _logger.LogError(ex, "Error updating tournament format {FormatId}", formatId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("formats/{formatId}")]
        public async Task<ActionResult> DeleteTournamentFormat(Guid formatId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.DeleteTournamentFormatAsync(formatId, userId);
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
                _logger.LogError(ex, "Error deleting tournament format {FormatId}", formatId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Prizes
        [HttpPost("{tournamentId}/prizes")]
        public async Task<ActionResult<TournamentPrize>> CreateTournamentPrize(Guid tournamentId, CreateTournamentPrizeRequest request)
        {
            try
            {
                var userId = GetUserId();
                var prize = await _tournamentService.CreateTournamentPrizeAsync(tournamentId, userId, request);
                return Ok(prize);
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
                _logger.LogError(ex, "Error creating tournament prize for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/prizes")]
        public async Task<ActionResult<List<TournamentPrize>>> GetTournamentPrizes(Guid tournamentId)
        {
            try
            {
                var prizes = await _tournamentService.GetTournamentPrizesAsync(tournamentId);
                return Ok(prizes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament prizes for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("prizes/{prizeId}")]
        public async Task<ActionResult<TournamentPrize>> UpdateTournamentPrize(Guid prizeId, UpdateTournamentPrizeRequest request)
        {
            try
            {
                var userId = GetUserId();
                var prize = await _tournamentService.UpdateTournamentPrizeAsync(prizeId, userId, request);
                return Ok(prize);
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
                _logger.LogError(ex, "Error updating tournament prize {PrizeId}", prizeId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("prizes/{prizeId}")]
        public async Task<ActionResult> DeleteTournamentPrize(Guid prizeId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.DeleteTournamentPrizeAsync(prizeId, userId);
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
                _logger.LogError(ex, "Error deleting tournament prize {PrizeId}", prizeId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/distribute-prizes")]
        public async Task<ActionResult> DistributePrizes(Guid tournamentId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.DistributePrizesAsync(tournamentId, userId);
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
                _logger.LogError(ex, "Error distributing prizes for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tournament Streaming
        [HttpPost("{tournamentId}/streams")]
        public async Task<ActionResult<TournamentStream>> CreateTournamentStream(Guid tournamentId, CreateTournamentStreamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var stream = await _tournamentService.CreateTournamentStreamAsync(tournamentId, userId, request);
                return Ok(stream);
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
                _logger.LogError(ex, "Error creating tournament stream for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{tournamentId}/streams")]
        public async Task<ActionResult<List<TournamentStream>>> GetTournamentStreams(Guid tournamentId)
        {
            try
            {
                var streams = await _tournamentService.GetTournamentStreamsAsync(tournamentId);
                return Ok(streams);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tournament streams for tournament {TournamentId}", tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("streams/{streamId}")]
        public async Task<ActionResult<TournamentStream>> UpdateTournamentStream(Guid streamId, UpdateTournamentStreamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var stream = await _tournamentService.UpdateTournamentStreamAsync(streamId, userId, request);
                return Ok(stream);
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
                _logger.LogError(ex, "Error updating tournament stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("streams/{streamId}")]
        public async Task<ActionResult> DeleteTournamentStream(Guid streamId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.DeleteTournamentStreamAsync(streamId, userId);
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
                _logger.LogError(ex, "Error deleting tournament stream {StreamId}", streamId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Multi-Game Support
        [HttpGet("supported-games")]
        public async Task<ActionResult<List<SupportedGame>>> GetSupportedGames()
        {
            try
            {
                var games = await _tournamentService.GetSupportedGamesAsync();
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported games");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/{gameId}/configuration")]
        public async Task<ActionResult<GameConfiguration>> GetGameConfiguration(Guid gameId)
        {
            try
            {
                var configuration = await _tournamentService.GetGameConfigurationAsync(gameId);
                return Ok(configuration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game configuration {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("games/{gameId}/configuration")]
        public async Task<ActionResult<GameConfiguration>> UpdateGameConfiguration(Guid gameId, UpdateGameConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _tournamentService.UpdateGameConfigurationAsync(gameId, userId, request);
                return Ok(configuration);
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
                _logger.LogError(ex, "Error updating game configuration {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{tournamentId}/games/{gameId}")]
        public async Task<ActionResult> AddGameToTournament(Guid tournamentId, Guid gameId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.AddGameToTournamentAsync(tournamentId, gameId, userId);
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
                _logger.LogError(ex, "Error adding game {GameId} to tournament {TournamentId}", gameId, tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{tournamentId}/games/{gameId}")]
        public async Task<ActionResult> RemoveGameFromTournament(Guid tournamentId, Guid gameId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _tournamentService.RemoveGameFromTournamentAsync(tournamentId, gameId, userId);
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
                _logger.LogError(ex, "Error removing game {GameId} from tournament {TournamentId}", gameId, tournamentId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}