import express from 'express'
import ws from 'express-ws'
import cors from 'cors'
const PORT = process.env.PORT || 5000

const app = express()
const WSServer = ws(app)
const wss = WSServer.getWss()
app.use(cors())
app.use(express.json())

app.ws('/', (ws, req) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg)
        switch (msg.event) {
            case "connection":
                connectionHandler(ws, msg)
                break;
            case "move":
                broadcastConnection(ws, msg)
                break;
            case "click":
                broadcastConnection(ws, msg)
                break;
        }
    })
})

const connectionHandler = (ws, msg) => {
    let inCorrectPassword = false
    wss.clients.forEach(client => {
        if (client.id === msg.id && client.password === msg.password) {
            ws.playerColor = 'black'
            ws.password = msg.password
            ws.id = msg.id
            broadcastConnection(ws, msg)
        }
        if (client.id === msg.id && client.password !== msg.password) {
            inCorrectPassword = true
        }
    })
    if (!ws.id && !inCorrectPassword) {
        ws.playerColor = 'white'
        ws.password = msg.password
        ws.id = msg.id
        broadcastConnection(ws, msg)
    }
}

function broadcastConnection(ws, msg) {
    wss.clients.forEach(client => {
        if (client.id === msg.id) {
            msg.playerColor = ws.playerColor
            client.send(JSON.stringify(msg))
        }
    })
}

app.listen(PORT, () => console.log(`server started on port ${PORT}`))