const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const express = require("express");
const playerRouter = require("./routes/players");
const userRouter = require("./routes/users");

const app = express();
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/users", userRouter);
app.use("/players", playerRouter);

const AuthRoutes = require("./routes/authRoutes.js");
app.use("/api", cors(), AuthRoutes);

// lets you use req.body
// app.use(express.urlencoded({extended: true}));

// prisma setup

app.get("/", (req, res) => {
  console.log(req.query);
  // console.log(prisma.client);
  // const user = await prisma.client.user.findMany({
  //   where: { email: "vantassell@gmail.com" },
  //   // where: {email: session.user.email},
  // });
  //
  // const [account] = await prisma.account.findMany({
  //   where: { userId: user.id },
  // });
  //
  // const spotifyRes = await fetch(
  //   "https://api.spotify.com/v1/me/player/currently-playing",
  //   {
  //     headers: {
  //       Authorization: `Bearer ${account.access_token}`,
  //     },
  //   }
  // );
  //
  // // Recommendation: handle errors
  // if (!spotifyRes) {
  //   // This will activate the closest `error.js` Error Boundary
  //   throw new Error("Failed to fetch data");
  // }
  //
  // const data = await spotifyRes.json();
  // // console.log(`Data: ${JSON.stringify(data)}`);
  // const songTitle = data.item.name || "";
  // const songArtist =
  //   data.item.artists.map((artist) => artist.name).join(", ") || "";
  // const songAlbum = data.item.album.name || "";
  // const songArtworkURL = data.item.album.images[0].url || "";
  //
  // res.render("index", { songTitle, songArtist, songAlbum, songArtworkURL });
  res.send({ data: "home page" });
  console.log("sent /");
});

app.listen(process.env.PORT, () => {
  console.log(`API server listening on port ${process.env.PORT}`);
});
