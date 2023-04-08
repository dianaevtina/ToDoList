const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit + to add a new item"
});

const item3 = new Item({
  name: "Hit a checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {

  async function findDocument() {
    let foundItems = await Item.find({});
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render('list', {listTitle: "Today", newListItems: foundItems});
    }
  }

  findDocument();
});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  async function existence() {

    let foundList = await List.findOne({name: customListName}).exec();
    if (foundList != null) {
      // Show an existing list
      res.render('list', {listTitle: customListName, newListItems: foundList.items});
    } else {
      // Create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
  }
  existence();
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    async function found() {
      let foundList = await List.findOne({name: listName}).exec();
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
    found();
  }

});

app.post("/delete", function(req, res) {

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    async function deleteDocument() {
      await Item.deleteOne({_id: checkedItemID}).exec();
    }

    deleteDocument();
    res.redirect("/");

  } else {
    async function findAndUpdate(){
      await List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemID}}});
      res.redirect("/" + listName);
    }
    findAndUpdate();
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
