import paypal from "@paypal/checkout-server-sdk";
const environment = new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

// ✅ Create PayPal Order
export const createPaymentIntent = async (req, res) => {
  console.log("PayPal Client ID: ", process.env.PAYPAL_CLIENT_ID);
  console.log("PayPal Secret: ", process.env.PAYPAL_SECRET);
  console.log("Request Body: ", req.body);

  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    return res.status(200).json({ id: order.result.id });
  } catch (error) {
    console.error("PayPal Order Creation Error:", error);
    return res.status(500).json({ error: error.message || "Error creating PayPal order" });
  }
};

// ✅ Capture PayPal Payment
export const capturePayment = async (req, res) => {
  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ error: "Missing order ID" });
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    const capture = await client.execute(request);
    return res.status(200).json(capture.result);
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    return res.status(500).json({ error: error.message || "Error capturing PayPal order" });
  }
};
