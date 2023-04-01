/*********************************************************************************
 *  WEB322 – Assignment 4
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Zhifen Li         Student ID: 168833218            Date: 2013-03-20
 *
 *  Cyclic Web App URL: https://magnificent-sock-tick.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/zhifenli/web322-assignment4
 *
 ********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// set up sequelize to point to our postgres database

// const blogData = require("./blog-service");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const blogService = require("./blog-service");
const { resolve } = require("path");

const app = express();
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : " ") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },

      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");

cloudinary.config({
  cloud_name: "dr0lakhty",
  api_key: "413824882338319",
  api_secret: "jwMZpADBupzqxPOE9PS0IU2JctQ",
  secure: true,
});

const upload = multer();

const onHttpStart = () => {
  console.log("Express http server listening on", HTTP_PORT);
};

// middlewares
const authMiddleware = (req, res, next) => {
  if (req.query.apikey != "12312312") {
    res.status(401).send("Login needed!");
  } else {
    next();
  }
};

// const loggerMiddleware = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

// app.use(authMiddleware);

// app.use(loggerMiddleware);
// app.use(express.static("views"));
app.use(express.static("public"));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;

  next();
});
app.use(express.urlencoded({ extended: true }));
// routes
app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/css/main.css", (req, res) => {
  res.sendFile(path.join(__dirname, "public/css/main.css"));
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {
    data: viewData,
  });
});

app.get("/", (req, res) => {
  res.redirect("/blog");
});

//http://localhost:8080/blog/10?category=3

app.get("/blog/:id", async (req, res) => {
  const viewData = {};
  try {
    let posts = [];

    if (req.query.category) {
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blogService.getPublishedPosts();
    }

    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.posts = posts;
  } catch (err) {
    viewData.postsMessage = "no results";
  }

  try {
    viewData.post = await blogService.getPostById(req.params.id);
  } catch (e) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/categories/delete/:id", (req, res) => {
  return new Promise(() => {
    blogService
      .deleteCategoryById(req.params.id)
      .then(() => {
        res.redirect("/categories");
      })
      .catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found");
      });
  });
});

app.get("/posts/delete/:id", (req, res) => {
  return new Promise(() => {
    blogService
      .deletePostById(req.params.id)
      .then(() => {
        res.redirect("/posts");
      })
      .catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found");
      });
  });
});

// app.get("/blog", async (req, res) => {
//   //   // Declare an object to store properties for the view
//   let viewData = {};

//   try {
//     // declare empty array to hold "post" objects
//     let posts = [];

//     // if there's a "category" query, filter the returned posts by category
//     if (req.query.category) {
//       // Obtain the published "posts" by category
//       posts = await blogService.getPublishedPostsByCategory(req.query.category);
//     } else {
//       // Obtain the published "posts"
//       posts = await blogData.getPublishedPosts();
//     }

//     // sort the published posts by postDate
//     posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

//     // get the latest post from the front of the list (element 0)
//     let post = posts[0];

//     // store the "posts" and "post" data in the viewData object (to be passed to the view)
//     viewData.posts = posts;
//     viewData.post = post;
//   } catch (err) {
//     viewData.message = "no results";
//   }

//   try {
//     // Obtain the full list of "categories"
//     let categories = await blogData.getCategories();

//     // store the "categories" data in the viewData object (to be passed to the view)
//     viewData.categories = categories;
//   } catch (err) {
//     viewData.categoriesMessage = "no results";
//   }

//   // render the "blog" view with all of the data (viewData)
//   res.render("blog", { data: viewData });
//   // res.json(viewData);
// });

app.get("/posts", async (req, res) => {
  try {
    let posts;
    if (req.query.category) {
      posts = await blogService.getPostByCategory(req.query.category);
    } else if (req.query.minDate) {
      posts = await blogService.getPostByMinDate(req.query.minDate);
    } else {
      posts = await blogService.getAllPosts();
    }

    if (posts.length > 0) {
      const categories = await blogService.getCategories(); // [{id, title}]
      for (let p of posts) {
        let targetCategory = categories.find((cat) => cat.id === p.category);
        p.categoryTitle = targetCategory?.title;
      }

      res.render("posts", {
        posts: posts,
        layout: "main",
      });
    } else {
      res.render("posts", {
        message: "no results",
        layout: "main",
      });
    }
  } catch (message) {
    console.log(message);
    res.render("posts", { message: "no results" });
  }
});

app.get("/categories", async (rep, res) => {
  try {
    let categories = await blogService.getCategories();
    if (categories.length > 0) {
      res.render("categories", {
        categories: categories,
        layout: "main",
      });
    } else {
      res.render("categories", {
        message: "no result",
        layout: "main",
      });
    }
  } catch (message) {
    res.render("posts", { message: "no results" });
    res.status(500).send({ message: "no results" });
  }
});

app.get("/posts/add", async (req, res) => {
  let categories;
  try {
    categories = await blogService.getCategories();
  } catch (err) {
    console.error(err);
  } finally {
    res.render("addPost", {
      data: categories,
      layout: "main",
    });
  }
});

app.get("/categories/add", async (req, res) => {
  res.render("addCategory", {
    layout: "main",
  });
});

app.post("/categories/add", async (req, res) => {
  blogService
    .addCategory(req.body)
    .then((data) => res.redirect("/categories"))
    .catch((err) =>
      res.status(500).send("Cannot save new category. Please try again.")
    );
});

app.post("/posts/add", upload.single("featureImage"), async (req, res) => {
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    blogService
      .addPost(req.body)
      .then((postData) => {
        res.redirect("/posts");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Cannot save new post. Please try again.");
      });
  }

  if (!req.file) {
    processPost("");
    return;
  }

  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          console.log("cloudinaryUploadStream success result", result);
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });
  };

  try {
    let result = await streamUpload(req);
    console.log("StreamUpload succeeded: ", result);
    processPost(result.url);
  } catch (e) {
    console.log("StreamUpload Failed: ", e);
    processPost("");
  }
});

// app.get("/about", (req, res) => {
//   // res.sendFile(path.join(__dirname, "views/about.hbs"));

//   res.render("about", {
//     layout: "main", // do not use the default Layout (main.hbs)
//     data: { name: "name about page" },
//   });
// });

app.use((req, res, next) => {
  res.status(404).render("404");
});

// check db connection
blogService.initialize();

app.listen(HTTP_PORT, onHttpStart);
