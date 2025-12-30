export async function create(userData) {
  console.log('Creating user:', userData);
  return { id: 'mock_user_id', ...userData };
}

export async function findByEmail(email) {
  return null;
}

// Alias for compatibility
export const User = { create, findByEmail };

export default { create, findByEmail, User };
