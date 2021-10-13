const User = require("../models/user");

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch((err) => res.status(500).send({ message: `Error: ${err}` }));

const getUser = (req, res) => User.findById(req.params.userId)
  .then((user) => {
    if (user) {
      return res.status(200).send({ data: user });
    }
    return res.status(404).send({ message: "Пользователь не найден" });
  })
  .catch((err) => res.status(500).send({ message: `Error: ${err}` }));

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

module.exports = { getUsers, getUser, createUser };
