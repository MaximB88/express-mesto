const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// получение всех пользователей
const getUsers = (req, res) => User.find({})
  .then((users) => res.status(200).send(users))
  .catch((err) => res.status(500).send({ message: `На сервере произошла ошибка: ${err}` }));

// получение пользователя
const getUser = (req, res) => User.findById(req.params.userId)
  .then((user) => {
    if (!user) {
      res.status(404).send({ message: "Пользователь не найден" });
      return;
    }
    res.send(user);
  })
  .catch((err) => {
    if (err.name === "CastError") {
      res.status(400).send({ message: "Невалидный id" });
    }
    res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
  });

// получение текущего пользователя
const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Невалидный id" });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: "Указанный пользователь не найдеен" });
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

// создание пользователя
const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
      } else if (err.name === "MongoError" && err.code === 11000) {
        res.status(409).send({ message: "Пользователь уже зарегистрирован" });
      } else {
        res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
      }
    });
};

// обновление профиля пользователя
const updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: "Пользователь не найден" });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

// обновление аватара
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: "Пользователь не найден" });
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

// логин
const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        "super-secret-key",
        { expiresIn: "7d" },
      );
      res.send(token);
    })
    .catch((err) => {
      if (err.message === "NotFound") {
        res.status(404).send({ message: "Неверно указаны данные для входа" });
        return;
      }
      res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports = {
  getUsers, getUser, createUser, updateUser, updateAvatar, login, getCurrentUser,
};
