import users from '../models/user.model.js';

export const getUsersByRole = async (roleType) => {
  return await users.find({ roleType }).select('-password');
};
