// utils/db.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, añade MONGODB_URI a tus variables de entorno');
}

client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;
