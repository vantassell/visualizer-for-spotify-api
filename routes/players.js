const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// /players
router.get("/", async (req, res) => {
  // const user = await prisma.user.findMany({
  //   where: { email: "vantassell@gmail.com" },
  //   // where: {email: session.user.email},
  // });
  //
  // const [account] = await prisma.account.findMany({
  //   where: { userId: user.id },
  // });
  // console.log(`received at /:accessToken on server`);

  const accessToken = req.query.accessToken;
  const refreshToken = req.query.refreshToken;

  const spotifyRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Recommendation: handle errors
  if (!spotifyRes) {
    // This will activate the closest `error.js` Error Boundary
    console.trace(spotifyRes);
    throw new Error("Failed to fetch data from /players");
    res.json({
      title: "No response received from Spotify...",
    });
    return;
  }

  // check if no song was playing
  if (spotifyRes.status === 204) {
    res.json({
      title: "No song is currently playing",
      artist: "",
      album: "",
      // artworkURL: "https://i.imgflip.com/35xh5n.jpg",
      artworkURL:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2020/03/michael-scott-the-office-memes.jpg",
    });
    return;
  }

  // 429 --> Rate Limit by Spotify
  if (spotifyRes.status === 429) {
    res.json({
      backOff: true,
      // title: "",
      // artist: "",
      // album: "",
      // // artworkURL: "https://i.imgflip.com/35xh5n.jpg",
      // artworkURL:
      //     "https://static1.srcdn.com/wordpress/wp-content/uploads/2020/03/michael-scott-the-office-memes.jpg",
    });
    return;
  }

  let redirect = undefined;
  // 401 --> token expired
  if (spotifyRes.status === 401) {
    console.log("accessToken is expired, fetching new token...");

    const body = {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: encodeFormData(body),
    })
      .then((response) => response.json())
      .then(async (data) => {
        console.log("received from spotify refresh token");

        const newAccessToken =
          data.access_token ||
          "error getting accessToken from spotify.response.data";

        const newExpiresAt =
          Math.floor(new Date().getTime() / 1000) + (data.expires_in || 0);
        const query = { newAccessToken, newExpiresAt };

        // res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);
        res.json({
          newAccessToken,
          newExpiresAt,
        });

        console.log("about to return from refresh callback");
      });

    // console.log(`query: ${query}`);
    console.log("about to return fromm 401 callback");
    return;
  }

  // console.log("getting data through happy path");
  const data = await spotifyRes.json();

  if (!data || !data.item) {
    console.trace(
      `ERROR: no data received back from spotify! ${JSON.stringify(data)}`
    );
    res.json({
      title: "No data received from Spotify...",
    });
    return;
  }
  // console.log(`Data: ${JSON.stringify(data)}`);
  const title = data.item.name || "";
  const artist =
    data.item.artists.map((artist) => artist.name).join(", ") || "";
  const album = data.item.album.name || "";
  const artworkURL = data.item.album.images[0].url || "";

  // res.render("index", { songTitle, songArtist, songAlbum, songArtworkURL });
  res.json({ title, artist, album, artworkURL });
  // console.log({
  //   accessToken: req.params.accessToken,
  //   trackInfo: { title, artist, album },
  //   artworkURL,
  // });
  // console.log("server returned trackInfo to client");
});

router.get("/new", (req, res) => {
  res.send("user new form");
});

router.post("/", (req, res) => {
  res.sent("create user");
});

// handle all the GET, PUT, DELETE in same call
router
  .route("/:id")
  .get((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  })
  .put((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`get user with ID: ${req.params.id}`);
  });

// middleware for any ID call
router.param("id", (req, res, next, id) => {
  console.log("received id req");
  next();
});

const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

module.exports = router;
