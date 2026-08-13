import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getAvailableFarmers,
  getUsers,
  reviewAccount,
  reviewAssociation,
  updateUser,
} from "@/services/user.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const userKeys = {
  all: ["users"],
  list: (filters) => ["users", "list", filters],
  available: ["users", "available"],
};

export function useUsers(filters = {}, options = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters).then((response) => response.users),
    ...options,
  });
}

export function useAvailableFarmers() {
  return useQuery({
    queryKey: userKeys.available,
    queryFn: () =>
      getAvailableFarmers().then((response) => response.farmers),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess("User created successfully");
    },
    onError: (error) => notifyError(error, "Failed to create user"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess("Changes saved successfully");
    },
    onError: (error) => notifyError(error, "Failed to update user"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess("User archived successfully");
    },
    onError: (error) => notifyError(error, "Failed to archive user"),
  });
}

export function useReviewAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reviewAccount(id, data),
    onSuccess: (_result, { data }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess(
        data.status === "approved"
          ? "Account approved successfully"
          : "Account denied successfully",
      );
    },
    onError: (error) => notifyError(error, "Failed to update account review"),
  });
}

export function useReviewAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reviewAssociation(id, data),
    onSuccess: (_result, { data }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess(
        data.status === "approved"
          ? "Association approved successfully"
          : "Association denied successfully",
      );
    },
    onError: (error) =>
      notifyError(error, "Failed to update association review"),
  });
}
