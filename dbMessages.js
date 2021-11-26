import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    toname: String,
    timestamp: String,
    recieved: Boolean,
})

export default mongoose.model("messageContents",whatsappSchema);
