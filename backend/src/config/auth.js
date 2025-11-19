// Created by: Jorge Valdes-Santiago
//
//
// This script handles authentication from the server side.

// Using GitHub for now
require("passport-github2");
const { Strategy: GitHubStrategy } = require("passport-github2");
const { pool } = require("./database.js");

const options = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5001/auth/github/callback",
};

// Responsible for determining which user in the database the credential belongs to.
const verify = async (accessToken, refreshToken, profile, callback) => {
  /*
    accessToken - an access token
    refreshToken - used to obtain new access tokens and may be undefined if the provider does not issue refresh tokens
    profile - used to access user profile information provided by the service provider
    callback - used to signal whether the authentication was successful or not
*/

  // Extract the user's profile information
  const {
    _json: { id, name, login, avatar_url },
  } = profile;

  // Store the user's data
  const userData = {
    githubId: id,
    username: login,
    avatarUrl: avatar_url,
    accessToken,
  };

  try {
    // Check to see if user exists in the "users" table in the database
    const results = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [userData.username]
    );

    const user = results.rows[0]; // Store the first row of results

    // Check if the results return a matching user. If not, create a new user profile.
    if (!user) {
      const created_at = new Date().toISOString(); // Get date in UTC (this can be converted to the local timezone in the frontend)

      // Add a new user to the table
      const results = await pool.query(
        `INSERT INTO users (githubid, username, avatarurl, accesstoken, created_at)
                VALUES($1, $2, $3, $4, $5)
                RETURNING *`,
        [
          userData.githubId,
          userData.username,
          userData.avatarUrl,
          accessToken,
          created_at,
        ]
      );

      const newUser = results.rows[0]; // Store the first row of results

      // Return a function call to the callback function, with arguments null and the newUser object that was found.
      return callback(null, newUser);
    }

    // Return a function call to the callback function, with arguments null and the user object that was found.
    return callback(null, user);
  } catch (error) {
    // A problem occured, return with error
    return callback(error);
  }
};

const GitHub = new GitHubStrategy(options, verify);

module.exports = { GitHub };
