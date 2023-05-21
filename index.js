const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

//midleware:
app.use(express.json());
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkl84y.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const carsCollention = client.db('toysDB').collection('cars');
        const sellerToyCollention = client.db('toysDB').collection('sellerToy');

        //indexing:
        const indexKeys = { toy_name: 1, category: 1 }
        const indexName = { name: "nameCategory" }
        const result = await sellerToyCollention.createIndex(indexKeys, indexName)

        app.get('/cars/:category', async (req, res) => {
            const carsCategory = req.params.category

            const filter = { category: carsCategory }
            const result = await carsCollention.find(filter).toArray()
            res.send(result)
        })

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }

            const result = await carsCollention.findOne(query);
            res.send(result)
        })

        // seller toy collection

        app.post('/addToy', async (req, res) => {
            const toyData = req.body;
            // console.log(toyData);

            const result = await sellerToyCollention.insertOne(toyData)
            res.send(result)
        })

        app.get('/addToy', async (req, res) => {

            const result = await sellerToyCollention.find().limit(20).toArray()
            res.send(result)

        })

        app.get('/addToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await sellerToyCollention.findOne(query);
            res.send(result)
        })

        app.get('/seller', async (req, res) => {
            // console.log(req.query.email);
            const email = req?.query?.email

            const query = { seller_email: email }
            const result = await sellerToyCollention.find(query).toArray()
            res.send(result)

        })

        app.delete('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await sellerToyCollention.deleteOne(query)
            res.json(result)
            
        })

        app.patch('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body
            const filter = { _id: new ObjectId(id) }
            const updateInfo = {
                $set: {
                    ...updateData
                }
            }
            const result = await sellerToyCollention.updateOne(filter, updateInfo)
            res.send(result)
            // console.log(id, updateData);
        })

        app.get("/search/:text", async (req, res) => {
            const searchText = req.params.text;
            const result = await sellerToyCollention
                .find({
                    $or: [
                        { toy_name: { $regex: searchText, $options: "i" } },
                        { category: { $regex: searchText, $options: "i" } },
                    ],
                })
                .toArray();
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


app.get('/', (req, res) => {
    res.send('toy car server is opne now...')
})

app.listen(port, () => {
    console.log(`my toy car server is running on port: ${port}`);
})