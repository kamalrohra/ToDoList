//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const workItems = [];
const itemSchema = {
  name : String
}

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("list",listSchema);

const Item = mongoose.model("item" , itemSchema);
const item1 = new Item({
  name : "welcome to the to do list"
}
);
const item2 = new Item({
  name : "press + to add an item"
}
);
const item3 = new Item({
  name : "press <-- to delete an item"
}
);

const defaultItems = [item1,item2,item3]




app.get("/", function(req, res) {
Item.find({},function(err,foundItems){
  if(foundItems.length ===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("default list has been added");
      }
    });
    res.redirect("/")
  }else{
    res.render("list", {listTitle:"TODAY", newListItems: foundItems});
  }
})




});

app.post("/", function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem
  const item = new Item({
    name:itemName
  });
  if(listName === "TODAY"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(item)
      foundList.save();
      res.redirect("/"+listName)
    });
  }

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundItem){
    if(!err){
      if(!foundItem){
        const list = new List({
          name : customListName,
          items: defaultItems

        });
        list.save();
        res.redirect("/" + customListName)
      }else{
        res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items});

      }
    }

  })



});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",function(req,res){
  const deleteId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="TODAY"){
    Item.findByIdAndRemove(deleteId,function(err){
      if(!err){
        console.log("delete succesfull");
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id : deleteId }}},function(err,foundItem){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
