import { getAssociations } from "../services/association.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAssociationsHandler = asyncHandler(async (req, res) => {
    const associations = await getAssociations();

    return res.status(200).json({
        message: "Associations fetched successfully",
        associations,
    });
});
