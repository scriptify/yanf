import mongoose from 'mongoose';

export function connectToDb(connectionUri) {
  mongoose.connect(connectionUri);
  return new Promise((resolve, reject) => {
    const db = mongoose.connection;
    db.on('error', reject);
    db.once('open', () => resolve(db));
  });
}
