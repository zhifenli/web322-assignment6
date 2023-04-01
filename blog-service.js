/********************************************************************************
 *  WEB322 – Assignment 5
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: __Zhifen Li____ Student ID: 168833218___ Date: __2013-03-31_____
 *
 *  Cyclic Web App URL: https://fantastic-deer-scrubs.cyclic.app/blog
 *
 *  GitHub Repository URL: https://github.com/zhifenli/web322-assignment5
 *
 ********************************************************************************/
// const fs = require("fs");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "vzsgnfqd",
  "vzsgnfqd",
  "yldvkypSGLTsia7pQ3FFsUM1XCjn336t",
  {
    host: "suleiman.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOption: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("Connection has been established successfully.");
//   })
//   .catch(function (err) {
//     console.log("Unable to connect to the database:", err);
//   });

async function initialize() {
  console.log("DB initializing...");
  try {
    await sequelize.authenticate();
    console.log("DB authenticated successfully");
  } catch (err) {
    console.log("DB authentication error", err);
    return Promise.reject("DB authentication error");
  }

  try {
    await sequelize.sync();
    console.log("DB synced successfully.");
    return Promise.resolve("DB synced successfully.");
  } catch (err) {
    console.log("DB sync error", err);
    return Promise.reject("DB sync error");
  }

  // return new Promise((resolve, reject) => {
  //   sequelize
  //     .authenticate()
  //     .sync()
  //     .then(() => {
  //       console.log("DB initialized successfully.");
  //       resolve("sucessfully");
  //     })
  //     .catch((err) => {
  //       console.log("DB error: ", err);
  //       reject("unable to sync the database");
  //     });
  // });
}

// // Define a "Project" model
let PostSchema = sequelize.define(
  "Post",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
  },
  {
    createdAt: true, // disable createdAt
    updatedAt: true, // disable updatedAt
  }
);

let CategorySchema = sequelize.define("Category", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  title: Sequelize.STRING,
});

PostSchema.belongsTo(CategorySchema, { foreignKey: "category" });

// synchronize the Database with our models and automatically add the
// table if it does not exist

// Define a "Project" model
async function addPost(postData) {
  // clean data
  for (const key in postData) {
    postData[key] = postData[key] === "" ? null : postData[key];
  }

  postData.published = postData.published ? true : false;
  postData.postDate = new Date();
  return new Promise((resolve, reject) => {
    PostSchema.create(postData)
      .then((createdData) => {
        resolve(createdData);
      })
      .catch((err) => {
        reject("unable to create post" + err);
      });
  });
}

async function addCategory(categoryData) {
  for (const key in categoryData) {
    categoryData[key] = categoryData[key] === "" ? null : categoryData[key];
  }
  return new Promise((resolve, reject) => {
    CategorySchema.create(categoryData)
      .then((createCategory) => resolve(createCategory))
      .catch((err) => reject("unable to create category" + err));
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    PostSchema.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned: " + err);
      });
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    CategorySchema.findAll()
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned " + err));
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    PostSchema.findAll({ where: { published: true } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned: " + err));
  });
}

async function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    PostSchema.findAll({
      where: { published: true, category: [parseInt(category)] },
    })
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned" + err));
  });
}

// function createPost(title) {
//   return PostSchema.create({
//     title,
//   });
// }

async function getPostByCategory(categoryStr) {
  return new Promise((resolve, reject) => {
    PostSchema.findAll({ where: { category: [parseInt(categoryStr)] } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned " + err));
  });
}

function getPostByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    PostSchema.findAll({
      where: { postDate: { [gte]: new Date(minDateStr) } },
    })
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned", err));
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    PostSchema.findAll({ where: { id: [parseInt(id)] } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results returned", err));
  });
}
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    CategorySchema.destroy({ where: { id: [parseInt(id)] } })
      .then((data) => resolve(data))
      .catch((err) => reject("delete failed " + err));
  });
}
function deletePostById(id) {
  console.log("id: ", id);
  return new Promise((resolve, reject) => {
    PostSchema.destroy({ where: { id: [parseInt(id)] } })
      .then((data) => resolve(data))
      .catch((err) => reject("delete failed " + err));
  });
}
module.exports = {
  initialize,
  getAllPosts,
  getCategories,
  getPublishedPosts,
  addPost,
  getPostByCategory,
  getPostByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
};

// module.exports.getPost = () => "post data";
