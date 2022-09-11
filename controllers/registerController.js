const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};
const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewuser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.status(400).json({ message: 'username and password are required' });

  //check for duplicate
  const duplicate = userDB.users.find((person) => person.username === user);
  if (duplicate) return screen.sendStatus(409); //conflict i.e username already exist
  try {
    //encrypt password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    // store the new user
    const newUser = { username: user, password: hashedPwd, role: { User: 2001 } };
    userDB.setUsers([...userDB.users, newUser]);
    await fsPromises.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(userDB.users));

    console.log('users', userDB.users);
    res.status(201).json({ success: `new user ${user} created!` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { handleNewuser };
