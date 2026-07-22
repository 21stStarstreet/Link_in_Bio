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
    public class LinksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LinksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Link>>> GetLinks()
        {
            var userId = GetUserId();
            return await _context.Links
                .Where(l => l.UserId == userId)
                .OrderBy(l => l.Order)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Link>> CreateLink([FromBody] Link request)
        {
            var userId = GetUserId();
            request.UserId = userId;
            
            // Generate a default order
            var maxOrder = await _context.Links.Where(l => l.UserId == userId).MaxAsync(l => (int?)l.Order) ?? 0;
            request.Order = maxOrder + 1;

            _context.Links.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLinks), new { id = request.Id }, request);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLink(int id, [FromBody] Link request)
        {
            var userId = GetUserId();
            var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (link == null)
                return NotFound();

            link.Title = request.Title;
            link.Url = request.Url;
            link.Icon = request.Icon;
            link.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLink(int id)
        {
            var userId = GetUserId();
            var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (link == null)
                return NotFound();

            _context.Links.Remove(link);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public class ReorderRequest
        {
            public int LinkId { get; set; }
            public int NewOrder { get; set; }
        }

        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderLinks([FromBody] List<ReorderRequest> request)
        {
            var userId = GetUserId();
            var links = await _context.Links.Where(l => l.UserId == userId).ToListAsync();

            foreach (var req in request)
            {
                var link = links.FirstOrDefault(l => l.Id == req.LinkId);
                if (link != null)
                {
                    link.Order = req.NewOrder;
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
