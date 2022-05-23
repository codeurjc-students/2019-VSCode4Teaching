import winston, { Logger } from "winston";

export let v4tLogger: Logger = winston.createLogger({
    level: 'debug',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) =>
            `${timestamp} [${level}]: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console()
    ]
});