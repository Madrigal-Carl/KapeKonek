import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Association from "../models/association.model.js";
import { isMemberOfAssociation } from "../services/chat.service.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

let io = null;

// Broadcasts a chat event to every connected member of the chat room.
export const broadcastToChat = (chatId, event, payload) => {
    io?.to(chatId).emit(event, payload);
};

export const initChatSocket = (server) => {
    const clientUrl = process.env.CLIENT_URL;

    io = new Server(server, {
        cors: {
            origin: clientUrl
                ? clientUrl
                      .split(",")
                      .map((url) => url.trim().replace(/\/+$/, ""))
                : true,
            methods: ["GET", "POST"],
        },
    });

    // Authentication middleware — the token is minted by
    // GET /api/chats/socket-token and sent via the handshake auth payload.
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.userId);

            // Only managers and farmers use the chat.
            if (!user || !["manager", "farmer"].includes(user.role)) {
                return next(new Error("Unauthorized"));
            }

            socket.user = user;
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;

        socket.emit("chat:connected", {
            user: { _id: user._id, fullName: getFullName(user) },
        });

        socket.on("chat:join", async (associationId, ack) => {
            const association = await Association.findById(associationId);

            if (
                !association ||
                !(await isMemberOfAssociation(association, user))
            ) {
                if (typeof ack === "function") {
                    ack({ ok: false, error: "You are not a member of this chat" });
                }
                return;
            }

            await socket.join(associationId);

            if (typeof ack === "function") {
                ack({ ok: true });
            }
        });

        socket.on("chat:leave", (chatId) => {
            socket.leave(chatId);
        });

        socket.on("chat:typing", (chatId) => {
            socket.to(chatId).emit("chat:typing", {
                chatId,
                sender: { _id: user._id, fullName: getFullName(user) },
            });
        });
    });

    return io;
};
