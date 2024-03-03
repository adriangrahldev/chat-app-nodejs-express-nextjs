import Server from './presentation/server';

const port = 8000;
const server = new Server(port);

server.start();