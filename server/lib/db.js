import mongoose from "mongoose";

export const connectDb = async() =>{
    try{
        mongoose.connection
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
        console.log("DB connected")
    } catch (error){
        console.log(error)
    }
}