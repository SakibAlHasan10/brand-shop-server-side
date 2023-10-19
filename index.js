const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.TW_U3}:${process.env.TW_S3}@cluster0.nwipcoy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const productCollection = client.db("productDB").collection("product");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post('/products', async(req, res)=>{
        const productReq = req.body;
        const product ={
            name:productReq.name, 
            brand:productReq.brand, 
            price:productReq.price, 
            category:productReq.category, 
            rating:productReq.rating, 
            description:productReq.description, 
            photo:productReq.photo
        }
        console.log(product)
        const result = await productCollection.insertOne(product)
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Tidal Wave is running...')
})
app.listen(port, ()=>{
    console.log(`Tidal Wave port is ${port}`)
})