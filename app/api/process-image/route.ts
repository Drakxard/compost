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

  if (apiKey !== 'API-PRIVADA-CLIENTE') {         //Se debe solicitar clave de clientes en server para comparar, o comparar con usuario
  return NextResponse.json({ error: 'Unauthorized' }, { status: 409 })
  }


  try {
    const { base64Image, prompt } = await req.json()

    if (!base64Image || !prompt) {
      return NextResponse.json({ error: 'Missing data in request' }, { status: 400 })
    }

    const chat_completion = await groq.chat.completions.create({
    "model": "llava-v1.5-7b-4096-preview",
    "temperature": 0.2,
    "max_tokens": 50,
    "top_p": 1,
      messages: [
        {
          role: "user",
          content: [
            {"type": "text", "text": "Analyze the image and choose how to justify it according to the image provided: Initial mesophilic phase Color: Mix of light brown and green. Texture: Large and visible fragments, such as leaves or food remains. Humidity: Humid material, without signs of advanced decomposition. Thermophilic phase Color: Dark brown. Texture: More uniform material but with some visible fragments such as wood or shells. Other signs: There may be visible steam or signs of heat. Cooling phase Color: Dark brown. Texture: Looser and grainier, some small fragments may be present. Condition: No signs of heat.Maturation Phase Color: Dark brown or black.Texture: Very loose and grainy, without visible fragments.Condition: Fully stabilized material."},
                {
                    "type": "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],


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