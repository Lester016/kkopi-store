import logger from "pino";
import dayjs from "dayjs";

const log = logger({
  // pino logger configs
  transport: {
    target: "pino-pretty",
  },
  level: "info",
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
