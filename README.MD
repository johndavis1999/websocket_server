NOTIFICACION DE PRUEBA POSTMAN 
URL = http://192.168.31.99:3001/test-event -> post

BODY->RAW OPT:JSON

{
  "channel": "usr-chnnl",
  "event": "new-notification",
  "data": [
    {
      "titulo": "Nuevo Mensaje",
      "message": "Este es un mensaje de prueba.",
      "url": "http://example.com"
    }
  ]
}
