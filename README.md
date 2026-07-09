# Notification & Email Microservice (`Notification-Service-Flights`)

This is the **Notification & Email Service** microservice running on **Port 3002**, responsible for listening to asynchronous booking confirmation events from **RabbitMQ** (`Notification-Queue`) and dispatching transactional confirmation emails via **Nodemailer / Gmail**.

---

## Architecture & Workflow

```mermaid
flowchart LR
  Booking[Booking Service Port 4000] -- Publishes JSON to --> RabbitMQ[(RabbitMQ: Notification-Queue)]
  RabbitMQ -- channel.consume() --> Consumer[connectToRabbitMQ() Consumer in src/index.js]
  Consumer -- JSON Payload --> EmailService[EmailService.sendEmail()]
  EmailService -- Nodemailer SMTP --> Gmail[Gmail / SMTP Server]
  Gmail --> UserInbox[User Email Inbox]
```

### How the Asynchronous Email Flow Works
1. When a user successfully confirms payment via `POST http://localhost:4000/api/v1/bookings/payments` on the **Booking Service**, the transaction commits and pushes a JSON notification message into `Notification-Queue`:
   ```json
   {
     "recepientEmail": "user@gmail.com",
     "subject": "Flight booked",
     "text": "Booking successfully done for the booking 11",
     "status": "booked"
   }
   ```
2. Upon booting up (`app.listen`), `src/index.js` connects to RabbitMQ (`amqp://localhost`) via `amqplib` and asserts the queue (`Notification-Queue`).
3. The queue consumer parses incoming payloads, extracts `recepientEmail` (or falls back to the default configured email if none is specified), and calls `EmailService.sendEmail("airlinenoti@gmail.com", recipient, subject, text)`.
4. Once Nodemailer confirms delivery to Gmail (`Booking successfully done for the booking <id>`), the consumer acknowledges (`channel.ack(data)`) the message to remove it from RabbitMQ.

---

## Folder Structure

```text
src/
  index.js                # App entrypoint & RabbitMQ queue consumer (connectToRabbitMQ)
  config/                 # Server settings, logger, and Nodemailer transport configuration
  controllers/            # Request handlers (ticket management APIs)
  routes/                 # API route registration (/api/v1/tickets)
  services/               # Email dispatch and ticket business logic (EmailService)
  repositories/           # Database access layer for ticket logs
  models/                 # Sequelize models (Ticket)
  migrations/             # Sequelize migrations
```

---

## Environment Configuration (`.env`)

Create a `.env` file in the project root (`C:\Users\AKSHANSH RANJAN\Desktop\Code\Notification-Service-Flights\.env`):

```env
PORT=3002
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=notification_development
DB_HOST=127.0.0.1
GMAIL_EMAIL=your_sender_gmail@gmail.com
GMAIL_PASSWORD=your_gmail_app_password_16_chars
RABBITMQ_URL=amqp://localhost
RABBITMQ_QUEUE_NAME=Notification-Queue
```

> **Important**: `GMAIL_PASSWORD` must be a 16-character [Google App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail account login password.

---

## Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migrations
```bash
npx sequelize db:create
npx sequelize db:migrate
```

### 3. Start Service
Ensure your local RabbitMQ server (`amqp://localhost`) is running, then start the service:
```bash
npm start
```
*You should see the following logs confirming exact startup:*
```text
Server is running on port 3002
Ready to send emails
Connected to RabbitMQ
```

---

## Testing Email Delivery via RabbitMQ

When the **Booking Service** (`Port 4000`) completes `POST /api/v1/bookings/payments`, `Notification-Service-Flights` will immediately output:
```text
Received message from RabbitMQ: {
  recepientEmail: 'akshanshranjan007@gmail.com',
  subject: 'Flight booked',
  text: 'Booking successfully done for the booking 11',
  status: 'booked'
}
Notification email sent successfully to akshanshranjan007@gmail.com
```
And an email with the exact subject **`Flight booked`** will arrive in the recipient's inbox.