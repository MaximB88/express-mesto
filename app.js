const express = require("express");
const mongoose = require("mongoose");

const app = express();

const usersRoute = require("./routes/users");
const cardsRoute = require("./routes/cards");

const { PORT = 3000 } = process.env;

mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
});

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "61671c96f1e3538eb69ef403",
  };

  next();
});
app.use(usersRoute);
app.use(cardsRoute);
app.use((req, res) => {
  res.status(404).send({ message: "Неверный запрос" });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
