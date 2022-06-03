// init the env file
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const mongoose = require('mongoose')
const app = express()
// init socket server
const server = require('http').createServer(app)
const io = require('socket.io')(server)
app.set('view engine' , 'ejs')
// Database
// project 0 cluster
const dbURI = process.env.DATABASE_URL


app.get('/home' , (req,res)=>{
    res.render('index')
})
app.get('/api/testget' , (req,res)=>{
    
})

mongoose.connect(dbURI , {useNewUrlParser: true, useUnifiedTopology: true})

const connection = mongoose.connection
connection.once('open', ()=>{
    const locationsChangeStream = connection.collection("locations").watch()

    locationsChangeStream.on('change', (change)=>{
        switch(change.operationType) 
        {
            case "delete": 
                console.log(change.documentKey._id + " is deleted")
                break
            case "update": 
                console.log(change.documentKey._id +" is updated")
                break
            case "insert":
                console.log("a new document inserted")
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

server.listen(3001, ()=> { console.log('server running..')})
