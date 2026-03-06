namespace QuizGame.Models
{
    public enum QuestionType
    {
        Essay = 1,
        MCQ = 2
    }

    public enum ContentType
    {
        Text = 1,
        Image = 2
    }

    public class Question
    {
        public int Id { get; set; }

        // نوع السؤال (Essay / MCQ)
        public QuestionType Type { get; set; }

        // شكل السؤال (نص / صورة)
        public ContentType ContentType { get; set; }

        // نص السؤال (لو Text)
        public string? Text { get; set; }

        // مسار الصورة (لو Image)
        public string? ImagePath { get; set; }

        // الدرجة
        public int Points { get; set; }

        // هل يسمح برفع صورة في الإجابة؟ (للمقالي غالبًا)
        public bool AllowImage { get; set; }

        // 🔗 ربط بالكويز
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;

        // ===== MCQ فقط =====

        public List<Option> Options { get; set; } = new();

        public List<Submission> Submissions { get; set; } = new();
    }
}