using QuizGame.Models;

public class Submission
{
    public int Id { get; set; }

    // ===== User =====
    public int UserId { get; set; }
    public User User { get; set; }


    // ===== Question =====
    public int QuestionId { get; set; }
    public Question Question { get; set; }

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; }

    // ===== Answer =====
    public int? SelectedOptionId { get; set; }   // MCQ
    public string? AnswerText { get; set; }       // Essay
    public string? ImagePath { get; set; }

    // ===== Correction =====
    public int Score { get; set; } = 0;
    public bool IsCorrected { get; set; } = false;

    public DateTime SubmittedAt { get; set; } = DateTime.Now;
    public int EarnedPoints { get; set; }

}