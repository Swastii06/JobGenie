"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(30);

  const timerRef = useRef(30); // ref-backed counter to avoid stale closures
  const handleNextRef = useRef(() => {});
  const quizDataRef = useRef(null);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const calculateScore = useCallback(() => {
    if (!quizData) return 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  }, [answers, quizData]);

  const finishQuiz = useCallback(async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  }, [quizData, answers, calculateScore, saveQuizResultFn]);

  const handleNext = useCallback(() => {
    if (quizData && currentQuestion < quizData.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setShowExplanation(false);
      // reset timer UI/state for new question
      setTimer(30);
      timerRef.current = 30;
    } else {
      finishQuiz();
    }
  }, [quizData, currentQuestion, finishQuiz]);

  // keep refs in sync to avoid stale closures inside intervals
  useEffect(() => {
    handleNextRef.current = handleNext;
    quizDataRef.current = quizData;
  }, [handleNext, quizData]);

  // initialize answers array when quiz data arrives
  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      // reset question index and timer when a new quiz is generated
      setCurrentQuestion(0);
      setShowExplanation(false);
      setTimer(30);
      timerRef.current = 30;
    }
  }, [quizData]);

  // Robust timer effect using a ref-backed counter
  useEffect(() => {
    // do nothing if quiz not loaded
    if (!quizDataRef.current) {
      setTimer(30);
      timerRef.current = 30;
      return;
    }

    // If explanation is shown, pause the timer (UI stays at current value)
    if (showExplanation) {
      return;
    }

    // reset timer for the new question
    timerRef.current = 30;
    setTimer(30);

    const id = setInterval(() => {
      timerRef.current -= 1;
      setTimer(timerRef.current);

      if (timerRef.current <= 0) {
        clearInterval(id);
        // auto advance using ref to avoid stale closures
        handleNextRef.current();
      }
    }, 1000);

    return () => clearInterval(id);
    // include quizData to restart timer when quiz is newly loaded
  }, [currentQuestion, showExplanation, quizData]);

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setTimer(30);
    timerRef.current = 30;
    generateQuizFn();
    setResultData(null);
  };

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Question {currentQuestion + 1} of {quizData.length}
          </CardTitle>
          {!showExplanation && (
            <div className="flex items-center gap-2">
              <div
                className={`text-lg font-semibold ${
                  timer <= 10 ? "text-red-500" : "text-foreground"
                }`}
              >
                {timer}s
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`option-${currentQuestion}-${index}`}
              />
              <Label htmlFor={`option-${currentQuestion}-${index}`}>
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult && (
            <BarLoader className="mt-4" width={"100%"} color="gray" />
          )}
          {currentQuestion < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
