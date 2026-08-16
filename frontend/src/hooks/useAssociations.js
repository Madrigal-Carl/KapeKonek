import { useQuery } from "@tanstack/react-query";
import {
    getAssociationFarmers,
    getAssociations,
} from "@/services/association.service";

export const associationKeys = {
    all: ["associations"],
    farmers: (associationId) => ["associations", "farmers", associationId],
};

export function useAssociations(options = {}) {
    return useQuery({
        queryKey: associationKeys.all,
        queryFn: () =>
            getAssociations().then((response) => response.associations),
        ...options,
    });
}

export function useAssociationFarmers(associationId, options = {}) {
    return useQuery({
        queryKey: associationKeys.farmers(associationId),
        queryFn: () =>
            getAssociationFarmers(associationId).then(
                (response) => response.farmers,
            ),
        enabled: Boolean(associationId),
        ...options,
    });
}
