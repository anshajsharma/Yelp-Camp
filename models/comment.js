var mongoose=require("mongoose");

var commentSchema=mongoose.Schema({
    text:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"     //ref refers to object model we are going to refer with this id
        },
        username: String
    }
});

module.exports=mongoose.model("Comment",commentSchema);