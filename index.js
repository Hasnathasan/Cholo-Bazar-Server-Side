const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require("cors");
const SSLCommerzPayment = require('sslcommerz-lts')
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


const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS;
const is_live = false //true for live, false for sandbox



async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db('CholoBazar');
    const productCollection = db.collection("products");
    const cartCollection = db.collection("cart");
    const booksCollection = db.collection("books");
    const usersCollection = db.collection("users");
    const ordersCollecton = db.collection("orders");


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
        const userEmail = req.query.userEmail;
        const userNumber = req.query.userNumber;
        let filter;
        if(userEmail){
          filter = {addedBy: userEmail}
        }
        else if(userNumber){
          filter = {addedBy: userNumber}
        }
        else{
          res.send({"wrongUser": true})
        }
        const result = await cartCollection.find(filter).toArray();
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

    app.get("/order/:orderStatus", async(req, res) => {
      const orderStatus = req. params.orderStatus;
      const query = {orderStatus}
      const result = await ordersCollecton.find(query).toArray();
      res.send(result)
    })

    app.get('/singleOrder/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollecton.findOne(query);
      res.send(result);
  });

    app.get('/ordersByEmail/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { "order.customerEmail": email };
      const result = await ordersCollecton.find(query).toArray();
      res.send(result);
  });


  app.patch('/order/:id', async(req, res) => {
    const id = req.params.id;
    const status = req.query.status;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        orderStatus: status
      }
    }
    const result = await ordersCollecton.updateOne(filter, updateDoc);
    res.send(result)
  })


    app.post('/order', async(req, res) => {
      const order = req.body;
      const userEmail = order?.customerEmail;
      const phoneNumber = order?.phoneNumber;
      if(userEmail){
        filter = {addedBy: userEmail}
      }
      else if(phoneNumber){
        filter = {addedBy: phoneNumber}
      }
      else{
        res.send({"wrongUser": true})
      }
      const result = await cartCollection.find(filter).toArray();
      const selectedCartProducts = result.filter(
        (product) => product.isSelected == true
      );
      let totalPrice = selectedCartProducts?.reduce(
        (total, product) =>
          product.price.discounted_price * product.quantity + total,
        0
      );
      console.log(totalPrice);
      const transactionId = new ObjectId().toString()
      const data = {
        total_amount: parseFloat(totalPrice),
        currency: 'BDT',
        tran_id: transactionId, // use unique tran_id for each api call
        success_url: `https://cholo-bazar.vercel.app/orders/${transactionId}`,
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.send({url: GatewayPageURL})
        const finalOrder = {order, transactionId, paidStatus: false, orderStatus: "pending" };
        const result = ordersCollecton.insertOne(finalOrder);
        console.log('Redirecting to: ', GatewayPageURL)
    });
    })

    app.post('/orders/:trans_id', async(req, res) => {
      const transactionId = req.params.trans_id;
      console.log(transactionId);
      const filter = { transactionId };
      const updateDoc = {
        $set: {
          paidStatus: true
        }
      };
      const result = await ordersCollecton.updateOne(filter, updateDoc);
      if(result.modifiedCount > 0){
        res.redirect(`http://localhost:5173/paymentSuccess/${transactionId}`)
      }
    })




    app.patch("/changeUserRole", async(req, res) => {
      const email = req.query.email;
      const phoneNumber = req.query.phoneNumber;
      const {userRole} = req.body;
      console.log(userRole);
      let filter;
      if(email){
        filter = {email}
      }
      else if(phoneNumber){
        filter = {phoneNumber: `+${phoneNumber.split(" ")[1]}`}
      };
      console.log(filter);
      const updateDoc = {
        $set: {
          userRole: userRole
        }
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
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


// Start the server
 // Specify the desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





