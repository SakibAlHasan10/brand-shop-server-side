const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.TW_U3}:${process.env.TW_S3}@cluster0.nwipcoy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const verifyToken = async(req, res, next)=>{
  const token = req.cookies?.token;
  if(!token){ 
    // console.log("nnnnnllllll",token)
    return res.status(401).send({msg:"not authorized"})
  }
  jwt.verify(token,process.env.SECRET_TK,(err, decoded)=>{
    if(err){
      return res.status(401).send({message:"unauthorized"})
    }
    // console.log(decoded)
    req.user=decoded
    next()
  })
  // next()
} 
async function run() {
  try {
    const productCollection = client.db("productDB").collection("product");
    const usersCollection = client.db("productDB").collection("users");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    // json web token
    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_TK, {expiresIn:"1h"})
      // console.log("ttttt",req.body)
      res
      .cookie("token",token,{
        httpOnly:true,
        secure:false
      })
      .send({success:true})
    })



    app.get(`/products`, async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get single brand product
    app.get("/products/:id", async (req, res) => {
      const brand = req.params.id;
      console.log(brand)
      const query = { brand: brand };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result); 
    });

    // get single product
    app.get("/details/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      // if(req.user.email!== req.params.id){
      //   return res.status(403).send({message:"forbidden access"})
      // }
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // product update
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: product.name,
          brand: product.brand,
          price: product.price,
          category: product.category,
          rating: product.rating,
          description: product.description,
          photo: product.photo,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
      // console.log(updateDoc)
    });
    // product added
    app.post("/products", async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await productCollection.insertOne(product);
      res.send(result);
    });


    // users data
    // get single user
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // add user cart
    app.put("/users", async (req, res) => {
      const reqEmail = req.body.email;
      const request = req.body;
      const filter = { email: reqEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          myCart: req.body.allCart,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // post users
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user)
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tidal Wave is running...");
});
app.listen(port, () => {
  console.log(`Tidal Wave port is ${port}`);
});
