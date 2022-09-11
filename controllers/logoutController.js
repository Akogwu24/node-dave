const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
  //you should also delete access token on front end

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //success request but no content

  const refreshToken = cookies.jwt;

  //is refresh token in DB?
  const foundUser = userDB.users.find((person) => person.refreshToken === refreshToken);
  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    return res.sendStatus(204);
  }
  // delete refresh token from db
  const otherUsers = userDB.users.filter((person) => person.refreshToken !== foundUser.refreshToken);
  const currentUser = { ...foundUser, refreshToken: '' };
  userDB.setUsers([...otherUsers, currentUser]);

  await fsPromises.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(userDB.users));

  res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });

  res.sendStatus(204);
};

module.exports = { handleLogout };
