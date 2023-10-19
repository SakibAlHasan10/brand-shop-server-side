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
    // get category
    // app.get(`/products/:id`, async(req, res)=>{
    //     const id = req.body.id;
    // })
    // get all product 
    app.get(`/products`, async(req, res)=>{
        const cursor = productCollection.find()
        const result = await cursor.toArray()
        res.send(result)

    })

    // get single brand product
    app.get('/products/:id', async(req, res)=>{
        const brand = req.params.id;
        const query = {brand:brand}
        const cursor = productCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })
    

    // product added
    app.post('/products', async(req, res)=>{
        const product = req.body;
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