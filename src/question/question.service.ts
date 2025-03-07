import { QuestionType } from "@prisma/client";
import { prisma } from "../../prisma/prisma";

export const getQuestionsByTryoutId = async (tryoutId: string) => {
  return await prisma.question.findMany({
    where: {
      tryoutId,
    },
    include: {
      choices: true,
    },
  });
};

export const getQuestionById = async (id: string) => {
  return await prisma.question.findUnique({
    where: {
      id,
    },
    include: {
      choices: true,
    },
  });
};

const isValidQuestionType = (type: string): type is QuestionType => {
  return Object.values(QuestionType).includes(type as QuestionType);
};

export const createQuestion = async (data: {
  tryoutId: string;
  text: string;
  score: number;
  type: string;
  choices?: {
    choiceText: string;
    isAnswer: boolean;
  }[];
}) => {
  if (!isValidQuestionType(data.type)) {
    throw new Error(`Invalid question type: ${data.type}`);
  }

  if (
    (data.type === "MultipleChoice" || data.type === "TrueFalse") &&
    (!data.choices || data.choices.length === 0)
  ) {
    throw new Error(`Choices must be provided for ${data.type} questions`);
  }

  if (data.type === "TrueFalse" && data.choices && data.choices.length !== 2) {
    throw new Error("True/False questions must have exactly 2 choices");
  }

  return await prisma.question.create({
    data: {
      text: data.text,
      score: data.score,
      type: data.type as QuestionType,
      tryoutId: data.tryoutId,
      choices: data.choices
        ? {
            create: data.choices.map((choice) => ({
              choiceText: choice.choiceText,
              isAnswer: choice.isAnswer,
            })),
          }
        : undefined,
    },
    include: {
      choices: true,
    },
  });
};

export const updateQuestion = async (
  id: string,
  data: {
    text?: string;
    score?: number;
    type?: string;
    choices?: {
      id?: string;
      choiceText: string;
      isAnswer: boolean;
    }[];
  }
) => {
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    include: { choices: true },
  });

  if (!existingQuestion) {
    throw new Error(`Question with ID ${id} not found`);
  }

  if (data.type && !isValidQuestionType(data.type)) {
    throw new Error(`Invalid question type: ${data.type}`);
  }

  const questionType = (data.type as QuestionType) || existingQuestion.type;

  if (
    (questionType === "MultipleChoice" || questionType === "TrueFalse") &&
    (!data.choices || data.choices.length === 0)
  ) {
    throw new Error(`Choices must be provided for ${questionType} questions`);
  }

  if (
    questionType === "TrueFalse" &&
    data.choices &&
    data.choices.length !== 2
  ) {
    throw new Error("True/False questions must have exactly 2 choices");
  }

  if (
    questionType === "MultipleChoice" &&
    data.choices &&
    !data.choices.some((choice) => choice.isAnswer)
  ) {
    throw new Error(
      "Multiple choice questions must have at least one correct answer"
    );
  }

  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: {
      text: data.text,
      score: data.score,
      type: data.type as QuestionType | undefined,
    },
  });

  if (data.choices) {
    const existingChoiceIds = existingQuestion.choices.map((c) => c.id);
    const updatedChoiceIds = data.choices
      .filter((c) => c.id)
      .map((c) => c.id as string);

    const choicesToDelete = existingChoiceIds.filter(
      (id) => !updatedChoiceIds.includes(id)
    );

    if (choicesToDelete.length > 0) {
      await prisma.choice.deleteMany({
        where: {
          id: { in: choicesToDelete },
        },
      });
    }

    for (const choice of data.choices) {
      if (choice.id) {
        await prisma.choice.update({
          where: { id: choice.id },
          data: {
            choiceText: choice.choiceText,
            isAnswer: choice.isAnswer,
          },
        });
      } else {
        await prisma.choice.create({
          data: {
            questionId: id,
            choiceText: choice.choiceText,
            isAnswer: choice.isAnswer,
          },
        });
      }
    }
  }

  return await prisma.question.findUnique({
    where: { id },
    include: { choices: true },
  });
};

export const deleteQuestions = async (id: string) => {
  const existingQuestions = await prisma.question.findUnique({
    where: { id },
  });

  if (!existingQuestions) {
    throw new Error(`Tryout with ID ${id} not found`);
  }

  const deleteChoices = prisma.choice.deleteMany({
    where: {
      questionId: id,
    },
  });

  return await prisma.tryout.delete({
    where: { id },
  });
};
