using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using LinkInBio.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LinkInBio.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = GetUserId();

            var totalViews = await _context.VisitEvents.CountAsync(v => v.UserId == userId);
            
            // Get links for this user
            var userLinksIds = await _context.Links
                .Where(l => l.UserId == userId)
                .Select(l => l.Id)
                .ToListAsync();

            var totalClicks = await _context.ClickEvents
                .Where(c => userLinksIds.Contains(c.LinkId))
                .CountAsync();

            double ctr = totalViews > 0 ? Math.Round((double)totalClicks / totalViews * 100, 2) : 0;

            return Ok(new
            {
                TotalViews = totalViews,
                TotalClicks = totalClicks,
                Ctr = ctr
            });
        }

        [HttpGet("timeseries")]
        public async Task<IActionResult> GetTimeSeries([FromQuery] int days = 7)
        {
            var userId = GetUserId();
            var startDate = DateTime.UtcNow.Date.AddDays(-days + 1); // e.g., if today is 7th, goes back to 1st

            var userLinksIds = await _context.Links
                .Where(l => l.UserId == userId)
                .Select(l => l.Id)
                .ToListAsync();

            // Fetch data from DB
            var rawVisits = await _context.VisitEvents
                .Where(v => v.UserId == userId && v.Timestamp >= startDate)
                .Select(v => v.Timestamp.Date)
                .ToListAsync();

            var rawClicks = await _context.ClickEvents
                .Where(c => userLinksIds.Contains(c.LinkId) && c.Timestamp >= startDate)
                .Select(c => c.Timestamp.Date)
                .ToListAsync();

            // Group by Date in memory
            var visitsGrouped = rawVisits.GroupBy(v => v).ToDictionary(g => g.Key, g => g.Count());
            var clicksGrouped = rawClicks.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());

            // Build full array of days
            var result = Enumerable.Range(0, days).Select(i =>
            {
                var date = startDate.AddDays(i);
                return new
                {
                    Date = date.ToString("MMM dd"), // e.g., "Jul 18"
                    Views = visitsGrouped.ContainsKey(date) ? visitsGrouped[date] : 0,
                    Clicks = clicksGrouped.ContainsKey(date) ? clicksGrouped[date] : 0
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetDevices()
        {
            var userId = GetUserId();

            var visits = await _context.VisitEvents
                .Where(v => v.UserId == userId)
                .Select(v => new { v.DeviceType, v.OperatingSystem })
                .ToListAsync();

            var deviceStats = visits
                .GroupBy(v => string.IsNullOrEmpty(v.DeviceType) ? "Unknown" : v.DeviceType)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .OrderByDescending(x => x.Value)
                .ToList();

            var osStats = visits
                .GroupBy(v => string.IsNullOrEmpty(v.OperatingSystem) ? "Unknown" : v.OperatingSystem)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .OrderByDescending(x => x.Value)
                .ToList();

            return Ok(new { Devices = deviceStats, OS = osStats });
        }

        [HttpGet("referrers")]
        public async Task<IActionResult> GetReferrers()
        {
            var userId = GetUserId();

            var visits = await _context.VisitEvents
                .Where(v => v.UserId == userId && !string.IsNullOrEmpty(v.Referrer))
                .Select(v => v.Referrer)
                .ToListAsync();

            // Simplify referrers (e.g., https://l.instagram.com/ -> instagram.com)
            var simplified = visits.Select(r =>
            {
                if (r == null) return "Direct";
                var lower = r.ToLower();
                if (lower.Contains("instagram")) return "Instagram";
                if (lower.Contains("twitter") || lower.Contains("t.co")) return "Twitter";
                if (lower.Contains("linkedin")) return "LinkedIn";
                if (lower.Contains("facebook")) return "Facebook";
                if (lower.Contains("youtube")) return "YouTube";
                
                try
                {
                    var uri = new Uri(r);
                    return uri.Host.Replace("www.", "");
                }
                catch
                {
                    return "Other";
                }
            });

            var stats = simplified
                .GroupBy(r => r)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .OrderByDescending(x => x.Value)
                .Take(5)
                .ToList();

            return Ok(stats);
        }

        [HttpGet("toplinks")]
        public async Task<IActionResult> GetTopLinks()
        {
            var userId = GetUserId();

            var topLinks = await _context.Links
                .Where(l => l.UserId == userId && l.IsActive)
                .OrderByDescending(l => l.ClickCount)
                .Take(5)
                .Select(l => new { l.Title, l.Url, l.ClickCount })
                .ToListAsync();

            return Ok(topLinks);
        }
    }
}
