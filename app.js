var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"), //has to be after body-parser
    app = express();

// APP CONFIG
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //has to be after bodyParser

mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/restful_blog_app", {
    useNewUrlParser: true,
    useFindAndModify: false
});

// MONGOOSE / MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTful ROUTES
app.get("/", function (req, res) {
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function (req, res) {
    // find all blogs
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        } else {
            // render index
            res.render("index", { blogs: blogs });
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function (req, res) {
    // render new
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function (req, res) {
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function (err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            // redirect to the index
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", { blog: foundBlog });
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, blogToEdit) {
        res.render("edit", { blog: blogToEdit });
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // Blog.findByIdAndUpdate(id, newData, callback)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, blog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

// title
// image
// body
// created

app.listen(process.env.PORT || 3000, function () {
    console.log("SERVER IS RUNNING!");
});