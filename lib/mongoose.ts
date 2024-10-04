import mongoose, { Mongoose } from 'mongoose';
import { connected } from 'process';


let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');

    if(!process.env.MONGODB_URI) return console.log('=> using existing database connection');
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        isConnected = true;
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error)
    }
}