require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Crear una aplicación Express
const app = express();

// Crear el servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO con el servidor, permitiendo CORS desde tu frontend
const io = socketIo(server, {
  cors: {
    origin: "*", // Reemplaza con la URL de tu frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true // Si necesitas compartir cookies o credenciales
  }
});

// Middleware para permitir CORS en Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir cualquier origen
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Middleware para procesar los cuerpos de las solicitudes
app.use(express.json()); // Para parsear JSON en el cuerpo de las solicitudes

// Ruta para probar el envío de eventos
app.post('/test-event', (req, res) => {
  console.log('Request body:', req.body); // Depuración

  const { channel, event, data } = req.body;

  // Validación de los campos necesarios
  if (!channel || !event || !data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Todos los campos (channel, event, data) son requeridos, y data debe ser un array' });
  }

  try {
    // Emitir el evento al canal especificado con los datos del array
    data.forEach((notification) => {
      const { titulo, message, url } = notification;

      // Validación adicional para los datos de cada notificación
      if (!titulo || !message || !url) {
        throw new Error('Cada notificación debe tener titulo, message y url');
      }

      // Emitir el evento con los datos de la notificación
      io.to(channel).emit(event, { titulo, message, url });
    });

    res.status(200).json({ message: `Evento '${event}' enviado al canal '${channel}'` });
  } catch (error) {
    console.error('Error al emitir evento:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/emit', (req, res) => {
  console.log('Request body:', req.body); // Depuración

  const { channel, event, data } = req.body;

  // Validación de los campos necesarios
  if (!channel || !event || !data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Todos los campos (channel, event, data) son requeridos, y data debe ser un array' });
  }

  try {
    // Emitir el evento al canal especificado con los datos del array
    data.forEach((notification) => {
      const { titulo, message, url } = notification;

      // Validación adicional para los datos de cada notificación
      if (!titulo || !message || !url) {
        throw new Error('Cada notificación debe tener titulo, message y url');
      }

      // Emitir el evento con los datos de la notificación
      io.to(channel).emit(event, { titulo, message, url });
    });

    res.status(200).json({ message: `Evento '${event}' enviado al canal '${channel}'` });
  } catch (error) {
    console.error('Error al emitir evento:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Evento cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);
  
  // Emitir mensaje de bienvenida
  socket.emit('welcome', '¡Bienvenido al servidor WebSocket!');

  // Manejar mensajes recibidos desde el cliente
  socket.on('message', (data) => {
    console.log('Mensaje recibido:', data);
    io.emit('newMessage', data);
  });

  // Unirse a un canal
  socket.on('join', (channel) => {
    console.log(`Cliente ${socket.id} unido al canal: ${channel}`);
    socket.join(channel);
  });

  // Abandonar un canal
  socket.on('leave', (channel) => {
    console.log(`Cliente ${socket.id} abandonó el canal: ${channel}`);
    socket.leave(channel);
  });

  // Desconexión del cliente
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Configurar el puerto del servidor
const PORT = process.env.PORT || 3000; // Si no está en .env, usa 3000 por defecto
const HOST = process.env.HOST || '127.0.0.1'; // Si no está en .env, usa localhost por defecto

server.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutándose en http://${HOST}:${PORT}`);
});