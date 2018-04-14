var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var table = new Table({
    head: ["Item ID", "Item", "Current Bid", "Item Type"],

});

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "password",
    database: "items_db"
  });
  
    connection.connect(function(err) {
    if (err) throw err;

  });


inquirer.prompt([
      {
          type: "list",
          message: "Which would you like to do?",
          name: "action",
          choices: ["Post an item", "Bid on an item"]
      }
  ])
  .then(function(answer){
      
        if(answer.action === "Post an item"){
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the item name?",
                    name: "item_name",

                },
                {
                    type: "input",
                    message: "What's the started bid to be?",
                    name: "bid",
                    validate: function(input){
                        if(isNaN(input)){
                            return false;
                        }else return true;
                    }
                },
                {
                    type: "list",
                    message: "What type of item is your item?",
                    name: "item_type",
                    choices: ["Collectables", "Sports Memorobilia","Other"]
                }
            ])
            .then(function(answer){
                createItem(answer.item_name, answer.bid, answer.item_type);
            })
        }else{
           readItems();

           inquirer.prompt([
               {
                   type: "rawlist",
                   name: 'item_choice',
                   message: "Which item did you want to bid on?",
                   choices: function(){
                       var arr = [];
                       connection.query("SELECT name FROM items", function(err,res){
                           for(var i = 0; i < res.length; i++){
                               arr.push(res[i].name);
                           };
                           return arr;
                       })
                    }

               }
           ])
           .then(function(choice){
               console.log(choice);
           });
        }
  });
  
  function createItem(name, bid, type){
    var query = connection.query(
        "INSERT INTO items SET ?",
        {
            name: name,
            price: bid,
            type: type
        },
        function(err,res){
            console.log(res.affectedRows + " item has been listed! \n");
        }
    );
  };


  function readItems(){
    var items = [];
      connection.query("SELECT * FROM items", function(err,res){
          if(err) throw err;

          for(var i = 0; i < res.length; i++){
              table.push(
                  [res[i].id,res[i].name, res[i].price, res[i].type]
              );
              items.push(res[i].name);
          };

          console.log(table.toString());
          return items;
      });
  };

