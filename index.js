const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require("cors");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 8000;



// Middleware
app.use(cors());
app.use(express.json());


// Routes
// Define your routes here
app.get('/', (req, res) => {
    res.send("Cholo Bazar is running on Load Sheading hire")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lmw0s1b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db('CholoBazar');
    const productCollection = db.collection("products");
    const cartCollection = db.collection("cart");
    const booksCollection = db.collection("books");


    app.get('/products', async (req, res) => {
        const result = await productCollection.find().toArray();
        res.send(result);
    });
  
    app.get('/productsBySubCate', async (req, res) => {
      const subCate = req.query.subCategory;
      const sortedText = req.query?.sort;
      console.log(sortedText);
      let sort = null;
      if (sortedText === "priceHighToLow") sort = { "price.discounted_price": -1 };
      if (sortedText === "priceLowToHigh") sort = { "price.discounted_price": 1 };
      if (sortedText === "ratingHighToLow") sort = { "rating": -1 };
      if (sortedText === "ratingLowToHigh") sort = { "rating": 1 };
    
      console.log(sort);
      console.log(subCate);
      const filter = { "secondary_category" : subCate};
      const result = await productCollection.find(filter).sort(sort).toArray();
      res.send(result)
    })
  
    app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productCollection.findOne(query);
        res.send(result);
    });
  
  
      app.get('/cart', async(req, res) => {
        const result = await cartCollection.find().toArray();
        res.send(result)
      })
  
      app.delete('/cart/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(filter);
        res.send(result)
      })
      app.patch('/updateCartProduct/:id', async(req, res) => {
        const id = req.params.id;
        const quantity = req.query.quantity;
        const isSelected = req.query.isSelected;
        const updateDoc = {
          $set:{
            quantity: parseInt(quantity),
            isSelected: isSelected == "true" ? true : false,
          }
        };
        const filter = { _id: new ObjectId(id) };
        const result = await cartCollection.updateOne(filter, updateDoc);
        res.send(result)
      })
  
      app.post('/cart', async(req, res) => {
        const product = req.body;
        const result = await cartCollection.insertOne(product);
        res.send(result)
      })



      app.get('/books', async (req, res) => {
        const result = await booksCollection.find().toArray();
        res.send(result);
    });
    
    app.get('/books/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await booksCollection.findOne(query);
        res.send(result);
    });

    app.get('/booksByCategory/:category', async (req, res) => {
        const category = req.params.category;
        const query = { main_category: category };
        const result = await booksCollection.find(query).toArray();
        res.send(result);
    });



    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    });

    app.get('/eachUser/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        res.send(result || { "notFound": true });
    });

    app.get('/each-user-by-number/:number', async (req, res) => {
        const number = req.params.number;
        const query = { phoneNumber: number };
        const result = await usersCollection.findOne(query);
        res.send(result || { "notFound": true });
    });

    app.post('/users', async (req, res) => {
        const data = req.body;
        const result = await usersCollection.insertOne(data);
        res.send(result);
    });

    app.patch('/updateUser/:id', async (req, res) => {
        const data = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                date_of_birth: data.date_of_birth,
                gender: data.gender,
                photoUrl: data.photoUrl,
            },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Start the server
 // Specify the desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




