const express = require("express");
const router = express.Router();
const querystring = require("querystring");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// /api/login
router.get("/login", async (req, res) => {
  const scope = `user-modify-playback-state
    user-read-playback-state
    user-read-currently-playing
    user-library-modify
    user-library-read
    user-top-read
    user-read-email
    user-read-private
    playlist-read-private
    playlist-modify-public
    user-read-playback-state
    user-modify-playback-state
    user-read-currently-playing 
    app-remote-control
    streaming
    user-read-playback-position`;

  const redi =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.SPOTIFY_REDIRECTURI,
    });
  // console.log(redi);
  res.redirect(redi);
});

// /api/logged
router.get("/logged", async (req, res) => {
  const body = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.SPOTIFY_REDIRECTURI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  };

  // console.log(JSON.stringify(body));

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
      console.log("posting to spotify for initial token");

      const accessToken = data.access_token || "error getting token on server";
      const refreshToken =
        data.refresh_token || "error getting token on server";
      const expiresAt =
        Math.floor(new Date().getTime() / 1000) + (data.expires_in || 0);

      // get spotify profile info
      let email = "default__";
      let displayName = "default__";
      await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((response) => response.json())
        .then((data) => {
          email = data.email || "error getting email on server";
          displayName =
            data.display_name || "error getting display name on server";
        });

      // prisma

      // console.log(`query: ${query}`);
      const accountInfo = {
        accessToken,
        refreshToken,
        expiresAt,
        email,
        displayName,
      };

      console.log("redirecting to client");
      const query = querystring.stringify(accountInfo);
      res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);
    });
});

// this can be used as a seperate module
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

module.exports = router;
