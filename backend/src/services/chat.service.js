import ChatMessage from "../models/chatMessage.model.js";
import ChatRead from "../models/chatRead.model.js";
import Association from "../models/association.model.js";
import User from "../models/user.model.js";
import FarmerVerification from "../models/farmerVerification.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

// Messages can only be edited or deleted shortly after sending.
const MESSAGE_EDIT_WINDOW_MS = 3 * 60 * 1000;

const assertWithinEditWindow = (message, verb) => {
    if (Date.now() - message.createdAt.getTime() > MESSAGE_EDIT_WINDOW_MS) {
        const badRequestError = new Error(
            `Messages can only be ${verb} within 3 minutes of sending`,
        );
        badRequestError.statusCode = 400;
        throw badRequestError;
    }
};

// An association's chat is shared by its manager and its farmers.
export const isMemberOfAssociation = async (association, authenticatedUser) => {
    if (authenticatedUser.role === "manager") {
        return Boolean(
            association.user && association.user.equals(authenticatedUser._id),
        );
    }

    const verification = await FarmerVerification.findOne({
        user: authenticatedUser._id,
        association: association._id,
    });

    return Boolean(verification);
};

const assertCanAccessChat = async (association, authenticatedUser) => {
    if (await isMemberOfAssociation(association, authenticatedUser)) return;

    const forbiddenError = new Error("You are not a member of this chat");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
};

export const getChats = async (authenticatedUser) => {
    let associations = [];

    if (authenticatedUser.role === "manager") {
        associations = await Association.find({
            user: authenticatedUser._id,
        });
    } else {
        const verification = await FarmerVerification.findOne({
            user: authenticatedUser._id,
        }).select("association");

        if (verification?.association) {
            const association = await Association.findById(
                verification.association,
            );
            if (association) associations = [association];
        }
    }

    return {
        chats: await attachChatData(associations, authenticatedUser),
    };
};

export const markChatRead = async (id, authenticatedUser) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    let readState;

    try {
        readState = await ChatRead.findOneAndUpdate(
            { user: authenticatedUser._id, association: association._id },
            { $set: { lastReadAt: new Date() } },
            { upsert: true, returnDocument: "after" },
        );
    } catch (error) {
        // Concurrent upserts race on the unique {user, association} index —
        // retry as a plain update now that the document exists.
        if (error.code === 11000) {
            readState = await ChatRead.findOneAndUpdate(
                { user: authenticatedUser._id, association: association._id },
                { $set: { lastReadAt: new Date() } },
                { returnDocument: "after" },
            );
        } else {
            throw error;
        }
    }

    return {
        lastReadAt: readState.lastReadAt,
        user: {
            _id: authenticatedUser._id,
            fullName: getFullName(authenticatedUser),
        },
    };
};

export const getChatMessages = async (
    id,
    { all, page, limit },
    authenticatedUser,
) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    const filter = { association: association._id };

    if (all) {
        const messages = await ChatMessage.find(filter).sort({ createdAt: 1 });

        return {
            messages: await attachMessageData(messages),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        ChatMessage.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
        ChatMessage.countDocuments(filter),
    ]);

    return {
        messages: await attachMessageData(messages),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const sendMessage = async (id, data, authenticatedUser) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    const message = await ChatMessage.create({
        association: association._id,
        sender: authenticatedUser._id,
        text: data.text ?? "",
        attachments: data.attachments ?? [],
    });

    return attachMessageData([message]).then(([attached]) => attached);
};

