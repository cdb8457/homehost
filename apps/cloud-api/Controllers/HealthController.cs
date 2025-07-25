using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly HealthCheckService _healthCheckService;

        public HealthController(HealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var report = await _healthCheckService.CheckHealthAsync();

            var response = new
            {
                status = report.Status.ToString().ToLower(),
                timestamp = DateTime.UtcNow.ToString("O"),
                services = report.Entries.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new
                    {
                        status = kvp.Value.Status.ToString().ToLower(),
                        responseTime = kvp.Value.Duration.TotalMilliseconds,
                        lastChecked = DateTime.UtcNow.ToString("O"),
                        error = kvp.Value.Exception?.Message
                    }
                )
            };

            var httpStatusCode = report.Status == HealthStatus.Healthy ? 200 : 503;
            return StatusCode(httpStatusCode, response);
        }

        [HttpGet("ready")]
        public IActionResult Ready()
        {
            return Ok(new { status = "ready", timestamp = DateTime.UtcNow.ToString("O") });
        }

        [HttpGet("live")]
        public IActionResult Live()
        {
            return Ok(new { status = "alive", timestamp = DateTime.UtcNow.ToString("O") });
        }
    }
}