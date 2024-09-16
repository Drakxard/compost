// lib/mongodb.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
//const options = {}; 

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, añade MONGODB_URI a tu archivo .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para preservar el cliente entre recargas
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, no uses variable global
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
