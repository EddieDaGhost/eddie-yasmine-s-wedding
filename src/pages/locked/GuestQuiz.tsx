import { useState } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const quizQuestions = [
  {
    question: "Where did Eddie and Yasmine first meet?",
    options: ["A coffee shop", "A friend's party", "At work", "Online"],
    correct: 1,
  },
  {
    question: "What did Eddie accidentally do when they first met?",
    options: ["Stepped on her foot", "Spilled coffee on her dress", "Called her the wrong name", "Tripped and fell"],
    correct: 1,
  },
  {
    question: "Where did Eddie propose?",
    options: ["At home", "On a beach", "At a restaurant", "During a picnic by the ocean"],
    correct: 3,
  },
  {
    question: "What year did they start dating?",
    options: ["2018", "2019", "2020", "2021"],
    correct: 1,
  },
  {
    question: "What's their favorite activity together?",
    options: ["Hiking", "Cooking", "Traveling", "All of the above"],
    correct: 3,
  },
];

const GuestQuiz = () => {
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Guest Quiz"
        description="How well do you know Eddie & Yasmine? Test your knowledge on the wedding day!"
      />
    );
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = answers.filter((answer, index) => answer === quizQuestions[index].correct).length;

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Guest Quiz" />}
      
      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="How Well Do You Know Us?"
            subtitle="Test your knowledge about Eddie & Yasmine!"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {showResults ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-8 text-center"
              >
                <h3 className="font-display text-3xl text-foreground mb-4">
                  Your Score: {score}/{quizQuestions.length}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {score === quizQuestions.length
                    ? "Perfect! You really know us well!"
                    : score >= 3
                    ? "Great job! You know quite a bit about us!"
                    : "Looks like you have some learning to do!"}
                </p>

                <div className="space-y-4 mb-8 text-left">
                  {quizQuestions.map((q, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {answers[index] === q.correct ? (
                        <CheckCircle2 className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-foreground">{q.question}</p>
                        <p className="text-xs text-muted-foreground">
                          Correct: {q.options[q.correct]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="romantic" onClick={resetQuiz}>
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                  <div className="h-2 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="font-serif text-2xl text-foreground mb-8">
                  {quizQuestions[currentQuestion].question}
                </h3>

                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="w-full p-4 text-left rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    >
                      <span className="text-foreground">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GuestQuiz;
