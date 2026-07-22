using LinkInBio.Api.Data;
using LinkInBio.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LinkInBio.Api.Controllers
{
    [Route("api/p")]
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PublicController(AppDbContext context)
        {
            _context = context;
        }

        private (string Device, string Os) ParseUserAgent(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent)) return ("Unknown", "Unknown");

            var ua = userAgent.ToLower();
            string device = ua.Contains("mobile") || ua.Contains("android") || ua.Contains("iphone") ? "Mobile" : "Desktop";
            
            string os = "Other";
            if (ua.Contains("windows")) os = "Windows";
            else if (ua.Contains("mac os") || ua.Contains("macos")) os = "macOS";
            else if (ua.Contains("android")) os = "Android";
            else if (ua.Contains("iphone") || ua.Contains("ipad")) os = "iOS";
            else if (ua.Contains("linux")) os = "Linux";

            return (device, os);
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetProfile(string username)
        {
            var user = await _context.Users
                .Include(u => u.Links.Where(l => l.IsActive).OrderBy(l => l.Order))
                .Include(u => u.Theme)
                .FirstOrDefaultAsync(u => u.Username == username.ToLower());

            if (user == null)
                return NotFound();

            var userAgent = Request.Headers["User-Agent"].ToString();
            var referrer = Request.Headers["Referer"].ToString();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (device, os) = ParseUserAgent(userAgent);

            // Sadece profil görüntülendiğinde views artır
            user.ProfileViews++;

            // Visit Event Kaydı
            var visit = new VisitEvent
            {
                UserId = user.Id,
                Timestamp = DateTime.UtcNow,
                IpAddress = ip,
                UserAgent = userAgent,
                DeviceType = device,
                OperatingSystem = os,
                Referrer = referrer
            };

            _context.VisitEvents.Add(visit);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Username,
                user.DisplayName,
                user.AvatarUrl,
                user.Bio,
                user.ProfileViews,
                Links = user.Links.OrderBy(l => l.Order).ToList(),
                Theme = user.Theme
            });
        }

        [HttpPost("click/{linkId}")]
        public async Task<IActionResult> RegisterClick(int linkId)
        {
            var link = await _context.Links.FindAsync(linkId);
            if (link == null)
                return NotFound();

            var userAgent = Request.Headers["User-Agent"].ToString();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (device, os) = ParseUserAgent(userAgent);

            link.ClickCount++;

            var clickEvent = new ClickEvent
            {
                LinkId = link.Id,
                Timestamp = DateTime.UtcNow,
                IpAddress = ip,
                DeviceType = device,
                OperatingSystem = os
            };

            _context.ClickEvents.Add(clickEvent);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
