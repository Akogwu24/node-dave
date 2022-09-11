const User = require('../model/User');

const handleLogout = async (req, res) => {
  //you should also delete access token on front end
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //success request but no content

  const refreshToken = cookies.jwt;

  //is refresh token in DB?
  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    return res.sendStatus(204);
  }
  // delete refresh token from db
  foundUser.refreshToken = '';
  const result = await foundUser.save();
  console.log('logout result', result);

  res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });

  res.sendStatus(204);
};

module.exports = { handleLogout };
