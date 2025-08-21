const express = require('express')
const path=require('path')
const socket = require('socket.io')
const http = require('http')
const {Chess}=require('chess.js')

const app = express()
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();
let players = {}
let currentPlayer = 'W';

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=>{
    res.render('index')
})

io.on('connection',(uniquesocket)=>{
    console.log("Connected")
    if(!players.white){
        players.white=uniquesocket.id
        uniquesocket.emit("playerAssigned","W")
    }
    else if(!players.black){
        players.black=uniquesocket.id
        uniquesocket.emit("playerAssigned","B")
    }
    else{
        uniquesocket.emit("Spectator")
    }
    uniquesocket.on('disconnect',()=>{
        console.log("Player Disconnected")
        if(uniquesocket.id===players.white){

            delete players.white
        }else if(uniquesocket.id===players.black){
            delete players.black
        }
    })
    uniquesocket.on("move",(move)=>{
        try {
            if(chess.turn()==='W' && uniquesocket.id!==players.white) return
            if(chess.turn()==='B'&& uniquesocket.id!==players.black) return

            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move)
                io.emit("boardstate",chess.fen())
            }else{
                console.log("Invalid move: ",move)
                uniquesocket.emit("invalidMove", move);
            }
        } catch (error) {
            console.log("Error: ",error);
            uniquesocket.emit('invalid move',move)
        }
    })
})

server.listen(3000,()=>{

    console.log("Server is working")
})