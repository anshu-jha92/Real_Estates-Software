import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB (local or Atlas - both use the same MONGO_URI).
 * Throws on failure so the caller decides whether to exit or keep serving.
 */
export default async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('[db] MongoDB reconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    autoIndex: true,
  });

  const { host, name } = mongoose.connection;
  console.log(`[db] MongoDB connected: ${host}/${name}`);

  // A URI with no database name (".../" or ".../?opts") silently lands on "test".
  // That connects fine but reads an empty database, which looks like a broken API.
  if (name === 'test') {
    console.warn(
      '[db] WARNING: connected to the default "test" database. Add the database name to ' +
        'MONGO_URI before the "?" — e.g. ...mongodb.net/ramakripa?retryWrites=true&w=majority'
    );
  }

  return mongoose.connection;
}

/** 1 = connected. Used by the API guard so requests fail fast instead of buffering. */
export const isDbConnected = () => mongoose.connection.readyState === 1;

export const disconnectDB = () => mongoose.connection.close();
