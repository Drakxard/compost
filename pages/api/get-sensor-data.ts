import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db("sensor_data")
      
      const data = await db.collection("readings")
        .find({})
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray()

      res.status(200).json(data)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: "Error al obtener los datos" })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}