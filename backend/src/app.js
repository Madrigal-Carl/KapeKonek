import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/error.middleware.js";
import uploadRoutes from "./routes/upload.routes.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import farmRoutes from "./routes/farm.routes.js";
import harvestRoutes from "./routes/harvest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import postRoutes from "./routes/post.routes.js";
import productRoutes from "./routes/product.routes.js";
import associationRoutes from "./routes/association.routes.js";
import orderRoutes from "./routes/order.routes.js";
import coffeeBeanRoutes from "./routes/coffeeBean.routes.js";

const app = express();

const allowedOrigins = [process.env.CLIENT_URL]
  .filter(Boolean)
  .map((url) => url.replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/harvests", harvestRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);
app.use("/api/associations", associationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coffee-beans", coffeeBeanRoutes);

app.use(errorHandler);

export default app;
