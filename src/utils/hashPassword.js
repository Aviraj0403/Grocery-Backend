import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Use `bcryptjs` with `import`

dotenv.config();

const saltRound = 10;

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export default hashPassword;
