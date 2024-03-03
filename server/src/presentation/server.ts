import express, { Express } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import roomRoutes from '../routes/room.routes';
import userRoutes from '../routes/user.routes';
const connectDB = require('../database/db');

class Server {
  public app: Express;
  public port: number;
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private activeSockets: string[] = [];

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer);

    this.middlewares();
    connectDB();
    this.routes();
    this.sockets();
  }

  middlewares() {
    this.app.use(express.json());
  }

  routes() {
    this.app.get('/', (req, res) => {
      res.send('¡Hola Mundo!');
    });
    
    this.app.use('/rooms', roomRoutes);
    this.app.use('/users', userRoutes);
  }

  sockets() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Connected client on port %s.", this.port);
      socket.on("join", (room: string) => {
        socket.join(room);
        console.log("Socket joined room " + room);
      });
      socket.on("message", (message: string, room: string) => {
        this.io.to(room).emit("message", message);
      });
    });
  }

  start() {
    this.httpServer.listen(this.port, () => {
      console.log(`Servidor corriendo en http://localhost:${this.port}`);
    });
  }
}

export default Server;