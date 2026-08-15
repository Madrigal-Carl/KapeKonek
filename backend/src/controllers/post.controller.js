import {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    getComments,
    createComment,
    updateComment,
    deleteComment,
} from "../services/post.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPostsHandler = asyncHandler(async (req, res) => {
    const { posts, pagination } = await getPosts(req.query, req.user);

    return res.status(200).json({
        message: "Posts fetched successfully",
        posts,
        pagination,
    });
});

export const createPostHandler = asyncHandler(async (req, res) => {
    const post = await createPost(req.body, req.user);

    return res.status(201).json({
        message: "Post created successfully",
        post,
    });
});

export const updatePostHandler = asyncHandler(async (req, res) => {
    const post = await updatePost(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Post updated successfully",
        post,
    });
});

export const deletePostHandler = asyncHandler(async (req, res) => {
    const post = await deletePost(req.params.id, req.user);

    return res.status(200).json({
        message: "Post deleted successfully",
        post,
    });
});

export const toggleLikeHandler = asyncHandler(async (req, res) => {
    const result = await toggleLike(req.params.id, req.user);

    return res.status(200).json({
        message: result.liked ? "Post liked" : "Post unliked",
        ...result,
    });
});

export const getCommentsHandler = asyncHandler(async (req, res) => {
    const { comments, pagination } = await getComments(
        req.params.id,
        req.query,
        req.user,
    );

    return res.status(200).json({
        message: "Comments fetched successfully",
        comments,
        pagination,
    });
});

export const createCommentHandler = asyncHandler(async (req, res) => {
    const comment = await createComment(req.params.id, req.body, req.user);

    return res.status(201).json({
        message: "Comment created successfully",
        comment,
    });
});

export const updateCommentHandler = asyncHandler(async (req, res) => {
    const comment = await updateComment(
        req.params.id,
        req.params.commentId,
        req.body,
        req.user,
    );

    return res.status(200).json({
        message: "Comment updated successfully",
        comment,
    });
});

export const deleteCommentHandler = asyncHandler(async (req, res) => {
    const comment = await deleteComment(
        req.params.id,
        req.params.commentId,
        req.user,
    );

    return res.status(200).json({
        message: "Comment deleted successfully",
        comment,
    });
});
