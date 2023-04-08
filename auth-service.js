const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mongoose
//   .createConnection(
//     "mongodb+srv://zhifenli1121:UhPLuaN0RtAnsg5R@senecaweb.3q1jlq3.mongodb.net/?retryWrites=true&w=majority"
//   )
//   .then(
//     (data) => {
//       console.log("Mongo db connected: ", data);
//     },
//     (error) => {
//       console.log("Mongo db error: ", error);

//     }
//   )
//   .catch((error2) => {
//     console.log("Mongo db error2: ", error2);
//   });

const userSchema = new Schema({
  userName: String,
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});
// let user = mongoose.model("userData", userScheam);
let User;
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://zhifenli1121:UhPLuaN0RtAnsg5R@senecaweb.3q1jlq3.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      console.log("Auth mongodb connection error", err);
      reject(err);
    });

    db.once("open", () => {
      console.log("Auth mongodb connection open successfully.");

      User = db.model("users", userSchema);
      console.log("User1: ", User);
    });
  });
};

// let newUser = new User(userData)({});
// newUser
//   .save()
//   .then(() => {
//     console.log("The new user was saved to the users.");
//   })
//   .catch(() => {
//     console.log("There was a err saving the new user.");
//   });
