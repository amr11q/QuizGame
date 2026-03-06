using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizGame.Data;
using QuizGame.DTOs;
using QuizGame.Models;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuestionsController(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // Update Question (ADMIN)
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public IActionResult UpdateQuestion(int id, UpdateQuestionDto dto)
    {
        var question = _context.Questions
            .Include(q => q.Options)
            .FirstOrDefault(q => q.Id == id);

        if (question == null)
            return NotFound();

        question.Text = dto.Text;
        question.Points = dto.Points;
        question.Type = dto.Type;
        question.AllowImage = dto.AllowImage;

        if (dto.Type == QuestionType.MCQ && dto.Options != null)
        {
            _context.Options.RemoveRange(question.Options);

            foreach (var o in dto.Options)
            {
                _context.Options.Add(new Option
                {
                    QuestionId = question.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect
                });
            }
        }

        _context.SaveChanges();
        return Ok("Question updated");
    }

    // =========================
    // Add Question (ADMIN)
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpPost("add-question")]
    public async Task<IActionResult> AddQuestion([FromForm] CreateQuestionDto dto)
    {
        var question = new Question
        {
            QuizId = dto.QuizId,
            Type = dto.Type,
            ContentType = dto.ContentType,
            Text = dto.ContentType == ContentType.Text ? dto.Text : null,
            Points = dto.Points,
            AllowImage = dto.AllowImage
        };

        // لو السؤال صورة
        if (dto.ContentType == ContentType.Image && dto.Image != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            question.ImagePath = "/uploads/" + fileName;
        }

        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        // لو MCQ
        if (dto.Type == QuestionType.MCQ && dto.Options != null)
        {
            foreach (var opt in dto.Options)
            {
                var option = new Option
                {
                    QuestionId = question.Id,
                    Text = opt.Text,
                    IsCorrect = opt.IsCorrect
                };

                _context.Options.Add(option);
            }

            await _context.SaveChangesAsync();
        }

        return Ok();
    }

    // =========================
    // Delete Question (ADMIN)
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public IActionResult DeleteQuestion(int id)
    {
        var question = _context.Questions
            .Include(q => q.Options)
            .FirstOrDefault(q => q.Id == id);

        if (question == null)
            return NotFound();

        // 1️⃣ احذف Submissions المرتبطة بالسؤال مباشرة
        var submissions = _context.Submissions
            .Where(s => s.QuestionId == id)
            .ToList();

        _context.Submissions.RemoveRange(submissions);

        // 2️⃣ احذف Options
        _context.Options.RemoveRange(question.Options);

        // 3️⃣ احذف Question
        _context.Questions.Remove(question);

        _context.SaveChanges();

        return Ok();
    }

    // =========================
    // ✅ Get Questions By Quiz (USER + ADMIN)
    // =========================
    [Authorize(Roles = "User,Admin")]
    [HttpGet("by-quiz/{quizId}")]
    public IActionResult GetQuestionsByQuiz(int quizId)
    {
        var questions = _context.Questions
            .Include(q => q.Options) // ⭐ مهم جدًا
            .Where(q => q.QuizId == quizId)
            .Select(q => new
            {
                q.Id,
                q.Text,
                q.ImagePath,
                q.Points,
                q.Type,
                Options = q.Type == QuestionType.MCQ
                    ? q.Options.Select(o => new
                    {
                        o.Id,
                        o.Text
                    }).ToList()
                    : null
            })
            .ToList();

        return Ok(questions);
    }
}