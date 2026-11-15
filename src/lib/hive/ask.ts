import { composeAnswer, saveAnswer } from "./answer";
import { assembleContext } from "./context";
import { hiveConnection } from "./db";
import type { AskResponse } from "./types";

export const askHive = (question: string): AskResponse => {
  const conn = hiveConnection();
  const bundle = assembleContext(conn, question);
  const answer = composeAnswer(bundle);
  saveAnswer(conn, answer, bundle.usedIds, bundle.anchorId);
  return { answer, bundle };
};
