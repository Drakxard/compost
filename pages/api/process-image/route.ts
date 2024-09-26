import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Groq } from 'groq-sdk'
import clientPromise from '../../../lib/mongodb'
import { MongoClient } from 'mongodb'

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
})

export async function POST(req: Request) {
  const headersList = headers()
  const apiKey = headersList.get('x-api-key')

  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { base64Image, prompt } = await req.json()

    if (!base64Image || !prompt) {
      return NextResponse.json({ error: 'Missing data in request' }, { status: 400 })
    }

    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      model: "llava-v1.5-7b-4096-preview",
    })

    const analysisResult = chat_completion.choices[0].message.content

    // Connect to MongoDB and store the result
    const client: MongoClient = await clientPromise
    const db = client.db('compost')
    const collection = db.collection('datos')
    await collection.insertOne({
      prompt,
      result: analysisResult,
      timestamp: new Date()
    })

    return NextResponse.json({
      message: 'Image processed and data stored successfully',
      data: analysisResult,
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 })
  }
}