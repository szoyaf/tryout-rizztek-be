import { prisma } from "../../prisma/prisma";

export const createSubmission = async (data: {
  tryoutId: string;
  userId: string;
}) => {
  const tryout = await prisma.tryout.findUnique({
    where: { id: data.tryoutId },
    include: { questions: true },
  });

  if (!tryout) {
    throw new Error(`Tryout with ID ${data.tryoutId} not found`);
  }

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error(`User with ID ${data.userId} not found`);
  }

  const existingSubmission = await prisma.submission.findFirst({
    where: {
      tryoutId: data.tryoutId,
      userId: data.userId,
    },
  });

  if (existingSubmission) {
    return existingSubmission;
  }

  return await prisma.submission.create({
    data: {
      tryoutId: data.tryoutId,
      userId: data.userId,
    },
  });
};

export const getSubmissionById = async (id: string) => {
  return await prisma.submission.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          Question: true,
          Choice: true,
        },
      },
      User: true,
      Tryout: true,
    },
  });
};

export const getSubmissionsByUserId = async (userId: string) => {
  return await prisma.submission.findMany({
    where: { userId },
    include: {
      Tryout: true,
    },
  });
};

export const getSubmissionsByTryoutId = async (tryoutId: string) => {
  return await prisma.submission.findMany({
    where: { tryoutId },
    include: {
      User: true,
    },
  });
};

export const submitAnswers = async (
  submissionId: string,
  answers: {
    questionId: string;
    choiceId?: string;
    shortAnswer?: string;
  }[]
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { Tryout: { include: { questions: true } } },
  });

  if (!submission) {
    throw new Error(`Submission with ID ${submissionId} not found`);
  }

  const processedAnswers = [];
  let totalScore = 0;

  for (const answer of answers) {
    const question = await prisma.question.findFirst({
      where: {
        id: answer.questionId,
        tryoutId: submission.tryoutId,
      },
      include: { choices: true },
    });

    if (!question) {
      throw new Error(
        `Question with ID ${answer.questionId} not found in this tryout`
      );
    }

    let isCorrect = false;

    if (question.type === "MultipleChoice" || question.type === "TrueFalse") {
      if (!answer.choiceId) {
        throw new Error(`Choice ID is required for ${question.type} question`);
      }

      const choice = question.choices.find((c) => c.id === answer.choiceId);

      if (!choice) {
        throw new Error(
          `Choice with ID ${answer.choiceId} not found for this question`
        );
      }

      isCorrect = choice.isAnswer;

      if (isCorrect) {
        totalScore += question.score;
      }
    } else if (question.type === "ShortAnswer") {
      if (!answer.shortAnswer) {
        throw new Error("Short answer is required for ShortAnswer question");
      }

      isCorrect =
        question.correctShortAnswer !== null &&
        answer.shortAnswer.trim().toLowerCase() ===
          question.correctShortAnswer.trim().toLowerCase();

      if (isCorrect) {
        totalScore += question.score;
      }
    }

    const processedAnswer = await prisma.answer.create({
      data: {
        submissionId,
        questionId: answer.questionId,
        choiceId: answer.choiceId,
        shortAnswer: answer.shortAnswer,
        isCorrect,
      },
    });

    processedAnswers.push(processedAnswer);
  }

  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score: totalScore,
      submittedAt: new Date(),
    },
    include: {
      answers: true,
      Tryout: true,
      User: true,
    },
  });

  return updatedSubmission;
};
