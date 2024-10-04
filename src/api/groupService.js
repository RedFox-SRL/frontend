import { getData, postData } from './apiService';

export const getGroupMembers = async (groupId) => {
  try {
    const response = await getData(`/groups/${groupId}/members`);
    return response;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};

export const removeMember = async (memberId) => {
  return await postData(`/groups/remove-member/${memberId}`);
};

export const assignRole = async (memberId, role) => {
  return await postData(`/groups/assign-role/${memberId}`, { role });
};

export const getGroupDetails = async () => {
  return await getData('/groups/details');
};