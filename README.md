# KoinX Crypto Tracker

KoinX-Crypto-Tracker is a distributed system built using Node.js, MongoDB, and NATS (a lightweight messaging system) to simulate a basic real-time crypto tracking service. It consists of two core services — an API server and a Worker server — that communicate through a Publish-Subscribe (Pub/Sub) architecture.

- **api-server**: Subscribes to NATS messages and stores crypto statistics to MongoDB.
- **worker-server**: Publishes messages every 15 minutes to trigger data fetching and storage.
  
This assignment aims to demonstrate inter-service communication and scheduled data publishing using a message queue (NATS) while persisting real-time data into a MongoDB database through the API server.






## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/i-shreya/KoinX-Crypto-Tracker.git
cd KoinX-Crypto-Tracker
```
### 2. Install Node.js and npm

Make sure you have Node.js (v16 or above) installed. 

Verify installation:
```bash
node -v
npm -v
```
### 3. Setup MongoDB
Option A: MongoDB Atlas (Cloud)
Get your connection URI from the cluster dashboard.

Option B: Local MongoDB
### 4. Start NATS Server

Download and install the NATS server from either:
- Official NATS website:
    https://nats.io/download/nats-io/nats-server/
- Or from the official GitHub releases page:
    https://github.com/nats-io/nats-server/releases
  
Choose the appropriate version and OS binary, then unzip/install it.

After installation, run the NATS server locally with debug logs:
```bash
nats-server -DV
```
This will run the server on `localhost:4222` by default.

### 5. Set up Environment Variables

Inside both `/api-server` and `/worker-server` folders, create a `.env` file:
```bash
PORT=5000
MONGO_URI= your-mongodb-connection-string
```
### 6. Install Dependencies
Navigate into each folder and install npm packages:
```bash
cd api-server
npm install

cd ../worker-server
npm install
```
### 7. Run the Server
### 8. Test the APIs
You can test the API endpoints locally once the servers are running.

 - Using Postman (or any API client):
   
    Postman is a popular API testing tool that lets you send HTTP requests and view responses easily.
   
    Open Postman and create a new GET request.
   
    Enter the API endpoint URL, for example: http://localhost:5000/stats?coin=bitcoin
   
    Click Send to see the response JSON with the latest crypto stats.
   
    You can test other endpoints like /deviation, /count, or / similarly.
- Using Browser:
  
    For simple GET requests, you can also test directly in your browser by navigating to URLs such as:

       http://localhost:5000/stats?coin=ethereum

    The browser will display the JSON response directly.

    You can test other endpoints like /deviation, /count with three different coins- bitcoin, ethereum, and matic-network

## Output
When you call the endpoint to fetch crypto stats, you should receive a JSON response similar to this:
```bash
price:         0.23286
marketCap:     374710323
24hChange:     -3.48006
```
For endpoints like /deviation or /count, you might see outputs like:
```bash
deviation:     0.0345
```
```bash
count:         81
```
