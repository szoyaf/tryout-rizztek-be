import { Category } from "@prisma/client";
import { prisma } from "../../prisma/prisma";
import { QuestionType } from "@prisma/client";

const isValidQuestionType = (type: string): type is QuestionType => {
  return Object.values(QuestionType).includes(type as QuestionType);
};

const isValidCategory = (category: string): category is Category => {
  return Object.values(Category).includes(category as Category);
};

export const getTryouts = async (options?: {
  include?: {
    questions?: boolean;
    submissions?: boolean;
    User?: boolean;
  };
}) => {
  return await prisma.tryout.findMany({
    include: options?.include,
  });
};

export const getTryoutById = async (id: string) => {
  return await prisma.tryout.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          choices: true,
        },
      },
      User: true,
    },
  });
};

export const getTryoutsByTitle = async (title: string) => {
  return await prisma.tryout.findMany({
    where: {
      title: {
        contains: title,
        mode: "insensitive",
      },
    },
  });
};

export const getTryoutsByCategory = async (category: string) => {
  if (!isValidCategory(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  return await prisma.tryout.findMany({
    where: {
      category: category as Category,
    },
  });
};

export const createTryout = async (data: {
  title: string;
  description: string;
  category: string;
  userId: string;
  startAt: Date | string;
  endAt: Date | string;
  questions?: {
    text: string;
    score: number;
    type: string;
    choices?: {
      choiceText: string;
      isAnswer: boolean;
    }[];
    shortAnswer?: string;
  }[];
}) => {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  if (!data.description || data.description.trim().length === 0) {
    throw new Error("Description is required");
  }

  if (!isValidCategory(data.category)) {
    throw new Error(`Invalid category: ${data.category}`);
  }

  if (
    !data.userId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      data.userId
    )
  ) {
    throw new Error("Invalid user ID format");
  }

  const startAt =
    data.startAt instanceof Date ? data.startAt : new Date(data.startAt);

  if (isNaN(startAt.getTime())) {
    throw new Error("Invalid start date");
  }

  const endAt = data.endAt instanceof Date ? data.endAt : new Date(data.endAt);

  if (isNaN(endAt.getTime())) {
    throw new Error("Invalid end date");
  }

  if (startAt >= endAt) {
    throw new Error("Start date must be earlier than end date");
  }

  const duration = (endAt.getTime() - startAt.getTime()) / (60 * 1000);

  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!userExists) {
    throw new Error("User not found");
  }

  if (data.questions && data.questions.length > 0) {
    for (const question of data.questions) {
      if (!question.text || question.text.trim().length === 0) {
        throw new Error("Question text is required");
      }

      if (question.score === undefined || question.score <= 0) {
        throw new Error("Question score must be a positive number");
      }

      if (!isValidQuestionType(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }

      if (
        (question.type === "MultipleChoice" || question.type === "TrueFalse") &&
        (!question.choices || question.choices.length === 0)
      ) {
        throw new Error(
          `Choices must be provided for ${question.type} questions`
        );
      }

      if (
        question.type === "TrueFalse" &&
        question.choices &&
        question.choices.length !== 2
      ) {
        throw new Error("True/False questions must have exactly 2 choices");
      }

      if (
        question.type === "MultipleChoice" &&
        question.choices &&
        !question.choices.some((choice) => choice.isAnswer)
      ) {
        throw new Error(
          "Multiple choice questions must have at least one correct answer"
        );
      }

      if (
        question.type === "ShortAnswer" &&
        question.shortAnswer &&
        question.shortAnswer === ""
      ) {
        throw new Error("Short answer questions must have a correct answer");
      }
    }
  }

  return await prisma.tryout.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category as Category,
      duration: duration,
      userId: data.userId,
      startAt: startAt,
      endAt: endAt,
      questions: data.questions
        ? {
            create: data.questions.map((question) => ({
              text: question.text.trim(),
              score: question.score,
              type: question.type as QuestionType,
              choices: question.choices
                ? {
                    create: question.choices.map((choice) => ({
                      choiceText: choice.choiceText.trim(),
                      isAnswer: choice.isAnswer,
                    })),
                  }
                : undefined,
              shortAnswer: question.shortAnswer,
            })),
          }
        : undefined,
    },
    include: {
      questions: {
        include: {
          choices: true,
        },
      },
    },
  });
};

export const updateTryout = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    category?: string;
    duration?: number;
    startAt?: Date | string;
  }
) => {
  const existingTryout = await prisma.tryout.findUnique({
    where: { id },
    include: { submissions: true },
  });

  if (!existingTryout) {
    throw new Error(`Tryout with ID ${id} not found`);
  }

  if (existingTryout.submissions.length > 0) {
    throw new Error("Cannot update tryout with existing submissions");
  }

  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Title is required");
    }
  }

  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      throw new Error("Description is required");
    }
  }

  if (data.category !== undefined) {
    if (!isValidCategory(data.category)) {
      throw new Error(`Invalid category: ${data.category}`);
    }
  }

  if (data.duration !== undefined) {
    if (!data.duration || data.duration <= 0) {
      throw new Error("Duration must be a positive number");
    }
  }

  let startAt: Date | undefined;
  let endAt: Date | undefined;

  if (data.startAt !== undefined) {
    startAt =
      data.startAt instanceof Date ? data.startAt : new Date(data.startAt);
    if (isNaN(startAt.getTime())) {
      throw new Error("Invalid start date");
    }

    if (data.duration) {
      endAt = new Date(startAt.getTime() + data.duration * 60 * 1000);
    } else {
      endAt = new Date(startAt.getTime() + existingTryout.duration * 60 * 1000);
    }
  } else if (data.duration) {
    startAt = existingTryout.startAt;
    endAt = new Date(startAt.getTime() + data.duration * 60 * 1000);
  }

  return await prisma.tryout.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      description: data.description?.trim(),
      category: data.category as Category | undefined,
      duration: data.duration,
      startAt: startAt,
      endAt: endAt,
    },
    include: {
      questions: {
        include: {
          choices: true,
        },
      },
    },
  });
};

export const deleteTryout = async (id: string) => {
  const existingTryout = await prisma.tryout.findUnique({
    where: { id },
    include: { submissions: true },
  });

  if (!existingTryout) {
    throw new Error(`Tryout with ID ${id} not found`);
  }

  if (existingTryout.submissions.length > 0) {
    throw new Error("Cannot update tryout with existing submissions");
  }

  const existingQuestions = await prisma.question.findMany({
    where: {
      tryoutId: id,
    },
  });

  for (const question of existingQuestions) {
    await prisma.choice.deleteMany({
      where: {
        questionId: question.id,
      },
    });
  }

  await prisma.question.deleteMany({
    where: {
      tryoutId: id,
    },
  });

  return await prisma.tryout.delete({
    where: { id },
  });
};
