const { connect, StringCodec } = require('nats');
const cron = require('node-cron');

const sc = StringCodec();

async function startWorker() {
  try {
    // Connect to NATS server (use localhost if running locally)
    const nc = await connect({ servers: "localhost:4222" });
    console.log("Worker connected to NATS");

    // Schedule job every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      const message = { trigger: "update" };
      nc.publish("crypto.update", sc.encode(JSON.stringify(message)));
      console.log("Published update event:", message);
    });

  } catch (error) {
    console.error("Worker failed to connect or schedule job:", error);
  }
}

startWorker();
