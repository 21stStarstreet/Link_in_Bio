using System.Security.Claims;
using LinkInBio.Api.Data;
using LinkInBio.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LinkInBio.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThemesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ThemesController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet]
        public async Task<ActionResult<Theme>> GetTheme()
        {
            var userId = GetUserId();
            var theme = await _context.Themes.FirstOrDefaultAsync(t => t.UserId == userId);

            if (theme == null)
            {
                theme = new Theme { UserId = userId };
                _context.Themes.Add(theme);
                await _context.SaveChangesAsync();
            }

            return theme;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTheme([FromBody] Theme request)
        {
            var userId = GetUserId();
            var theme = await _context.Themes.FirstOrDefaultAsync(t => t.UserId == userId);

            if (theme == null)
            {
                theme = new Theme { UserId = userId };
                _context.Themes.Add(theme);
            }

            theme.BackgroundColor = request.BackgroundColor;
            theme.BackgroundType = request.BackgroundType;
            theme.GradientStart = request.GradientStart;
            theme.GradientEnd = request.GradientEnd;
            theme.ButtonStyle = request.ButtonStyle;
            theme.ButtonTransparency = request.ButtonTransparency;
            theme.ButtonTextColor = request.ButtonTextColor;
            theme.Font = request.Font;
            theme.InstagramUrl = request.InstagramUrl;
            theme.TwitterUrl = request.TwitterUrl;
            theme.GithubUrl = request.GithubUrl;
            theme.LinkedinUrl = request.LinkedinUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
