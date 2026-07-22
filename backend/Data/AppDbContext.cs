using LinkInBio.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LinkInBio.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Link> Links { get; set; } = null!;
        public DbSet<Theme> Themes { get; set; } = null!;
        public DbSet<VisitEvent> VisitEvents { get; set; } = null!;
        public DbSet<ClickEvent> ClickEvents { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasMany(u => u.Links)
                .WithOne(l => l.User)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Theme)
                .WithOne(t => t.User)
                .HasForeignKey<Theme>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
