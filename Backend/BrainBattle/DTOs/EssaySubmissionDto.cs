public class EssaySubmissionDto
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public string QuizTitle { get; set; }

    public int UserId { get; set; }
    public string UserName { get; set; }

    public int QuestionId { get; set; }
    public string QuestionText { get; set; }

    public string AnswerText { get; set; }
    public bool IsCorrected { get; set; }
}