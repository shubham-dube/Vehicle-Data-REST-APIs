const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const helmet = require('helmet');

const cluster = require('cluster');
const os = require('os');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const morgan = require('morgan');
const winston = require('winston');
const userRouter = require('./router.js');


const numCPUs = os.cpus().length;
const port = process.env.PORT || 5000;

if (cluster.isMaster) {
    console.log(`Master process PID: ${process.pid}`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Respawning...`);
        cluster.fork();
    });

} else {
    const app = express();

    const limiter = rateLimit({
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || 24 *60 * 60 * 1000,
        max: process.env.RATE_LIMIT_MAX || 50,
        message: 'Too many requests from this IP, please try again later.'
    });

    app.use(limiter);
    app.use(cors());
    app.use(bodyParser.json());
    app.use(helmet());

    if (process.env.NODE_ENV === 'production') {
        app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    } else {
        app.use(morgan('dev'));
    }

    app.use("/", userRouter);

    app.listen(port, () => {
        console.log(`Worker process PID: ${process.pid} running at http://localhost:${port}/`);
    });

    process.on('SIGINT', () => {
        console.log(`Worker ${process.pid} exiting...`);
        process.exit(0);
    });
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
