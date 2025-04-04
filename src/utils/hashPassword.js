import dotenv from 'dotenv';
dotenv.config();

const bcrypt = require("bcrypt");
const saltRound = 10;
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}
export default hashPassword;

