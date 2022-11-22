
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();

// middlware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sabbir.0dgpj5g.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const appointmentOptionCallection = client.db('doctorsPortal').collection('appointmentOptions');
        const bookingCollection = client.db('doctorsPortal').collection('booking');
       
        app.get('/appointmentOptions', async(req, res) =>{
            const date = req.query.date;
            console.log(date)
            const query = {};
            const options = await appointmentOptionCallection.find(query).toArray();
            const bookingQuery = {appointment: date}
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookSlots = optionBooked.map(book => book.slot)
                const remainingSlots = option.slots.filter(slot => !bookSlots.includes(slot))

                option.slots = remainingSlots;

                // console.log(date, option.name, bookSlots, remainingSlots.length)

            })
            res.send(options)
        })

        app.post('/booking', async(req, res) =>{
            const booking = req.body;
            // console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('doctors portal server is running');
})

app.listen(port, () => console.log(`Doctors portal running is ${port}`))