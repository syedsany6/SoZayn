require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Shopify API Configuration
const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE}.myshopify.com/admin/api/2023-10`; // Adjust API version
const SHOPIFY_HEADERS = {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json"
};

// Uber Direct API Configuration
const UBER_DIRECT_URL = "https://api.uber.com/v1/customers"; // Example Uber API URL
const UBER_HEADERS = {
    "Authorization": `Bearer ${process.env.UBER_SERVER_TOKEN}`,
    "Content-Type": "application/json"
};

// Route to fetch Shopify orders
app.get('/shopify/orders', async (req, res) => {
    try {
        const response = await axios.get(`${SHOPIFY_API_URL}/orders.json`, { headers: SHOPIFY_HEADERS });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to create Uber Direct delivery
app.post('/uber/delivery', async (req, res) => {
    try {
        const { pickup, dropoff } = req.body;
        const response = await axios.post(`${UBER_DIRECT_URL}/delivery-requests`, {
            pickup,
            dropoff
        }, { headers: UBER_HEADERS });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to connect Shopify order with Uber Direct
app.post('/sync-order', async (req, res) => {
    try {
        const { order_id } = req.body;

        // Fetch Shopify order details
        const orderResponse = await axios.get(`${SHOPIFY_API_URL}/orders/${order_id}.json`, { headers: SHOPIFY_HEADERS });
        const order = orderResponse.data.order;

        // Create Uber Direct delivery request
        const deliveryResponse = await axios.post(`${UBER_DIRECT_URL}/delivery-requests`, {
            pickup: {
                address: "Your Restaurant Address",
                contact: {
                    name: "Restaurant Name",
                    phone: "Restaurant Phone"
                }
            },
            dropoff: {
                address: order.shipping_address.address1,
                contact: {
                    name: order.shipping_address.name,
                    phone: order.shipping_address.phone
                }
            }
        }, { headers: UBER_HEADERS });

        res.json(deliveryResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the API Gateway Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
