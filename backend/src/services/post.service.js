import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import User from "../models/user.model.js";

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

export const getPosts = async ({ all, page, limit }, authenticatedUser) => {
    const filter = {};

    if (all) {
        const posts = await Post.find(filter).sort({ createdAt: -1 });

        return {
            posts: await attachPostData(posts, authenticatedUser),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
    ]);

    return {
        posts: await attachPostData(posts, authenticatedUser),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const createPost = async (data, authenticatedUser) => {
    const post = await Post.create({
        ...data,
        author: authenticatedUser._id,
    });

    return attachPostData([post], authenticatedUser).then(
        ([attached]) => attached,
    );
};

export const updatePost = async (id, data, authenticatedUser) => {
    const post = await Post.findById(id);

    if (!post) {
        const notFoundError = new Error("Post not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    // Any non-buyer (enforced at the route) may update any post.
    const updated = await Post.findByIdAndUpdate(
        post._id,
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachPostData([updated], authenticatedUser).then(
        ([attached]) => attached,
    );
};

export const deletePost = async (id, authenticatedUser) => {
    const post = await Post.findById(id);

    if (!post) {
        const notFoundError = new Error("Post not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (!post.author.equals(authenticatedUser._id)) {
        const forbiddenError = new Error("Forbidden: insufficient permissions");
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    // Remove the post along with its comments and likes.
    await Promise.all([
        Post.deleteOne({ _id: post._id }),
        Comment.deleteMany({ post: post._id }),
        Like.deleteMany({ post: post._id }),
    ]);

    return { _id: post._id };
};

export const toggleLike = async (id, authenticatedUser) => {
    const post = await Post.findById(id);

    if (!post) {
        const notFoundError = new Error("Post not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const existing = await Like.findOne({
        post: post._id,
        author: authenticatedUser._id,
    });

    let liked;

    if (existing) {
        await Like.deleteOne({ _id: existing._id });
        liked = false;
    } else {
        await Like.create({ post: post._id, author: authenticatedUser._id });
        liked = true;
    }

    const likeCount = await Like.countDocuments({ post: post._id });

    return { liked, likeCount };
};

export const getComments = async (
    id,
    { all, page, limit },
    authenticatedUser,
) => {
    const post = await Post.findById(id);

    if (!post) {
        const notFoundError = new Error("Post not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const filter = { post: post._id };

    if (all) {
        const comments = await Comment.find(filter).sort({ createdAt: 1 });

        return {
            comments: await attachCommentData(comments, authenticatedUser),
            pagination: null,
        };
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
        Comment.countDocuments(filter),
    ]);

    return {
        comments: await attachCommentData(comments, authenticatedUser),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    };
};

export const createComment = async (id, data, authenticatedUser) => {
    const post = await Post.findById(id);

    if (!post) {
        const notFoundError = new Error("Post not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    const comment = await Comment.create({
        post: post._id,
        author: authenticatedUser._id,
        message: data.message,
    });

    return attachCommentData([comment], authenticatedUser).then(
        ([attached]) => attached,
    );
};

export const updateComment = async (id, commentId, data, authenticatedUser) => {
    const comment = await Comment.findOne({ _id: commentId, post: id });

    if (!comment) {
        const notFoundError = new Error("Comment not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (!comment.author.equals(authenticatedUser._id)) {
        const forbiddenError = new Error(
            "You can only edit your own comments",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    const updated = await Comment.findByIdAndUpdate(
        comment._id,
        { $set: data },
        { returnDocument: "after", runValidators: true },
    );

    return attachCommentData([updated], authenticatedUser).then(
        ([attached]) => attached,
    );
};

export const deleteComment = async (id, commentId, authenticatedUser) => {
    const comment = await Comment.findOne({ _id: commentId, post: id });

    if (!comment) {
        const notFoundError = new Error("Comment not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    if (!comment.author.equals(authenticatedUser._id)) {
        const forbiddenError = new Error(
            "You can only delete your own comments",
        );
        forbiddenError.statusCode = 403;
        throw forbiddenError;
    }

    await Comment.deleteOne({ _id: comment._id });

    return { _id: comment._id };
};

const attachCommentData = async (comments, authenticatedUser) => {
    if (!comments.length) return [];

    const authorIds = [
        ...new Set(
            comments.map((comment) => comment.author?.toString()).filter(Boolean),
        ),
    ];

    const authors = authorIds.length
        ? await User.find({ _id: { $in: authorIds } }).select(
              "firstName middleName lastName",
          )
        : [];

    const nameByUser = new Map(
        authors.map((user) => [user._id.toString(), getFullName(user)]),
    );

    return comments.map((comment) => {
        const obj = comment.toObject();
        const authorId = obj.author?.toString();

        return {
            ...obj,
            author: authorId
                ? { _id: authorId, fullName: nameByUser.get(authorId) ?? authorId }
                : null,
            isOwn: Boolean(
                authenticatedUser && comment.author.equals(authenticatedUser._id),
            ),
        };
    });
};

const attachPostData = async (posts, authenticatedUser) => {
    if (!posts.length) return [];

    const authorIds = [
        ...new Set(
            posts.map((post) => post.author?.toString()).filter(Boolean),
        ),
    ];
    const postIds = posts.map((post) => post._id);

    const [authors, likeCounts, commentCounts, myLikes] = await Promise.all([
        authorIds.length
            ? User.find({ _id: { $in: authorIds } }).select(
                  "firstName middleName lastName",
              )
            : [],
        Like.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: "$post", count: { $sum: 1 } } },
        ]),
        Comment.aggregate([
            { $match: { post: { $in: postIds } } },
            { $group: { _id: "$post", count: { $sum: 1 } } },
        ]),
        authenticatedUser
            ? Like.find({
                  post: { $in: postIds },
                  author: authenticatedUser._id,
              }).select("post")
            : [],
    ]);

    const nameByUser = new Map(
        authors.map((user) => [user._id.toString(), getFullName(user)]),
    );
    const likeCountByPost = new Map(
        likeCounts.map((entry) => [entry._id.toString(), entry.count]),
    );
    const commentCountByPost = new Map(
        commentCounts.map((entry) => [entry._id.toString(), entry.count]),
    );
    const likedPostIds = new Set(
        myLikes.map((like) => like.post.toString()),
    );

    return posts.map((post) => {
        const obj = post.toObject();
        const authorId = obj.author?.toString();
        const postId = obj._id.toString();

        return {
            ...obj,
            author: authorId
                ? { _id: authorId, fullName: nameByUser.get(authorId) ?? authorId }
                : null,
            likeCount: likeCountByPost.get(postId) ?? 0,
            commentCount: commentCountByPost.get(postId) ?? 0,
            liked: likedPostIds.has(postId),
        };
    });
};
