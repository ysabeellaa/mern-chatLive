import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js"

//get all users except the logged in user
export const getUsersForSideBar = async () => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //count number of messages not seen
    const unseenMessages = {};
    const promisses = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promisses);
    res.json({ sucess: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

//get all mesages for selected user
export const getMessages = async () => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: selectedUserId,
        },
        {
          senderId: selectedUserId,
          receiverId: myId,
        },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.json({ sucess: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

//api to  mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ sucess: true });
  } catch {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

//send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    //emit new message to receivers socket
    const receiverSocketId = userSocketMap[receiverId];
    if(receiverSocketId){
        io.timeout(receiverSocketId).emit("newMessage", newMessage)
    }
    res.json({ sucess: tru, newMessage });
  } catch {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};
