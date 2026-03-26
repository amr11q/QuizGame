using QuizGame.DTOs;
using QuizGame.Models;

public class UpdateQuestionDto
{
    public string Text { get; set; }
    public int Points { get; set; }
    public QuestionType Type { get; set; }
    public bool AllowImage { get; set; }
    public List<CreateOptionDto>? Options { get; set; }
}