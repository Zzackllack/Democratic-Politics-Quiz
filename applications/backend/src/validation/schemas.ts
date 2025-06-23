import Joi from "joi";

// Player validation schemas
export const createPlayerSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  score: Joi.number().integer().min(0).required(),
  browserSessionId: Joi.string().optional(),
});

export const updatePlayerSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  score: Joi.number().integer().min(0).optional(),
  isOnline: Joi.boolean().optional(),
});

// Lobby validation schemas
export const createLobbySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  maxPlayers: Joi.number().integer().min(2).max(10).required(),
  gameMode: Joi.string()
    .valid("einfach", "mittel", "schwer", "lustig", "einbürgerungstest")
    .required(),
  hostId: Joi.string().required(),
});

export const joinLobbySchema = Joi.object({
  playerId: Joi.string().required(),
  code: Joi.string().length(6).required(),
});

// Game validation schemas
export const submitAnswerSchema = Joi.object({
  questionId: Joi.string().required(),
  selectedAnswer: Joi.string().allow(null).required(),
  timeSpent: Joi.number().integer().min(0).max(60).required(),
});

// Question validation schemas
export const getQuestionsSchema = Joi.object({
  difficulty: Joi.string()
    .valid("einfach", "mittel", "schwer", "lustig", "einbürgerungstest")
    .optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  type: Joi.string().valid("multiple-choice", "true-false").optional(),
});

// Game mode validation schemas
export const createGameModeSchema = Joi.object({
  id: Joi.string().required(),
  label: Joi.string().min(1).max(50).required(),
  description: Joi.string().min(1).max(200).required(),
  color: Joi.string().required(),
  icon: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});
