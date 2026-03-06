using QuizGame.Models;

public class Quiz
{
    public int Id { get; set; }

    // اسم الامتحان (مثلاً: كويز يوم 25 فبراير)
    public string Title { get; set; } = string.Empty;

    // تاريخ الكويز (يوم واحد)
    public DateTime QuizDate { get; set; }

    // وقت بداية الكويز
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }


    // مدة الكويز بالدقايق
    public int DurationMinutes { get; set; }

    // هل الكويز شغال؟
    public bool IsActive { get; set; } = true;

    // Navigation
    public List<Question> Questions { get; set; } = new();


    public List<Submission> Submissions { get; set; } = new();
}