//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const conf = require("dotenv").config();
const app = express();

let id = process.env.ID;
let password = process.env.PASSWORD;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const workItems = [];

mongoose.connect(`mongodb+srv://${id}:${password}@cluster0.67znfeb.mongodb.net/todolistDB?retryWrites=true&w=majority`, {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String,
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const listItem = mongoose.model("listItem", listSchema);

const Item = mongoose.model("Item", itemsSchema);
const item1= new Item({name: "Welcome to your todolist!"});
const item2= new Item({name: "Hit the + to add a new item"});
const item3= new Item({name: "<-- Check this to delete the item"});
const defaultItems = [item1, item2, item3];




app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
                  console.log(err);
        } else {
                  console.log("Successfully inserted");
        }
      })

      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    }
)});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const title = req.body.list;
  const item = new Item({name: itemName});
  
  if (title=="Today") {
    item.save();
    res.redirect("/");
  } else {
    listItem.findOne({name: title}, function(err, founditem){
      if (err) {
        console.log("err");
      } else{
        founditem.items.push(item);
        founditem.save();
        res.redirect("/"+founditem.name);
      }
    })
  }

  
});

app.post("/delete", function(req, res){
  const title = req.body.title;
  const checkedItemID = req.body.checkbox;
  if (title=="Today") {
    Item.deleteOne({"_id": checkedItemID}).then(function(){
      console.log("Deleted");
      res.redirect("/");
    })
  } else {
      listItem.findOneAndUpdate({name: title}, {
        $pull: {
            items: {_id: checkedItemID},
        },
    }, function(err, founditem){
      if(!err) {
        console.log("Deleted");
        res.redirect("/"+title);
      }
    });

    
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req, res) {
  listName= _.capitalize(req.params.customListName);
  list1= new listItem({name: listName, items: defaultItems})

  listItem.findOne({name: listName}, function(err, founditem){
    if(err) {
      console.log("err");
    } else {
      if (!founditem) {
        list1.save();
        console.log("saved");
        res.redirect("/"+listName);
      } else{
        
        res.render("list", {listTitle: founditem.name, newListItems: founditem.items});
      }
    }

  })

  
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
