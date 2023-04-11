/********************************************************************************
 *  WEB322 – Assignment 6
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: __Zhifen Li____ Student ID: 168833218___ Date: __2013-04-11_____
 *
 *  Cyclic Web App URL: https://fantastic-deer-scrubs.cyclic.app/blog
 *
 *  GitHub Repository URL: https://github.com/zhifenli/web322-assignment5
 *
 ********************************************************************************/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
  userName: { type: String, unique: true, dropDups: true },
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});
// let user = mongoose.model("userData", userScheam);
let UserModel;

async function initialize() {
  console.log("[Auth] initializing service...");
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(
      "mongodb+srv://zhifenli1121:UhPLuaN0RtAnsg5R@senecaweb.3q1jlq3.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      console.log("[Auth] mongodb connection error", err);
      reject(err);
    });

    db.once("open", () => {
      console.log("[Auth] mongodb connection open successfully.");

      UserModel = db.model("users", userSchema);
      resolve();
    });
  });
}

async function findUserByUsername(userName) {
  // {userName, email}
  const foundUsers = await UserModel.find({ userName: userName });
  return foundUsers;
}

// registerUser(userData)
async function registerUser(userData) {
  console.log("### registerUser with userData", userData);
  return new Promise(async (resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("Password do not match!");
      return;
    }
    userData.password = await bcrypt.hash(userData.password, 10);
    console.log("new user data: ", userData);

    let newUser = new UserModel(userData);
    newUser
      .save()
      .then((created) => {
        console.log("The new user was saved to the users.");
        resolve(created);
      })
      .catch((err) => {
        console.log("There was an error saving the new user.");
        if (err.code === 11000) {
          reject("User name already taken");
        } else {
          reject(`There was an error creating the user: ${err}`);
        }
      });
  });
}

//checkUser(userData);
async function checkerUser(userRequest) {
  return new Promise(async (resolve, reject) => {
    UserModel.find({ userName: userRequest.userName })
      .exec()
      .then(async (users) => {
        if (users.length <= 0) {
          return reject("Unable to find user: " + userRequest.userName);
        }

        const passwordMatched = await bcrypt.compare(
          userRequest.password,
          users[0].password
        );
        if (!passwordMatched) {
          return reject("Incorrect Password for user: " + userRequest.userName);
        }
        if (!users[0].loginHistory) {
          users[0].loginHistory = [];
        }
        users[0].loginHistory.push({
          dateTime: new Date().toString(),
          userAgent: userRequest.userAgent,
        });
        UserModel.updateOne(
          { userName: userRequest.userName },
          { $set: { loginHistory: users[0].loginHistory } }
        )
          .exec()
          .then(() => {
            resolve(users[0]);
          })
          .catch((err) => {
            reject("There was an error verifying the user: " + err);
          });
      })
      .catch((err) => {
        reject("Unknown db error: " + err);
      });
  });
}

async function getUserHistory(userName) {
  return new Promise((resolve, reject) => {
    UserModel.find({ userName: userName })
      .select({
        loginHistory: 1,
        _id: 0,
      })
      .then((data) => {
        // console.log("User History: ", data);
        resolve(data[0].loginHistory);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkerUser,
  getUserHistory,
};
