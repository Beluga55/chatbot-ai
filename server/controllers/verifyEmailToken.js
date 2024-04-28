import jwt from "jsonwebtoken";
import { User } from "../db.js";
import { ObjectId } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

export const verifyEmailToken = async (req, res) => {
  const { id, token } = req.params;

  try {
    jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ _id: new ObjectId(id) });

    if (!user) return res.status(404).json({ message: "User not found" });

    // CHECK THE USER'S EMAIL VERIFICATION STATUS
    const isVerified = user.verified;

    if (isVerified) {
      return res.send(`
        <script>
          alert("User already verified");
          window.location.href = 'https://aichatkey.net/user.html';
        </script>
      `);
    } else {
      await User.updateOne(
        { _id: new ObjectId(id) },
        { $set: { verified: true } }
      );
    }

    res.send(`
      <script>
        window.location.href = 'https://aichatkey.net/user.html?showNotyf=true';
      </script>
    `);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.send(`
        <script>
          alert("Invalid Signature");
          window.location.href = 'https://aichatkey.net/user.html';
        </script>
      `);
    } else {
      console.error("There is an error occurred: ", error.message);
    }
  }
};

export const verifySignupEmailToken = async (req, res) => {
  const { emailToken } = req.params;
  const { email, username } = jwt.decode(emailToken);

  let query = {};

  try {
    jwt.verify(emailToken, process.env.SECRET_KEY);

    if (username !== null) {
      query = { username };
    } else {
      query = { email };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // UPDATE THE USER'S EMAIL VERIFICATION STATUS AND EMAIL TOO
    const updateData = { verified: true };
    if (username) {
      updateData.email = email;
    }
    await User.updateOne(query, { $set: updateData });

    // IF USERNAME IS PROVIDED, THEN REDIRECT TO USER PAGE
    if (username !== null) {
      return res.send(`
        <script>
          window.location.href = 'https://aichatkey.net/user.html?showNotyf=true&linkClicked=true';
        </script>
      `);
    } else {
      // IF EMAIL IS PROVIDED, THEN REDIRECT TO SIGNUP PAGE
      return res.send(`
        <script>
          window.location.href = 'https://aichatkey.net/login.html?showNotyf=true&linkClicked=true';
        </script>
      `);
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.send(`
        <script>
          alert("Invalid Signature");
          window.location.href = 'https://aichatkey.net/signup.html';
        </script>
      `);
    } else {
      console.error("There is an error occurred: ", error.message);
    }
  }
};
