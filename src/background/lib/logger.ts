import Logger from "@/lib/logger";

export const backgroundLogger = new Logger({ prefix: '[Background]' });
export const contentLogger = new Logger({ prefix: '[Content]' });