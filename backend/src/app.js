import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import accountRoutes from "./routes/account.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import trackerRoutes from "./routes/trackers/index.js";
import chatRoomRoutes from "./routes/chatRoom.routes.js";
import chatMessageRoutes from "./routes/chatMessage.routes.js";
import communityProfileRoutes from "./routes/communityProfile.routes.js";
import communityPostRoutes from "./routes/communityPost.routes.js";
import postCommentRoutes from "./routes/postComment.routes.js";
import commentLikeRoutes from "./routes/commentLike.routes.js";
import chatbotRoutes from "./routes/chatbot/chatbot.routes.js";
import privateRoomRoutes from "./routes/privateRoom.routes.js";
import directConversationRoutes from "./routes/directConversation.routes.js";
import directMessageRoutes from "./routes/directMessage.routes.js";
import reportRoutes from "./routes/report.routes.js";
import notificationRoutes from "./routes/notification/notification.routes.js";

import journalRoutes from "./routes/journal/index.js";
import dassRoutes from "./routes/dass.routes.js";

import {
  generalLimiter
} from "./middleware/rateLimiter.js";

import {
  notFound
} from "./middleware/notFound.js";

import {
  errorHandler
} from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",

    credentials: true
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsing Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Global Rate Limiter
|--------------------------------------------------------------------------
*/

app.use(generalLimiter);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "UNWIND API is running 🚀"
  });
});

app.use(
  "/api/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| Authentication and Account Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/password",
  passwordRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/account",
  accountRoutes
);

app.use(
  "/api/chatbot",
  chatbotRoutes
);
/*
|--------------------------------------------------------------------------
| Community Profile and Post Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/community",
  communityProfileRoutes
);

app.use(
  "/api/community/posts",
  communityPostRoutes
);

app.use(
  "/api/community",
  postCommentRoutes
);

app.use(
  "/api/community",
  commentLikeRoutes
);

/*
|--------------------------------------------------------------------------
| Community Chat Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/community/chat",
  chatRoomRoutes
);

app.use(
  "/api/community/chat",
  chatMessageRoutes
);

/*
|--------------------------------------------------------------------------
| Private Room Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/community/private-rooms",
  privateRoomRoutes
);

/*
|--------------------------------------------------------------------------
| Direct Message Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/community/direct-conversations",
  directConversationRoutes
);

app.use(
  "/api/community/direct-messages",
  directMessageRoutes
);

/*
|--------------------------------------------------------------------------
| Report Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/community/reports",
  reportRoutes
);

/*
|--------------------------------------------------------------------------
| DASS-21 Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/dass",
  dassRoutes
);

/*
|--------------------------------------------------------------------------
| Journal Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/journal",
  journalRoutes
);

app.use(
  "/api/trackers",
  trackerRoutes
);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
|
| This middleware must remain last.
|
*/

app.use(errorHandler);

export default app;