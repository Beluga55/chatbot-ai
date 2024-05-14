import * as dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import { Feedback } from '../db.js'

dotenv.config()

const sendEmail = async (email, feedback) => {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  )
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAUTH2',
        user: 'testingforchatbotai@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    })

    const mailOptions = {
      from: 'CHATBOT - AI <testingforchatbotai@gmail.com>',
      to: 'testingforchatbotai@gmail.com',
      subject: `Feedback from ${email}`,
      text: `Feedback: ${feedback}`,
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending feedback email:', error.message)
  }
}

export const createFeedback = async (req, res) => {
  try {
    const { username, email, feedback } = req.body

    sendEmail(email, feedback)

    // Save feedback to database
    const newFeedback = await Feedback.insertOne({
      username,
      email,
      feedback,
    })

    if (newFeedback.acknowledged === true) {
      res.status(201).json({ message: 'Feedback created successfully' })
    } else {
      res.status(500).json({ error: 'Failed to create a new feedback' })
    }

  } catch (error) {
    console.log(error)
  }
}