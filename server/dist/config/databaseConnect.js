import mongoose from 'mongoose';
import { log } from './utilities.js';
const databaseConnect = async (app) => {
    mongoose.connection.on('connected', () => log.info('MongoDB connection established'));
    mongoose.connection.on('disconnected', () => log.warn('MongoDB connection dropped'));
    mongoose.set('strictQuery', false);
    try {
        const URI = `mongodb+srv://utenteProva:utenteProva123@cluster0.3iblz3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        await mongoose.connect(URI);
        app.emit('ready');
    }
    catch (error) {
        log.error(error);
    }
};
export default databaseConnect;
