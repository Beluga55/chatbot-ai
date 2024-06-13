import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, } from '@google/generative-ai'
import * as dotenv from 'dotenv'

import { Chat, Title } from '../db.js'
import { ObjectId } from 'mongodb'

dotenv.config()

export const chatbot = async (req, res) => {
  try {
    // DEFINE THE VARIABLES SO IT CAN BE USED LATER
    let content = ''
    let title = ''
    let findLastBotResponse = ''

    // GET THE USER PROMPT
    const { prompt, username, status, titleId } = req.body

    // CHECK IF THE USER PROMPT IS EMPTY
    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt!' })
    }

    // ACCESS THE ENVIRONMENT VARIABLES FOR GEMINI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // DEFINE THE CONFIG
    const generationConfig = {
      temperature: 0.9, // Lower than 0.9 for more focused output
      topP: 0.1, // Higher than 0.1 for a bit more diversity
      topK: 15, // Higher than 16 for a bit more diversity
    }

    const titleConfig = {
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
      maxOutputTokens: 5,
    }

    // HARM CATERORY CONFIG
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ]

    // DEFINE THE MODEL FOR THE RESPONSE (PROMPT)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig,
      safetySettings,
    })

    /// GET THE LAST BOT RESPONSE
    if (titleId) {
      findLastBotResponse = await Chat.findOne(
        { titleId: new ObjectId(titleId) },
        { lastBotResponse: 1 }
      )
    }

    // EXTRACT THE lastBotResponse
    let lastUserPrompt = ''
    let lastBotResponse = ''
    if (findLastBotResponse) {
      lastUserPrompt = findLastBotResponse.lastUserPrompt
      lastBotResponse = findLastBotResponse.lastBotResponse
    }

    let history

    if (lastUserPrompt && lastBotResponse) {
      history = [
        {
          role: 'user',
          parts: [{ text: `${prompt}` }],
        },
        {
          role: 'model',
          parts: [
            {
              text: `Create a response using the provided prompt: \n\n Prompt: ${prompt}. The previous conversation was as follows:\n\nUser's Prompt: ${lastUserPrompt}\nBot's Response: ${lastBotResponse}\n`,
            },
          ],
        },
      ]
    } else {
      history = []
    }

    const chat = model.startChat({ history })

    // GENERATE A RESPONSE
    const response = await chat.sendMessageStream(prompt)

    for await (const chunk of response.stream) {
      try {
        const chunkText = chunk.text()
        content += chunkText
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          message: 'Response was blocked due to harmful content!',
        })
      }
    }
    // GENERATE TITLE IF THE STATUS IS FALSE
    if (!status) {
      const modelTitle = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        titleConfig,
      })

      // DEFINE THE CONTENT
      const promptTitle = `Generate a concise title with less than 4 words based on the following conversation:\n\nUser Prompt: ${prompt}\n`

      // GENERATE A RESPONSE
      const titleResponse = await modelTitle.generateContentStream(promptTitle)

      // LOOP OVER THE CHUNKS
      for await (const chunk of titleResponse.stream) {
        const chunkText = chunk.text()
        title += chunkText
      }

      // SAVE THE CHAT
      const titleInsert = await Title.insertOne({
        username,
        title,
        prompt,
      })

      // GET THE TITLE OBJECT ID
      const titleId = titleInsert.insertedId

      // SAVE THE CHAT
      await Chat.insertOne({
        titleId: new ObjectId(titleId),
        prompts: [prompt],
        responses: [content],
        lastUserPrompt: prompt,
        lastBotResponse: content,
        timestamp: new Date(),
      })

      // SEND THE RESPONSE
      res.status(200).json({
        response: content,
        title,
        titleId,
        status,
      })
    } else {
      // UPDATE THE CHAT
      const updateResult = await Chat.updateOne(
        { titleId: new ObjectId(titleId) }, // Filter object
        {
          $push: { prompts: prompt, responses: content },
          $set: {
            lastUserPrompt: prompt,
            lastBotResponse: content,
            timestamp: new Date(),
          },
        }
      )

      // CHECK THE UPDATE RESULT
      if (updateResult.modifiedCount > 0) {
        // SEND THE RESPONSE
        res.status(200).json({
          response: content,
          status,
        })
      } else {
        res.status(500).json({ message: 'Something went wrong!' })
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong!' })
  }
}
