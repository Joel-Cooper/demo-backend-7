import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';


const serviceAccount = JSON.parse(fs.readFileSync('key.json', 'utf-8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;
const db = admin.firestore();

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});


// GET API
app.get('/get/automobile', async (req, res) => {
    try {
        const collectionRef = db.collection('automobiles');
        const snapshot = await collectionRef.get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).send({
            success: true,
            message: `Collection returned`,
            data: data
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error?.message || "Unknown error"
        });
    }
});


// POST API
app.post('/post/automobile', async (req, res) => {
    try {
        const automobileData = req.body;

        if (!automobileData) {
            return res.status(500).send({
                success: false,
                message: 'No automobile data found in request body'
            });
        }

        await db.collection('automobiles').add(automobileData);

        res.status(200).send({
            success: true,
            message: 'Automobile created'
        })
    } catch (error) {
        res.status.send({
            success: false,
            message: error?.message || "Unknown error"
        });
    }
});


// PUT API 
app.put('/put/automobile/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        if (!id) {
            return res.status(500).send({
                success: false,
                message: "No id found in URL"
            });
        }

        if (!updateData) {
            return res.status(500).send({
                success: false,
                message: "No data found in request body"
            });
        }

        const docRef = db.collection('automobiles').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({
                success: false,
                message: `Doc with id: ${id} not found`
            });
        }

        await docRef.update(updateData);

        res.status(200).send({
            success: true,
            message: "Updated automobile"
        });
    } catch (error) {
        res.status.send({
            success: false,
            message: error?.message
        });
    }
});


// DELETE API
app.delete('/delete/automobile/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(500).send({
                success: false,
                message: "No id found in URL"
            });
        }

        const docRef = db.collection('automobiles').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({
                success: false,
                message: `Doc with id: ${id} not found`
            });
        }

        await docRef.delete();

        res.status(200).send({
            success: true,
            message: "Deleted automobile"
        });
    } catch (error) {
        res.status.send({
            success: false,
            message: error?.message
        });
    }
});

