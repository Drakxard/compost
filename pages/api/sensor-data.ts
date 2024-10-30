import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { temperatura, humedad } = req.body
      const client = await clientPromise
      const db = client.db("sensor_data")
      
      const result = await db.collection("readings").insertOne({
        temperatura: parseFloat(temperatura),
        humedad: parseFloat(humedad),
        timestamp: new Date()
      })

      res.status(200).json({ message: "Datos guardados correctamente", id: result.insertedId })
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: "Error al guardar los datos" })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}