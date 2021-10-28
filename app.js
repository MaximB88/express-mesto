const express = require("express");
const mongoose = require("mongoose");
const { errors, celebrate, Joi } = require("celebrate");

const app = express();

const usersRoute = require("./routes/users");
const cardsRoute = require("./routes/cards");
const { createUser } = require("./controllers/users");
const errorHandler = require("./middlewares/errorHandler");
const { login } = require("./controllers/users");
const auth = require("./middlewares/auth");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3000 } = process.env;

const NOT_FOUND = 404;

mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
});

app.use(express.json());

app.use(requestLogger);

app.post("/singin", celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);
app.post("/signup", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(
      /^((http|https):\/\/)(www\.)?([\w\W\d]{1,})(\.)([a-zA-Z]{1,10})([\w\W\d]{1,})?$/,
    ),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(40),
  }),
}), createUser);

app.use(auth);
app.use("/", auth, usersRoute);
app.use("/", auth, cardsRoute);

app.use(errorLogger);

app.use("*", (req, res) => {
  res.status(NOT_FOUND).send({ message: `Страницы по адресу ${req.baseUrl} не существует` });
});
app.use(errorHandler);
app.use(errors());
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
