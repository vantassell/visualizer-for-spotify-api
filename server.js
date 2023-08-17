const cors = require("cors");
const express = require("express");
const visualizerRouter = require("./routes/visualizers");
const userRouter = require("./routes/users");

const app = express();
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:["https://vantassell.github.io", "http://localhost:3000"]
}));

app.use("/users", userRouter);
app.use("/visualizers", visualizerRouter);

const AuthRoutes = require("./routes/authRoutes.js");
app.use("/api", AuthRoutes);



app.get("/", (req, res) => {
  console.log(req.query);
  res.send({ data: "home page" });
  console.log("sent /");
});

app.listen(process.env.PORT, () => {
  console.log(`API server listening on port ${process.env.PORT}`);
});
