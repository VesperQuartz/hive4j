import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Database, type Connection } from "@relate/relate";

type HiveHandle = {
  database: Database;
  connection: Connection;
};

const globalForHive = globalThis as typeof globalThis & {
  hiveHandle?: HiveHandle;
};

const paths = () => {
  const root = resolve(process.cwd());
  return {
    seed: join(root, "data/seed/hive.rl"),
    run: join(root, "data/run/hive.rl"),
  };
};

const prepareRunStore = () => {
  const { seed, run } = paths();
  if (!existsSync(seed)) {
    throw new Error("The Hive store is missing. Run `bun run hive:seed` first.");
  }
  if (!existsSync(run)) {
    mkdirSync(dirname(run), { recursive: true });
    copyFileSync(seed, run);
  }
  return run;
};

const openStore = (path: string): Database => {
  try {
    return Database.open(path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not open the Hive store at ${path}. Another process may be writing it; stop the other dev server and try again. (${message})`,
    );
  }
};

export const hiveHandle = (): HiveHandle => {
  if (!globalForHive.hiveHandle) {
    const database = openStore(prepareRunStore());
    globalForHive.hiveHandle = { database, connection: database.connect() };
  }
  return globalForHive.hiveHandle;
};

export const hiveConnection = (): Connection => hiveHandle().connection;
