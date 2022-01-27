const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleaware
app.use(cors());
app.use(express.json());

// earth-travel
// G9wytd6x78gQFx6T

const uri = "mongodb+srv://earth-travel:G9wytd6x78gQFx6T@cluster0.kyyp9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        //set database and collections
        const database = client.db("earth-travel");
        const blogCollection = database.collection("blogs");
        const saveUsersCollection = database.collection("users");


        //GET api - blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let blogs;

            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.toArray();
            }

            res.json({
                count,
                blogs
            })
        });

        //Find API - blog
        app.get('/blogs/:blogId', async (req, res) => {
            const blogId = req.params.blogId;
            const query = { _id: ObjectId(blogId) }
            const result = await blogCollection.findOne(query);
            res.json(result)
        });

        //POST API -Add new blog
        app.post('/blogs', async (req, res) => {
            const blogs = await blogCollection.insertOne(req.body);
            res.json(blogs)
        });

        // Update blog
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updateBlog = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    title: updateBlog.title,
                    name: updateBlog.name,
                    placeLocation: updateBlog.placeLocation,
                    category: updateBlog.category,
                    cost: updateBlog.cost,
                    personImg: updateBlog.personImg,
                    placeImg: updateBlog.placeImg,
                    rating: updateBlog.rating,
                    ratingCount: updateBlog.ratingCount,
                    description: updateBlog.description,
                    time: updateBlog.time,
                    date: updateBlog.date
                },
            };
            const result = await blogCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // Delete blog
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query)
            res.json(result)
        })

        //GET users
        app.get('/users', async (req, res) => {
            const cursor = saveUsersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        });

        //save users
        app.post('/users', async (req, res) => {
            const users = await saveUsersCollection.insertOne(req.body);
            res.json(users);
        });

        //update users api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await saveUsersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        //UPDATE API- update users role 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await saveUsersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //GET API- users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await saveUsersCollection.findOne(query);

            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            res.json({ admin: isAdmin });
        });

    } finally {
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Earth Travel server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
});