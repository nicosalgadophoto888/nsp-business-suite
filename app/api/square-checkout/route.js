import { NextResponse } from "next/server";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_BASE_URL = "https://connect.squareup.com/v2";

export async function POST(request) {
  try {
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json(
        { error: "Square credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      invoiceNumber,
      title,
      clientName,
      clientEmail,
      amount, // in dollars
      description,
      redirectUrl,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Square expects amounts in cents
    const amountCents = Math.round(amount * 100);

    const idempotencyKey = `nsp-${invoiceNumber || "inv"}-${Date.now()}`;

    // Create a payment link using Square Checkout API
    const response = await fetch(`${SQUARE_BASE_URL}/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        quick_pay: {
          name: title || `Invoice ${invoiceNumber || ""}`.trim(),
          price_money: {
            amount: amountCents,
            currency: "USD",
          },
          location_id: SQUARE_LOCATION_ID,
        },
        checkout_options: {
          allow_tipping: true,
          redirect_url: redirectUrl || undefined,
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: clientEmail || undefined,
        },
        payment_note: [
          clientName ? `Client: ${clientName}` : null,
          invoiceNumber ? `Invoice: ${invoiceNumber}` : null,
          description || null,
        ]
          .filter(Boolean)
          .join(" | "),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square API error:", JSON.stringify(data, null, 2));
      const errorMsg =
        data.errors?.[0]?.detail || data.errors?.[0]?.code || "Square API error";
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const paymentLink = data.payment_link;

    return NextResponse.json({
      success: true,
      url: paymentLink.url,
      id: paymentLink.id,
      orderId: paymentLink.order_id,
      longUrl: paymentLink.long_url,
    });
  } catch (err) {
    console.error("Square checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
