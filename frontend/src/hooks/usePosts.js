import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getPostComments,
  getPosts,
  togglePostLike,
  updateComment,
  updatePost,
} from "@/services/post.service";
import { notifyError, notifySuccess } from "@/utils/notify";

export const postKeys = {
  all: ["posts"],
  list: (filters) => ["posts", "list", filters],
  comments: (postId) => ["posts", "comments", postId],
  infinite: (filters) => ["posts", "infinite", filters],
};

export function usePosts(filters = {}, options = {}) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => getPosts(filters).then((response) => response.posts),
    ...options,
  });
}

export function useInfinitePosts(filters = {}, options = {}) {
  const limit = filters.limit ?? 10;
  const queryFilters = { ...filters };
  delete queryFilters.limit;

  return useInfiniteQuery({
    queryKey: postKeys.infinite(filters),
    queryFn: ({ pageParam }) =>
      getPosts({ ...queryFilters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination || pagination.page >= pagination.totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
    ...options,
  });
}

export function usePostComments(postId, options = {}) {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () =>
      getPostComments(postId, { all: true }).then(
        (response) => response.comments,
      ),
    enabled: Boolean(postId),
    ...options,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      notifySuccess("Post published");
    },
    onError: (error) => notifyError(error, "Failed to create post"),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      notifySuccess("Post updated");
    },
    onError: (error) => notifyError(error, "Failed to update post"),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      notifySuccess("Post deleted");
    },
    onError: (error) => notifyError(error, "Failed to delete post"),
  });
}

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => togglePostLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: () => undefined,
  });
}

// Keeps the like UI optimistic while coalescing rapid toggles into one
// request after the user pauses. If the final state equals the server state,
// no request is sent at all.
export function useDebouncedPostLike(
  postId,
  { liked = false, likeCount = 0 } = {},
  delay = 500,
) {
  const mutation = useTogglePostLike();
  const [state, setState] = useState({
    liked: Boolean(liked),
    likeCount: likeCount ?? 0,
  });
  const stateRef = useRef(state);
  const serverRef = useRef({ liked: Boolean(liked), likeCount: likeCount ?? 0 });
  const desiredRef = useRef(Boolean(liked));
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);

  const setLocalState = (next) => {
    stateRef.current = next;
    desiredRef.current = next.liked;
    setState(next);
  };

  useEffect(() => {
    if (inFlightRef.current || timerRef.current) return;
    const incoming = { liked: Boolean(liked), likeCount: likeCount ?? 0 };
    serverRef.current = incoming;
    setLocalState(incoming);
  }, [liked, likeCount]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const sync = () => {
    timerRef.current = null;
    if (inFlightRef.current) return;

    const desired = desiredRef.current;
    const server = serverRef.current;
    if (desired === server.liked) {
      setLocalState(server);
      return;
    }

    inFlightRef.current = true;
    mutation.mutate(postId, {
      onSuccess: (data) => {
        inFlightRef.current = false;
        const nextServer = {
          liked: Boolean(data.liked),
          likeCount: data.likeCount ?? server.likeCount,
        };
        serverRef.current = nextServer;

        if (desiredRef.current !== nextServer.liked) {
          setLocalState({
            liked: desiredRef.current,
            likeCount: Math.max(
              0,
              nextServer.likeCount +
                (desiredRef.current ? 1 : -1),
            ),
          });
          schedule();
        } else {
          setLocalState(nextServer);
        }
      },
      onError: () => {
        inFlightRef.current = false;
        setLocalState(serverRef.current);
      },
    });
  };

  const schedule = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(sync, delay);
  };

  const toggle = () => {
    const current = stateRef.current;
    setLocalState({
      liked: !current.liked,
      likeCount: Math.max(0, current.likeCount + (current.liked ? -1 : 1)),
    });
    schedule();
  };

  return {
    liked: state.liked,
    likeCount: state.likeCount,
    toggle,
    isPending: mutation.isPending,
  };
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }) => createComment(postId, data),
    onSuccess: (_result, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => notifyError(error, "Failed to post comment"),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId, data }) =>
      updateComment(postId, commentId, data),
    onSuccess: (_result, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (error) => notifyError(error, "Failed to update comment"),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }) => deleteComment(postId, commentId),
    onSuccess: (_result, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => notifyError(error, "Failed to delete comment"),
  });
}
