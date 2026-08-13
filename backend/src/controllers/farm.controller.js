import {
    getFarms,
    getJoinableFarms,
    createFarm,
    updateFarm,
    deleteFarm,
    joinFarm,
    leaveFarm,
} from "../services/farm.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFarmsHandler = asyncHandler(async (req, res) => {
    const { farms, pagination } = await getFarms(req.query, req.user);

    return res.status(200).json({
        message: "Farms fetched successfully",
        farms,
        pagination,
    });
});

export const getJoinableFarmsHandler = asyncHandler(async (req, res) => {
    const { farms } = await getJoinableFarms(req.user);

    return res.status(200).json({
        message: "Joinable farms fetched successfully",
        farms,
    });
});

export const createFarmHandler = asyncHandler(async (req, res) => {
    const farm = await createFarm(req.body, req.user);

    return res.status(201).json({
        message: "Farm created successfully",
        farm,
    });
});

export const updateFarmHandler = asyncHandler(async (req, res) => {
    const farm = await updateFarm(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Farm updated successfully",
        farm,
    });
});

export const deleteFarmHandler = asyncHandler(async (req, res) => {
    const farm = await deleteFarm(req.params.id, req.user);

    return res.status(200).json({
        message: "Farm deleted successfully",
        farm,
    });
});

export const joinFarmHandler = asyncHandler(async (req, res) => {
    const farm = await joinFarm(req.params.id, req.user);

    return res.status(200).json({
        message: "Farm joined successfully",
        farm,
    });
});

export const leaveFarmHandler = asyncHandler(async (req, res) => {
    const farm = await leaveFarm(req.params.id, req.user);

    return res.status(200).json({
        message: "Farm left successfully",
        farm,
    });
});
