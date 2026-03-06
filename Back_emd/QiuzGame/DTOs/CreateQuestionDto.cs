using Microsoft.AspNetCore.Http;
using QuizGame.DTOs;
using QuizGame.Models;

public class CreateQuestionDto
{
    public int QuizId { get; set; }

    public QuestionType Type { get; set; }

    public ContentType ContentType { get; set; }

    public string? Text { get; set; }
    public string? ImagePath { get; set; }

    public IFormFile? Image { get; set; }

    public int Points { get; set; }

    public bool AllowImage { get; set; }

    public List<CreateOptionDto>? Options { get; set; }
}