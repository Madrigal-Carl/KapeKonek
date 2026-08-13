import ChatMessage from "../models/chatMessage.model.js";
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
        chats: await attachChatData(associations),
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

    const filter = { association: association._id, deletedAt: null };

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

    return { _id: deleted._id, deletedAt: deleted.deletedAt };
};

const attachChatData = async (associations) => {
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

    const [users, messages] = await Promise.all([
        userIds.length
            ? User.find({ _id: { $in: userIds } }).select(
                  "firstName middleName lastName",
              )
            : [],
        ChatMessage.find({
            association: { $in: associations.map((a) => a._id) },
            deletedAt: null,
        }).sort({ createdAt: 1 }),
    ]);

    const nameByUser = new Map(
        users.map((user) => [user._id.toString(), getFullName(user)]),
    );

    // Sorted ascending, so the last message per chat wins the map.
    const lastMessageByAssociation = new Map();
    for (const message of messages) {
        lastMessageByAssociation.set(message.association.toString(), message);
    }

    return associations.map((association) => {
        const obj = association.toObject();
        const lastMessage = lastMessageByAssociation.get(obj._id.toString());

        return {
            _id: obj._id,
            name: obj.name,
            members: [
                ...(obj.assignedFarmers ?? []),
                ...(obj.user ? [obj.user] : []),
            ].map((memberId) => {
                const id = memberId.toString();
                return { _id: id, fullName: nameByUser.get(id) ?? id };
            }),
            lastMessage: lastMessage
                ? {
                      _id: lastMessage._id,
                      text: lastMessage.text,
                      hasAttachments:
                          (lastMessage.attachments ?? []).length > 0,
                      sender: lastMessage.sender
                          ? {
                                _id: lastMessage.sender.toString(),
                                fullName:
                                    nameByUser.get(
                                        lastMessage.sender.toString(),
                                    ) ?? lastMessage.sender.toString(),
                            }
                          : null,
                      createdAt: lastMessage.createdAt,
                  }
                : null,
        };
    });
};

const attachMessageData = async (messages) => {
    if (!messages.length) return [];

    const senderIds = [
        ...new Set(
            messages.map((message) => message.sender?.toString()).filter(Boolean),
        ),
    ];

    const senders = senderIds.length
        ? await User.find({ _id: { $in: senderIds } }).select(
              "firstName middleName lastName",
          )
        : [];

    const nameByUser = new Map(
        senders.map((user) => [user._id.toString(), getFullName(user)]),
    );

    return messages.map((message) => {
        const obj = message.toObject();
        const senderId = obj.sender?.toString();

        return {
            ...obj,
            sender: senderId
                ? { _id: senderId, fullName: nameByUser.get(senderId) ?? senderId }
                : null,
        };
    });
};