export const updateMessage = async (id, messageId, data, authenticatedUser) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    const message = await ChatMessage.findOne({
        _id: messageId,
        association: association._id,
        deletedAt: null,
    });

    if (!message) {
        const notFoundError = new Error("Message not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (!message.sender.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("You can only edit your own messages");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    assertWithinEditWindow(message, "edited");

    const updated = await ChatMessage.findOneAndUpdate(
        { _id: message._id },
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachMessageData([updated]).then(([attached]) => attached);
};

export const deleteMessage = async (id, messageId, authenticatedUser) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    const message = await ChatMessage.findOne({
        _id: messageId,
        association: association._id,
        deletedAt: null,
    });

    if (!message) {
        const notFoundError = new Error("Message not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (!message.sender.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("You can only delete your own messages");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    assertWithinEditWindow(message, "deleted");

    const deleted = await ChatMessage.findOneAndUpdate(
        { _id: message._id },
        { $set: { deletedAt: new Date() } },
        { returnDocument: "after" },
    );

    return attachMessageData([deleted]).then(([attached]) => attached);
};

export const toggleReaction = async (id, messageId, data, authenticatedUser) => {
    const association = await Association.findById(id);

    if (!association) {
        const notFoundError = new Error("Chat not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    await assertCanAccessChat(association, authenticatedUser);

    const message = await ChatMessage.findOne({
        _id: messageId,
        association: association._id,
        deletedAt: null,
    });

    if (!message) {
        const notFoundError = new Error("Message not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const emoji = data.emoji;
    const reactions = message.reactions ?? [];
    const existingIndex = reactions.findIndex((reaction) =>
        reaction.user.equals(authenticatedUser._id),
    );

    if (existingIndex >= 0) {
        if (reactions[existingIndex].emoji === emoji) {
            // Same emoji again — toggle it off.
            reactions.splice(existingIndex, 1);
        } else {
            // Different emoji — replace the user's reaction.
            reactions[existingIndex].emoji = emoji;
        }
    } else {
        reactions.push({ user: authenticatedUser._id, emoji });
    }

    message.reactions = reactions;

    // Persist without touching `updatedAt` — reactions are not an edit, so
    // they should not flag the message as edited on the UI.
    await ChatMessage.findOneAndUpdate(
        { _id: message._id },
        { $set: { reactions } },
        { timestamps: false },
    );

    return attachMessageData([message]).then(([attached]) => attached);
};

const attachChatData = async (associations, authenticatedUser) => {
    if (!associations.length) return [];

    const userIds = [
        ...new Set(
            associations
                .flatMap((association) => [
                    association.user?.toString(),
                    ...(association.assignedFarmers ?? []).map((id) =>
                        id.toString(),
                    ),
                ])
                .filter(Boolean),
        ),
    ];
    const associationIds = associations.map((association) => association._id);

    const [users, messages, readStates, verifications] = await Promise.all([
        userIds.length
            ? User.find({ _id: { $in: userIds } }).select(
                  "firstName middleName lastName role",
              )
            : [],
        ChatMessage.find({
            association: { $in: associationIds },
        }).sort({ createdAt: 1 }),
        ChatRead.find({
            user: { $in: userIds },
            association: { $in: associationIds },
        }),
        FarmerVerification.find({
            user: { $in: userIds },
            association: { $in: associationIds },
            associationStatus: "approved",
        }),
    ]);

    const nameByUser = new Map(
        users.map((user) => [user._id.toString(), getFullName(user)]),
    );
    const roleByUser = new Map(
        users.map((user) => [user._id.toString(), user.role]),
    );

    // `${associationId}:${userId}` -> verified on that association.
    const verifiedByAssociationUser = new Set(
        verifications.map(
            (verification) =>
                `${verification.association.toString()}:${verification.user.toString()}`,
        ),
    );

    // Sorted ascending, so the last message per chat wins the map.
    const lastMessageByAssociation = new Map();
    for (const message of messages) {
        lastMessageByAssociation.set(message.association.toString(), message);
    }

    const lastReadAtByAssociationUser = new Map(
        readStates.map((state) => [
            `${state.association.toString()}:${state.user.toString()}`,
            state.lastReadAt,
        ]),
    );

    return Promise.all(
        associations.map(async (association) => {
            const obj = association.toObject();
            const associationId = obj._id.toString();
            const lastMessage = lastMessageByAssociation.get(associationId);
            const lastReadAt = lastReadAtByAssociationUser.get(
                `${associationId}:${authenticatedUser._id.toString()}`,
            );

            const unreadCount = await ChatMessage.countDocuments({
                association: association._id,
                deletedAt: null,
                sender: { $ne: authenticatedUser._id },
                ...(lastReadAt ? { createdAt: { $gt: lastReadAt } } : {}),
            });

            const memberMeta = (memberId) => {
                const id = memberId.toString();
                const role = roleByUser.get(id);

                return {
                    _id: id,
                    fullName: nameByUser.get(id) ?? id,
                    verified:
                        role === "farmer" &&
                        verifiedByAssociationUser.has(`${associationId}:${id}`),
                    isAdmin: role === "manager",
                };
            };

            const memberIds = [
                ...(obj.assignedFarmers ?? []),
                ...(obj.user ? [obj.user] : []),
            ];
            const members = memberIds.map(memberMeta);

            // Members who have read the latest message (the sender of that
            // message isn't a reader — they wrote it).
            const lastReadBy =
                lastMessage && lastMessage.sender
                    ? memberIds
                          .map((memberId) => ({
                              id: memberId.toString(),
                              lastReadAt: lastReadAtByAssociationUser.get(
                                  `${associationId}:${memberId.toString()}`,
                              ),
                          }))
                          .filter(
                              (entry) =>
                                  entry.id !== lastMessage.sender.toString() &&
                                  entry.lastReadAt &&
                                  entry.lastReadAt.getTime() >=
                                      lastMessage.createdAt.getTime(),
                          )
                          .map((entry) => memberMeta(entry.id))
                    : [];

            return {
                _id: obj._id,
                name: obj.name,
                members,
                lastMessage: lastMessage
                    ? {
                          _id: lastMessage._id,
                          text: lastMessage.deletedAt ? "" : lastMessage.text,
                          hasAttachments:
                              !lastMessage.deletedAt &&
                              (lastMessage.attachments ?? []).length > 0,
                          deleted: Boolean(lastMessage.deletedAt),
                          sender: lastMessage.sender
                              ? memberMeta(lastMessage.sender)
                              : null,
                          createdAt: lastMessage.createdAt,
                      }
                    : null,
                lastReadBy,
                unreadCount,
            };
        }),
    );
};

const attachMessageData = async (messages) => {
    if (!messages.length) return [];

    const senderIds = [
        ...new Set(
            messages.map((message) => message.sender?.toString()).filter(Boolean),
        ),
    ];
    const reactionUserIds = [
        ...new Set(
            messages
                .flatMap((message) =>
                    (message.reactions ?? []).map((reaction) =>
                        reaction.user?.toString(),
                    ),
                )
                .filter(Boolean),
        ),
    ];
    const associationIds = [
        ...new Set(
            messages
                .map((message) => message.association?.toString())
                .filter(Boolean),
        ),
    ];

    const chatReads = associationIds.length
        ? await ChatRead.find({ association: { $in: associationIds } })
        : [];

    const readUserIds = [
        ...new Set(
            chatReads.map((read) => read.user.toString()).filter(Boolean),
        ),
    ];

    const allUserIds = [
        ...new Set([...senderIds, ...reactionUserIds, ...readUserIds]),
    ];

    const [senders, verifications] = await Promise.all([
        allUserIds.length
            ? User.find({ _id: { $in: allUserIds } }).select(
                  "firstName middleName lastName role",
              )
            : [],
        allUserIds.length
            ? FarmerVerification.find({
                  user: { $in: allUserIds },
                  associationStatus: "approved",
              })
            : [],
    ]);

    const nameByUser = new Map(
        senders.map((user) => [user._id.toString(), getFullName(user)]),
    );
    const roleByUser = new Map(
        senders.map((user) => [user._id.toString(), user.role]),
    );

    // associationId -> Set(verified user ids)
    const verifiedByAssociation = new Map();
    for (const verification of verifications) {
        const associationId = verification.association.toString();
        const userId = verification.user.toString();
        if (!verifiedByAssociation.has(associationId)) {
            verifiedByAssociation.set(associationId, new Set());
        }
        verifiedByAssociation.get(associationId).add(userId);
    }

    // associationId -> ChatRead docs
    const readsByAssociation = new Map();
    for (const read of chatReads) {
        const associationId = read.association.toString();
        if (!readsByAssociation.has(associationId)) {
            readsByAssociation.set(associationId, []);
        }
        readsByAssociation.get(associationId).push(read);
    }

    return messages.map((message) => {
        const obj = message.toObject();
        const senderId = obj.sender?.toString();
        const role = roleByUser.get(senderId);
        const associationId = obj.association?.toString();
        const createdAt = message.createdAt.getTime();

        // Recalled messages render as an empty tombstone — no content,
        // attachments or reactions leak back to any client.
        if (obj.deletedAt) {
            return {
                _id: obj._id,
                sender: senderId
                    ? {
                          _id: senderId,
                          fullName: nameByUser.get(senderId) ?? senderId,
                          isAdmin: role === "manager",
                      }
                    : null,
                createdAt: obj.createdAt,
                updatedAt: obj.updatedAt,
                deleted: true,
                text: "",
                hasAttachments: false,
                attachments: [],
                reactions: [],
                seenBy: [],
            };
        }

        // Aggregate reactions: emoji -> who reacted.
        const byEmoji = {};
        for (const reaction of obj.reactions ?? []) {
            const userId = reaction.user?.toString();
            if (!byEmoji[reaction.emoji]) byEmoji[reaction.emoji] = [];
            byEmoji[reaction.emoji].push({
                _id: userId,
                fullName: nameByUser.get(userId) ?? userId,
            });
        }
        const reactions = Object.entries(byEmoji).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users,
        }));

        // "Seen by" — non-sender members whose read state covers this message.
        const seenBy = (readsByAssociation.get(associationId) ?? [])
            .filter((read) => read.user.toString() !== senderId)
            .filter((read) => read.lastReadAt.getTime() >= createdAt)
            .map((read) => ({
                _id: read.user.toString(),
                fullName:
                    nameByUser.get(read.user.toString()) ?? read.user.toString(),
            }));

        return {
            ...obj,
            reactions,
            seenBy,
            sender: senderId
                ? {
                      _id: senderId,
                      fullName: nameByUser.get(senderId) ?? senderId,
                      verified:
                          role === "farmer" &&
                          Boolean(
                              verifiedByAssociation
                                  .get(associationId)
                                  ?.has(senderId),
                          ),
                      isAdmin: role === "manager",
                  }
                : null,
        };
    });
};
