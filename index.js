import express from "express";
import dotenv from "dotenv";
import http from "http";
import helmet from "helmet";
import { setupWebSocket } from "./websocket_server/websocket.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import reelsRoutes from "./routes/reel.route.js";
import businessRoutes from "./routes/business.route.js";
import messagesRoutes from "./routes/message.route.js";
import gamesRoutes from "./routes/game.route.js";
import notificationRoutes from "./routes/notification.route.js";
import paymantRoutes from "./routes/payment.route.js";
import connectDB from "./lib/db.js";
import compression from "compression";
import poolStatusUpdateCron from "./cron/update_pools_status_cron.js";
import cors from "cors";
dotenv.config();
import cookieParser from "cookie-parser";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Middlewares
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] === "http") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

if (isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://www.paypal.com", "https://apis.google.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        },
      },
    })
  );
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow this origin, ${origin}`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(
  compression({
    level: 6,
    threshold: 10 * 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/reel", reelsRoutes);
app.use("/api/v1/message", messagesRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/business", businessRoutes);
app.use("/api/v1/game", gamesRoutes);
app.use("/api/v1/payment", paymantRoutes);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  setupWebSocket(server);
  connectDB();
  poolStatusUpdateCron();
});
