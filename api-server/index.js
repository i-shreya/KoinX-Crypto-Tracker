require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { connect, StringCodec } = require('nats'); //Task 4
const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/koinx_crypto';
const CryptoStat = require('./models/CryptoStat');


//Task 1: fecthing and stroing stats from CoinGecko
const storeCryptoStats = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,matic-network',
        },
      }
    );

    const data = response.data;

    for (const coin of data) {
      const stat = new CryptoStat({
        coin: coin.id,
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h,
        timestamp: new Date(),
      });

      await stat.save();
      console.log(`Saved stats for ${coin.id}`);
    }
  } catch (error) {
    console.error('Error fetching or saving crypto stats:', error.message);
  }
};

//calling once 
storeCryptoStats();

//calling every 5 mins so that service runs repeatedly 
// and the server keeps fetching and saving new data
//to store 100 records
setInterval(storeCryptoStats, 300000); //300000 msec= 5 min


// connecting mongodb
mongoose.connect(
  'mongodb+srv://shreyasonii:0xwjtQW3hSdFGMlt@cluster0.lzqwggk.mongodb.net/koinxDB?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  await storeCryptoStats();
})
.catch(err => console.error('MongoDB connection error:', err));


//Task 2: return the latest data about the requested cryptocurrency.
app.get('/stats', async (req, res) => {
try{
    const coin = req.query.coin;

    if (!coin) {
    return res.status(400).json({ error: 'Coin query parameter is required' });
  }

  
 
    //finding latest record of the coin 
    const latestStat = await CryptoStat.findOne({ coin })
      .sort({ timestamp: -1 })
      .exec();

    if (!latestStat) {
      return res.status(404).json({ error: 'No stats found' });
    }
    // else responding with new data
    res.json({
      price: latestStat.price,
      marketCap: latestStat.marketCap,
      "24hChange": latestStat.change24h,
    });
  } catch (err) {
    console.error('Error in /stats:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


//Task 3: /deviation end point return standard deviation of last 100 records

app.get('/deviation', async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({ error: 'Coin query parameter is required' });
  }

  try {
    const records = await CryptoStat.find({ coin })
      .sort({ timestamp: -1 }) //sorting in descending order so that latest record comes first
      .limit(100); // fetches last 100 entries stored in database

    const prices = records.map(r => r.price);

    if (prices.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified coin' });
    }

    const mean = prices.reduce((acc, val) => acc + val, 0) / prices.length;
    const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / prices.length;
    const stdDeviation = Math.sqrt(variance);

    res.json({ deviation: +stdDeviation.toFixed(2) }); // round to 2 decimals
  } catch (error) {
    console.error('Error calculating deviation:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//endpoint to count the records in datavbase
app.get('/count', async (req, res) => {
  try {
    const count = await CryptoStat.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// api route to check if the server is running, root endpoint
app.get('/', (req, res) => {
  res.send('API Server is running');
});


//Task 4: Subscribing to nats to trigger storeCryptoStats() function.

(async () => {
  try {
    const nc = await connect({ servers: 'nats://localhost:4222' });
    console.log('Connected to NATS server');

    const sc = StringCodec();



    const sub = nc.subscribe('crypto.update');
    (async () => {
      for await (const msg of sub) {
        console.log('Received update trigger from NATS:', sc.decode(msg.data));
        await storeCryptoStats();
      }
    })();
  } catch (error) {
    console.error('Error connecting to NATS:', error.message);
  }
})();




//start express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

