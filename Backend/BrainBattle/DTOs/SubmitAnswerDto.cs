using QuizGame.Controllers;

public class SubmitAnswerDto
{
    public int QuestionId { get; set; }
    public int QuizId { get; set; }
    public List<ExamAnswerDto> Answers { get; set; } = new();

    public int? SelectedOptionId { get; set; }
    public string? AnswerText { get; set; }
    public IFormFile? Image { get; set; }

}