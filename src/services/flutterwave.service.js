const crypto = require('crypto');

class FlutterwaveService {
  constructor() {
    this.baseUrl = (process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com').replace(/\/+$/, '');
  }

  buildReturnUrl(attemptReference) {
    const base = process.env.PAYMENT_RETURN_URL || process.env.FRONTEND_URL;
    if (!base) {
      throw new Error('PAYMENT_RETURN_URL or FRONTEND_URL must be configured for Flutterwave checkout.');
    }
    const url = new URL(base);
    url.searchParams.set('attemptRef', attemptReference);
    return url.toString();
  }

  async createHostedCheckout({ amount, currency = 'UGX', txRef, customer, customizations = {}, meta = {} }) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('FLUTTERWAVE_SECRET_KEY is not configured.');
    }

    const redirectUrl = this.buildReturnUrl(txRef);
    const idempotencyKey = crypto.randomUUID();
    const response = await fetch(`${this.baseUrl}/v3/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        amount,
        currency,
        tx_ref: txRef,
        redirect_url: redirectUrl,
        customer,
        customizations,
        meta,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || 'Flutterwave checkout creation failed.');
    }

    return {
      checkoutUrl: payload?.data?.link || null,
      providerPayload: payload,
      redirectUrl,
      idempotencyKey,
    };
  }

  async verifyTransaction(transactionId) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('FLUTTERWAVE_SECRET_KEY is not configured.');
    }

    const response = await fetch(`${this.baseUrl}/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || 'Flutterwave transaction verification failed.');
    }
    return payload;
  }

  validateWebhookSignature(headers = {}) {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!secretHash) return false;

    const normalizedHeaders = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [String(key).toLowerCase(), value])
    );
    const providedHash = normalizedHeaders['verif-hash'] || normalizedHeaders['flutterwave-signature'];
    return Boolean(providedHash && providedHash === secretHash);
  }

  normalizeVerificationResponse(payload) {
    const data = payload?.data || {};
    return {
      providerTransactionId: data.id ? String(data.id) : null,
      txRef: data.tx_ref || null,
      status: data.status || null,
      amount: typeof data.amount === 'number' ? data.amount : Number(data.amount || 0),
      currency: data.currency || null,
      raw: payload,
    };
  }
}

module.exports = new FlutterwaveService();
