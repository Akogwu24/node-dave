const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewuser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.status(400).json({ message: 'username and password are required' });

  //check for duplicate
  const duplicate = await User.findOne({ username: user }).exec();
  if (duplicate) return res.sendStatus(409); //conflict i.e username already exist
  try {
    //encrypt password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    // create and store the new user
    const result = await User.create({ username: user, password: hashedPwd });
    console.log('result', result);

    res.status(201).json({ success: `new user ${user} created!` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { handleNewuser };
