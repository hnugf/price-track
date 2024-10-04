import mongoose, {} from 'mongoose';



export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');

    if(!process.env.MONGODB_URI) return console.log('=> using existing database connection');
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected');
    } catch (error) {
        console.log(error)
    }
}