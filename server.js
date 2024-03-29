// init the env file
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const mongoose = require('mongoose')
const app = express()
// init socket server
const server = require('http').Server(app)
const io = require('socket.io')(server)
app.set('view engine' , 'ejs')
// Database
// project 0 cluster
const connection = mongoose.connection
const dbURI = process.env.DATABASE_URL
const PORT = process.env.PORT || 3001
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.redirect('/messageroom')
})
app.get('/messageroom' , (req,res)=>{
    res.render('index')
})
app.get('/api/testget' , async(req,res)=>{
    const phoneUpdated = await connection.collection("phones").findOne({IMEI : "123123123123123"})
    res.json(phoneUpdated)
})

mongoose.connect(dbURI , {useNewUrlParser: true, useUnifiedTopology: true})

connection.once('open', ()=>{
    const phonesChangeStream = connection.collection("phones").watch()

    phonesChangeStream.on('change', async (change)=>{
        switch(change.operationType) 
        {
            case "update": 
                console.log(change.documentKey._id +" is updated")
                io.emit('message' , change.documentKey._id + " has updated")
                const phoneUpdated = await connection.collection("phones").findOne({_id : change.documentKey._id})
                io.emit('message' , JSON.stringify(phoneUpdated)) 
                break
        }
    })
})

// first u init the server and open the connection
io.on('connection' , (socket) => {
    console.log(`user connected to ${socket.id}`)
    // then when an event with the name message happens u should do something
    socket.on('message' , (data)=>{
        socket.broadcast.emit('message',data)
    })
})

server.listen(PORT, ()=> { console.log('server running..')})
