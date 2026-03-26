using Microsoft.EntityFrameworkCore;
using QuizGame.Models;

namespace QuizGame.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // -------------------------
            // Question → Quiz
            // -------------------------
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Restrict);   // ❌ وقف Cascade هنا

            // -------------------------
            // Submission → Question
            // -------------------------
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Question)
                .WithMany(q => q.Submissions)
                .HasForeignKey(s => s.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);   // ❌ وقف Cascade هنا

            // -------------------------
            // Submission → Quiz
            // -------------------------
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Quiz)
                .WithMany(q => q.Submissions)
                .HasForeignKey(s => s.QuizId)
                .OnDelete(DeleteBehavior.Restrict);   // ❌ وقف Cascade هنا

            // -------------------------
            // Submission → User
            // -------------------------
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.User)
                .WithMany(u => u.Submissions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);   // ❌ وقف Cascade هنا

            // -------------------------
            // Option → Question
            // -------------------------
            modelBuilder.Entity<Option>()
                .HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);   // ✅ ده الوحيد اللي يفضل Cascade
        }
    }
}