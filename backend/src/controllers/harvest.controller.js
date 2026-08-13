import {
    getHarvests,
    createHarvest,
    updateHarvest,
    deleteHarvest,
} from "../services/harvest.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getHarvestsHandler = asyncHandler(async (req, res) => {
    const { harvests, pagination } = await getHarvests(req.query, req.user);

    return res.status(200).json({
        message: "Harvests fetched successfully",
        harvests,
        pagination,
    });
});

export const createHarvestHandler = asyncHandler(async (req, res) => {
    const harvest = await createHarvest(req.body, req.user);

    return res.status(201).json({
        message: "Harvest created successfully",
        harvest,
    });
});

export const updateHarvestHandler = asyncHandler(async (req, res) => {
    const harvest = await updateHarvest(req.params.id, req.body, req.user);

    return res.status(200).json({
        message: "Harvest updated successfully",
        harvest,
    });
});

export const deleteHarvestHandler = asyncHandler(async (req, res) => {
    const harvest = await deleteHarvest(req.params.id, req.user);

    return res.status(200).json({
        message: "Harvest deleted successfully",
        harvest,
    });
});
