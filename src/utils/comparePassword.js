import bcrypt from 'bcryptjs';
export async function comparePassword(hashed, password) {
  const isMatched = bcrypt.compareSync(password, hashed);
  return isMatched;
}
