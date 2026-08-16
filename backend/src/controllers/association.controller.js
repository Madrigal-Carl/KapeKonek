import {
    getAssociations,
    getAssociationFarmers,
} from "../services/association.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAssociationsHandler = asyncHandler(async (req, res) => {
    const associations = await getAssociations();

    return res.status(200).json({
        message: "Associations fetched successfully",
        associations,
    });
});

export const getAssociationFarmersHandler = asyncHandler(async (req, res) => {
    const farmers = await getAssociationFarmers(req.params.id);

    return res.status(200).json({
        message: "Association farmers fetched successfully",
        farmers,
    });
});
