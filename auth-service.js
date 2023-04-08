/********************************************************************************
 *  WEB322 – Assignment 6
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: __Zhifen Li____ Student ID: 168833218___ Date: __2013-04-10_____
 *
 *  Cyclic Web App URL: https://fantastic-deer-scrubs.cyclic.app/blog
 *
 *  GitHub Repository URL: https://github.com/zhifenli/web322-assignment5
 *
 ********************************************************************************/

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

async function initialize() {
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
      resolve();
    });
  });
}

// registerUser(userData)
async function registerUser(userData) {
  console.log("### registerUser with userData", userData);
  return new Promise((resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("Password do not match!");
    } else {
      let newUser = new User(userData);
      newUser
        .save()
        .then(() => {
          console.log("The new user was saved to the users.");
          resolve(userData);
        })
        .catch((err) => {
          console.log("There was a err saving the new user.");
          if (err.code === 11000) {
            reject("User name already taken");
          } else {
            reject(`There was an error creating the user: ${err}`);
          }
        });
    }
  });
}

// checkUser(userData)
// function checkerUser() {}
module.exports = {
  initialize,
  registerUser,
};
