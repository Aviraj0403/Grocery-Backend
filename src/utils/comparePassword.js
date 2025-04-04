const bcrypt = require("bcrypt");
export async function comparePassword(hashed, password) {
  const isMatched = bcrypt.compareSync(password, hashed);
  return isMatched;
}
