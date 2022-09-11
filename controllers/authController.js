const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.status(400).json({ message: 'Username and Passward are required' });
  //   console.log(userDB.users);
  const foundUser = userDB.users.find((person) => person.username === user);
  if (!foundUser) return res.sendStatus(401); //unauthorised

  //evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '100s' }
    );

    const refreshToken = jwt.sign({ username: foundUser.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

    //saving current user  with refresh token
    const otherUsers = userDB.users.filter((person) => person.username !== foundUser.name);
    const currentUser = { ...foundUser, refreshToken };
    userDB.setUsers([...otherUsers, currentUser]);

    await fsPromises.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(userDB.users));
    res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
    res.json({ accessToken });
  } else {
    res.status(401); //unauthorized
  }
};

module.exports = { handleLogin };
