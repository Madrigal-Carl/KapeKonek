import api from "@/api/axios";

export async function getPosts(params = {}) {
  const response = await api.get("/posts", { params });
  return response.data;
}

export async function createPost(data) {
  const response = await api.post("/posts", data);
  return response.data;
}

export async function updatePost(id, data) {
  const response = await api.patch(`/posts/${id}`, data);
  return response.data;
}

export async function deletePost(id) {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
}

export async function togglePostLike(id) {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
}

export async function getPostComments(postId, params = {}) {
  const response = await api.get(`/posts/${postId}/comments`, { params });
  return response.data;
}

export async function createComment(postId, data) {
  const response = await api.post(`/posts/${postId}/comments`, data);
  return response.data;
}

export async function updateComment(postId, commentId, data) {
  const response = await api.patch(
    `/posts/${postId}/comments/${commentId}`,
    data,
  );
  return response.data;
}

export async function deleteComment(postId, commentId) {
  const response = await api.delete(
    `/posts/${postId}/comments/${commentId}`,
  );
  return response.data;
}
