const express = require("express");
const router = express.Router();


// /visualizers
router.get("/", async (req, res) => {

  const accessToken = req.query.accessToken;
  const refreshToken = req.query.refreshToken;

  const spotifyRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  // Recommendation: handle errors
  if (!spotifyRes) {
    // This will activate the closest `error.js` Error Boundary
    console.trace(spotifyRes);
    throw new Error("Failed to fetch data from /visualizers");
    res.json({
      title: "No response received from Spotify...",
    });
    return;
  }

  // check if no song was playing
  if (spotifyRes.status === 204) {
    res.json({
      currentlyPlayingNothing:
        "It looks like you aren't currently listening to anything. Please chose something to play and this message will go away :)",
      artworkURL:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2020/03/michael-scott-the-office-memes.jpg",
    });
    return;
  }

  // 429 --> Rate Limit by Spotify
  if (spotifyRes.status === 429) {
    res.json({
      backOff: true,
    });
    return;
  }

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

        res.json({
          newAccessToken,
          newExpiresAt,
        });
        console.log(`Sending client newAccessToken: ${newAccessToken}`);
        console.log(`Sending client newExpiresAt: ${newExpiresAt}`);

        console.log("about to return from refresh callback");
      });

    console.log("about to return fromm 401 callback");
    return;
  }

  const data = await spotifyRes.json();

  if (!data || !data.item) {
    console.trace(
      `ERROR: no data received back from spotify! ${JSON.stringify(data)}`,
    );
    res.json({
      error: `ERROR: no data received back from spotify! ${JSON.stringify(
        data,
      )}`,
    });
    return;
  }

  const title = data.item.name || "";
  const artist =
    data.item.artists.map((artist) => artist.name).join(", ") || "";
  const album = data.item.album.name || "";
  const artworkURL = data.item.album.images[0].url || "";
  const spotifyURI = data.item.uri || "";
  const spotifyTrackLink = `http://open.spotify.com/track/${spotifyURI
    .split(":")
    .pop()}`;
  
 
  res.json({ title, artist, album, artworkURL, spotifyTrackLink });
});


const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

module.exports = router;
