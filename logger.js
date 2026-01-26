import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

const { combine, timestamp, label, printf } = winston.format;

const logDir = `${process.cwd()}/logs`;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const createDomainLogger = (domain) => {
  return winston.createLogger({
    // 로그 출력 형식
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      label({ label: `심플톡-${domain}` }),
      logFormat,
    ),

    transports: [
      new winstonDaily({
        level: "info",
        datePattern: "YYYY-MM-DD",
        dirname: `${logDir}/${domain}/info`,
        filename: `${domain}-info-%DATE%.log`,
        maxFiles: 90, // 90일치 로그를 남김
        zippedArchive: true,
      }),

      new winstonDaily({
        level: "error",
        datePattern: "YYYY-MM-DD",
        dirname: `${logDir}/${domain}/error`,
        filename: `${domain}-error-%DATE%.log`,
        maxFiles: 90,
        zippedArchive: true,
      }),
    ],
    // uncaughtException 발생시 파일 설정
    exceptionHandlers: [
      new winstonDaily({
        level: "error",
        datePattern: "YYYY-MM-DD",
        dirname: `${logDir}/${domain}/exception`,
        filename: `${domain}-exception-%DATE%.log`,
        maxFiles: 30,
        zippedArchive: true,
      }),
    ],
  });
};

// 기능별 logger객체
export const batchLogger = createDomainLogger("batch");
export const authLogger = createDomainLogger("auth");
export const userLogger = createDomainLogger("user");
export const messageLogger = createDomainLogger("message");
export const roomLogger = createDomainLogger("room");

// 개발 환경일 경우 화면에서 바로 찍게 설정
const loggers = [
  authLogger,
  userLogger,
  messageLogger,
  roomLogger,
  batchLogger,
];

if (process.env.NODE_ENV !== "production") {
  loggers.forEach((logger) => {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    );
  });
}
