const express = require("express");
const router = express.Router();
const querystring = require("querystring");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// /api/login
router.get("/login", async (req, res) => {
  const scope = `
    user-read-playback-state
    user-read-currently-playing
    user-read-playback-position
    user-read-private
    user-read-email
`;

  const redi = "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      show_dialog: true,
      redirect_uri: `${process.env.API_DOMAIN}/api/logged`,
    });

  console.log(
    `redirecting to spotify/authorize with redirect to api_server/api/logged`,
  );
  res.redirect(redi);
});

// /api/logged
router.get("/logged", async (req, res) => {
 
  console.log"/logged req from spotify: ", req);
  console.log("/logged response from spotify: ", res);


  const body = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: `${process.env.API_DOMAIN}/api/logged`,
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
      const refreshToken = data.refresh_token ||
        "error getting token on server";
      const expiresAt = Math.floor(new Date().getTime() / 1000) +
        (data.expires_in || 0);

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
          displayName = data.display_name ||
            "error getting display name on server";
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

      const query = querystring.stringify(accountInfo);
      const clientRedirect = `${process.env.WEB_APP_DOMAIN}/login?${query}`;
      console.log(`redirecting to client: ${clientRedirect}`);
      res.redirect(clientRedirect);
    });
});

// this can be used as a seperate module
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

module.exports = router;
