import { useQuery } from "@tanstack/react-query";
import { getAssociations } from "@/services/association.service";

export const associationKeys = {
    all: ["associations"],
};

export function useAssociations(options = {}) {
    return useQuery({
        queryKey: associationKeys.all,
        queryFn: () =>
            getAssociations().then((response) => response.associations),
        ...options,
    });
}
