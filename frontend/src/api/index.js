import { request } from './client';

export const authApi = {
  register: (data) => request('post', '/auth/register', data),
  login: (data) => request('post', '/auth/login', data),
  forgotPassword: (data) => request('post', '/auth/forgot-password', data),
  resetPassword: (data) => request('post', '/auth/reset-password', data),
  me: () => request('get', '/auth/me'),
};

export const groupsApi = {
  list: () => request('get', '/groups'),
  get: (id) => request('get', `/groups/${id}`),
  create: (data) => request('post', '/groups', data),
  rename: (id, data) => request('put', `/groups/${id}`, data),
  remove: (id) => request('delete', `/groups/${id}`),
  addMember: (id, data) => request('post', `/groups/${id}/members`, data),
  removeMember: (id, userId) => request('delete', `/groups/${id}/members/${userId}`),
};

export const assignmentsApi = {
  list: () => request('get', '/assignments'),
  get: (id) => request('get', `/assignments/${id}`),
  create: (data) => request('post', '/assignments', data),
  update: (id, data) => request('put', `/assignments/${id}`, data),
  remove: (id) => request('delete', `/assignments/${id}`),
};

export const submissionsApi = {
  confirm: (data) => request('post', '/submissions', data),
  forAssignment: (id) => request('get', `/submissions/assignment/${id}`),
  withdraw: (assignmentId, groupId) => request('delete', `/submissions/${assignmentId}/${groupId}`),
  myProgress: () => request('get', '/submissions/my-progress'),
};

export const adminApi = {
  overview: () => request('get', '/admin/overview'),
  analytics: () => request('get', '/admin/analytics'),
  groups: () => request('get', '/admin/groups'),
  students: () => request('get', '/admin/students'),
};
