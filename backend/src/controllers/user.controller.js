import {
    getUsers,
    getAvailableFarmers,
    createUser,
    updateUser,
    deleteUser,
    reviewAccount,
    reviewAssociation,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUsersHandler = asyncHandler(async (req, res) => {
    const { users, pagination } = await getUsers(req.query, req.user);

    return res.status(200).json({
        message: "Users fetched successfully",
        users,
        pagination,
    });
});

export const getAvailableFarmersHandler = asyncHandler(async (req, res) => {
    const farmers = await getAvailableFarmers();

    return res.status(200).json({
        message: "Available farmers fetched successfully",
        farmers,
    });
});

export const createUserHandler = asyncHandler(async (req, res) => {
    const user = await createUser(req.body, req.user);

    return res.status(201).json({
        message: "User created successfully",
        user,
    });
});

export const updateUserHandler = asyncHandler(async (req, res) => {
    const user = await updateUser(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "User updated successfully",
        user,
    });
});

export const deleteUserHandler = asyncHandler(async (req, res) => {
    const user = await deleteUser(req.params.id, req.user);

    return res.status(200).json({
        message: "User deleted successfully",
        user,
    });
});

export const reviewAccountHandler = asyncHandler(async (req, res) => {
    const verification = await reviewAccount(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Account review updated successfully",
        verification,
    });
});

export const reviewAssociationHandler = asyncHandler(async (req, res) => {
    const verification = await reviewAssociation(
        req.params.id,
        req.body,
        req.user,
    );

    return res.status(200).json({
        message: "Association review updated successfully",
        verification,
    });
});
