const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const lodash = require("lodash");

const app = express();

let items = [];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://faiz:faiz@cluster0.pqumf.mongodb.net/ToDOListDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "Welcome to To-Do-List web app"
});

const Item2 = new Item({
  name: "Hit the + button to add a new item"
});

const Item3 = new Item ({
  name: "<-- hit this to delete an item"
});

const defaultItem = [Item1, Item2, Item3];

const ListSchema = {
  name:String,
  items: [itemsSchema]
}

const List = mongoose.model("List", ListSchema);

app.get("/", function(req, res) {
      
  Item.find({}, function(err, results){
        if (results.length === 0) {
          Item.insertMany(defaultItem, function(err){
            if (err) {
              console.log(err);
            } else {
              console.log("done");
            }
          });
          res.redirect("/")
          } else 
          {
          res.render("list", {listTitle: "Today", newListItems: results})
        }
  })
      
  });
   
  app.post("/", function (req, res){
    const itemNAme = req.body.newItem;
    const ListName = req.body.list;

    const item = new Item({
      name: itemNAme
    });
    
    if (ListName === "Today") {
      item.save();
    res.redirect('/')
    } else {
      List.findOne({name: ListName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + ListName)
      })
    }

    
  });
  
app.post("/delete", function(req, res){
  const delItem = req.body.del;
  const listNAme = req.body.Listname;
  
  if (listNAme === "Today") {
    Item.findByIdAndDelete(delItem, function(err){
    if (!err) {
      console.log("succesfully deleted item");
      res.redirect("/")
    } 
  });
  } else {
      List.findOneAndUpdate({name: listNAme}, {$pull: {items: {_id: delItem}}}, function (err, foundlist) {
       if (!err) {
         res.redirect("/" + listNAme)
        }
    })
  }

  
});

app.get("/:newList", function(req, res) {
  const NewList = lodash.kebabCase(req.params.newList);
  
  List.findOne({name: NewList}, function(err, foundList){
    if (!err) {
      if (!foundList){
        const list = new List({
          name: NewList,
          items: defaultItem
        })
        list.save();
        res.redirect("/" + NewList)
      } else {
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items})
        
      }
    } 
  })
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");

})
app.listen(process.env.PORT || 2002, (req, res) => console.log("Server running on port"));