using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizGame.Data;
using QuizGame.Models;
using QuizGame.DTOs;

namespace QuizGame.Controllers
{
    [ApiController]
    [Route("api/options")]
    [Authorize(Roles = "Admin")]
    public class OptionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OptionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult AddOption(CreateOptionDto dto)
        {
            var question = _context.Questions.Find(dto.QuestionId);
            if (question == null)
                return NotFound("Question not found");

            if (question.Type != QuestionType.MCQ)
                return BadRequest("Options allowed only for MCQ");

            var option = new Option
            {
                QuestionId = dto.QuestionId,
                Text = dto.Text
            };

            _context.Options.Add(option);
            _context.SaveChanges();

            return Ok(option);
        }
    }

    
}