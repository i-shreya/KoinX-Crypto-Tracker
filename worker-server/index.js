//SHREYA SONI, shreya.sonii@outlook.com


const { connect, StringCodec } = require('nats'); // For connecting and communicating via NATS messaging
const cron = require('node-cron'); // For scheduling tasks at regular intervals

const sc = StringCodec();

async function startWorker() {
  try {
    // Connecting to NATS server locally
    const nc = await connect({ servers: "localhost:4222" });
    console.log("Worker connected to NATS");

    // Schedule job every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      const message = { trigger: "update" };
      
      nc.publish("crypto.update", sc.encode(JSON.stringify(message))); // Publish the message to the 'crypto.update' subject
      console.log("Published update event:", message); // Log the publishing action
    });

  } catch (error) {
    // Log any errors encountered during connection or scheduling
    console.error("Worker failed to connect or schedule job:", error);
  }
}

startWorker();

