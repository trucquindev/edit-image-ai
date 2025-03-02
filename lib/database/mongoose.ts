import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  if (isConnected) {
    console.log('Mongoose is connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL || '', {
      dbName: 'imaginify',
    });
    isConnected = true;
    console.log('Mongoose is connected');
  } catch (error) {
    console.log(error);
  }
};
