using System.Collections.Generic;

namespace QuizGame.Models
{
    public enum UserRole
    {
        User = 1,
        Admin = 2
    }

    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;


        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; }
        

        // نظام النقاط
        public int TotalPoints { get; set; }
        public int Points { get; set; } = 0;
        public int WeeklyPoints { get; set; }

        // Navigation
        public List<Submission> Submissions { get; set; } = new();
    }
}
