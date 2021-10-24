const Card = require("../models/card");

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send({ data: cards });
    })
    .catch((err) => {
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res.status(400).send({ message: `Переданы некорректные данные: ${err}` });
        return;
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (req.user._id !== card.owner.toString()) {
        res.status(403).send({ message: "Нельзя удалить чужую карточку" });
      } else {
        card.remove();
        res.status(200).send({ message: `Карточка с id ${card.id} удалена` });
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Невалидный id" });
      } else if (err.message === "NotFound") {
        res.status(404).send({ message: "Карточка с указанным id не найдена" });
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Переданы некорректные данные" });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Невалидный id" });
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Переданы некорректные данные" });
        return;
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(400).send({ message: "Невалидный id" });
      }
      res.status(500).send({ message: `На сервере произошла ошибка: ${err}` });
    });
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
