const crypto = require('crypto');

class FlutterwaveService {
  constructor() {
    this.baseUrl = (process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com').replace(/\/+$/, '');
    this.oauthBaseUrl = (process.env.FLUTTERWAVE_OAUTH_BASE_URL || 'https://idp.flutterwave.com').replace(/\/+$/, '');
    this.cachedAccessToken = null;
    this.cachedAccessTokenExpiresAt = 0;
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

  isOAuthMode() {
    return Boolean(process.env.FLUTTERWAVE_CLIENT_ID && process.env.FLUTTERWAVE_CLIENT_SECRET);
  }

  buildTraceId(prefix = 'mmis') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  buildProviderError(step, payload, fallbackMessage) {
    const parsedPayload = this.extractEmbeddedPayload(payload);
    const rawDetail =
      parsedPayload?.message ||
      payload?.message ||
      payload?.error_description ||
      payload?.error ||
      payload?.errors?.[0]?.message ||
      payload?.errors?.[0]?.detail ||
      fallbackMessage;

    const detail = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);
    return new Error(`Flutterwave ${step} failed: ${detail}`);
  }

  buildDebuggableProviderError(step, payload, fallbackMessage, requestPayload = null) {
    const baseError = this.buildProviderError(step, payload, fallbackMessage);
    if (!requestPayload) {
      return baseError;
    }

    const safeRequestPayload = JSON.stringify(requestPayload);
    return new Error(`${baseError.message} | requestPayload=${safeRequestPayload}`);
  }

  buildAliasedCustomerEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const atIndex = normalized.indexOf('@');
    if (atIndex <= 0) {
      return `mmis.${Date.now()}@example.com`;
    }

    const local = normalized.slice(0, atIndex);
    const domain = normalized.slice(atIndex + 1);
    const safeLocal = local.replace(/[^a-z0-9._+-]/g, '');
    return `${safeLocal}+mmis-${Date.now()}@${domain}`;
  }

  extractEmbeddedPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const directType = payload?.type;
    const directCode = payload?.code;
    if (directType || directCode) {
      return payload;
    }

    const candidate = payload?.message || payload?.error || payload?.error_description;
    if (candidate && typeof candidate === 'object') {
      return candidate;
    }

    if (typeof candidate !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(candidate);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  async createHostedCheckout({ amount, currency = 'UGX', txRef, customer, customizations = {}, meta = {}, paymentMethod = null }) {
    if (this.isOAuthMode()) {
      return this.createV4Charge({ amount, currency, txRef, customer, meta, paymentMethod });
    }

    const redirectUrl = this.buildReturnUrl(txRef);
    const idempotencyKey = crypto.randomUUID();
    const response = await fetch(`${this.baseUrl}/v3/payments`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
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
      throw this.buildProviderError('legacy checkout creation', payload, 'Flutterwave checkout creation failed.');
    }

    return {
      checkoutUrl: payload?.data?.link || null,
      providerPayload: payload,
      redirectUrl,
      idempotencyKey,
      providerTransactionId: payload?.data?.id ? String(payload.data.id) : null,
      nextAction: null,
    };
  }

  async verifyTransaction(transactionId) {
    if (this.isOAuthMode()) {
      return this.verifyV4Charge(transactionId);
    }

    const response = await fetch(`${this.baseUrl}/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        ...(await this.getAuthorizationHeaders()),
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.buildProviderError('legacy transaction verification', payload, 'Flutterwave transaction verification failed.');
    }
    return payload;
  }

  async createV4Charge({ amount, currency = 'UGX', txRef, customer, meta = {}, paymentMethod = null }) {
    if (!paymentMethod?.type) {
      throw new Error('Flutterwave v4 payment initiation requires a paymentMethod object with a type.');
    }

    const redirectUrl = this.buildReturnUrl(txRef);
    const customerResult = await this.createV4Customer(customer);
    const paymentMethodResult = await this.createV4PaymentMethod(paymentMethod);
    const idempotencyKey = crypto.randomUUID();
    const traceId = this.buildTraceId('mmis-flw-charge');
    const chargePayload = {
      amount,
      currency,
      reference: txRef,
      customer_id: customerResult.id,
      payment_method_id: paymentMethodResult.id,
    };
    const response = await fetch(`${this.baseUrl}/charges`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': traceId,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(chargePayload),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.buildDebuggableProviderError(
        'v4 charge creation',
        payload,
        'Flutterwave v4 charge creation failed.',
        chargePayload
      );
    }

    return {
      checkoutUrl: payload?.data?.next_action?.redirect_url?.url || null,
      providerPayload: payload,
      redirectUrl,
      idempotencyKey,
      traceId,
      providerTransactionId: payload?.data?.id ? String(payload.data.id) : null,
      nextAction: payload?.data?.next_action || null,
      customerId: customerResult.id,
      paymentMethodId: paymentMethodResult.id,
    };
  }

  async createV4Customer(customer = {}) {
    if (!customer?.email) {
      throw new Error('Flutterwave v4 customer creation requires a customer email.');
    }

    const traceId = this.buildTraceId('mmis-flw-customer');
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': traceId,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(customer),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const normalizedPayload = this.extractEmbeddedPayload(payload) || payload;
      const payloadType = normalizedPayload?.type == null ? 'null' : String(normalizedPayload.type);
      const payloadCode = normalizedPayload?.code == null ? 'null' : String(normalizedPayload.code);
      if (payloadType === 'RESOURCE_CONFLICT' || payloadCode === '10409') {
        try {
          const existingCustomer = await this.findV4CustomerByEmail(customer.email);
          if (existingCustomer?.id) {
            return existingCustomer;
          }
        } catch (lookupError) {
          throw new Error(`MMIS_CONFLICT_RECOVERY_LOOKUP_FAILED | Flutterwave v4 customer conflict recovery failed at lookup: ${lookupError.message}`);
        }

        const aliasedCustomer = {
          ...customer,
          email: this.buildAliasedCustomerEmail(customer.email),
          meta: {
            ...(customer.meta || {}),
            original_email: customer.email,
            mmis_customer_alias: true,
          },
        };

        try {
          return await this.createV4CustomerWithAlias(aliasedCustomer);
        } catch (aliasError) {
          throw new Error(
            `MMIS_CONFLICT_RECOVERY_ALIAS_FAILED | payloadType=${payloadType} | payloadCode=${payloadCode} | Flutterwave v4 customer conflict recovery failed at alias creation: ${aliasError.message} | aliasEmail=${aliasedCustomer.email}`
          );
        }
      }
      throw new Error(
        `MMIS_CUSTOMER_CREATE_NONRECOVERABLE | payloadType=${payloadType} | payloadCode=${payloadCode} | ${this.buildProviderError(
          'v4 customer creation',
          normalizedPayload,
          'Flutterwave v4 customer creation failed.'
        ).message}`
      );
    }

    if (!payload?.data?.id) {
      throw this.buildProviderError('v4 customer creation', payload, 'Flutterwave v4 customer creation failed.');
    }

    return payload.data;
  }

  async createV4CustomerWithAlias(customer = {}) {
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': this.buildTraceId('mmis-flw-customer-alias'),
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(customer),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data?.id) {
      throw this.buildProviderError('v4 customer alias creation', payload, 'Flutterwave v4 customer alias creation failed.');
    }

    return payload.data;
  }

  async findV4CustomerByEmail(email) {
    const searchResponse = await fetch(`${this.baseUrl}/customers/search`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': this.buildTraceId('mmis-flw-customer-search'),
      },
      body: JSON.stringify({
        email,
      }),
    });

    const searchPayload = await searchResponse.json().catch(() => null);
    if (searchResponse.ok) {
      const searchResults = Array.isArray(searchPayload?.data)
        ? searchPayload.data
        : Array.isArray(searchPayload?.data?.customers)
          ? searchPayload.data.customers
          : [];
      const directMatch = searchResults.find((customer) => String(customer?.email || '').toLowerCase() === String(email).toLowerCase());
      if (directMatch) {
        return directMatch;
      }
    }

    const response = await fetch(`${this.baseUrl}/customers?page=1&size=100`, {
      method: 'GET',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': this.buildTraceId('mmis-flw-customer-list'),
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.buildProviderError('v4 customer lookup', payload, 'Flutterwave v4 customer lookup failed.');
    }

    const customers = Array.isArray(payload?.data) ? payload.data : [];
    return customers.find((customer) => String(customer?.email || '').toLowerCase() === String(email).toLowerCase()) || null;
  }

  normalizePaymentMethod(paymentMethod = {}) {
    const type = String(paymentMethod.type || '').toLowerCase();

    if (type === 'mobile_money_uganda' || type === 'mobilemoneyuganda' || type === 'mobile_money') {
      const countryCode = String(
        paymentMethod.country_code ||
        paymentMethod.countryCode ||
        paymentMethod.mobile_money?.country_code ||
        '256'
      );
      const network = paymentMethod.network || paymentMethod.mobile_money?.network;
      const phoneNumber = paymentMethod.phone_number || paymentMethod.phoneNumber || paymentMethod.mobile_money?.phone_number;

      if (!network || !phoneNumber) {
        throw new Error('Flutterwave v4 Uganda mobile money requires network and phone_number.');
      }

      return {
        type: 'mobile_money',
        mobile_money: {
          country_code: countryCode,
          network,
          phone_number: String(phoneNumber).replace(/\D/g, ''),
        },
      };
    }

    return paymentMethod;
  }

  async createV4PaymentMethod(paymentMethod = {}) {
    const normalizedPaymentMethod = this.normalizePaymentMethod(paymentMethod);

    const response = await fetch(`${this.baseUrl}/payment-methods`, {
      method: 'POST',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'Content-Type': 'application/json',
        'X-Trace-Id': this.buildTraceId('mmis-flw-method'),
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(normalizedPaymentMethod),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data?.id) {
      throw this.buildProviderError('v4 payment method creation', payload, 'Flutterwave v4 payment method creation failed.');
    }

    return payload.data;
  }

  async verifyV4Charge(transactionId) {
    const traceId = this.buildTraceId('mmis-flw-verify');
    const response = await fetch(`${this.baseUrl}/charges/${transactionId}`, {
      method: 'GET',
      headers: {
        ...(await this.getAuthorizationHeaders()),
        'X-Trace-Id': traceId,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.buildProviderError('v4 charge verification', payload, 'Flutterwave v4 charge verification failed.');
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
      txRef: data.tx_ref || data.reference || null,
      status: data.status || null,
      amount: typeof data.amount === 'number' ? data.amount : Number(data.amount || 0),
      currency: data.currency || null,
      raw: payload,
    };
  }

  async getAuthorizationHeaders() {
    const oauthToken = await this.getOAuthAccessToken();
    if (oauthToken) {
      return {
        Authorization: `Bearer ${oauthToken}`,
      };
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        'Flutterwave credentials are not configured. Set FLUTTERWAVE_CLIENT_ID + FLUTTERWAVE_CLIENT_SECRET for OAuth, or FLUTTERWAVE_SECRET_KEY for legacy secret-key auth.'
      );
    }

    return {
      Authorization: `Bearer ${secretKey}`,
    };
  }

  async getOAuthAccessToken() {
    const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
    const clientSecret = process.env.FLUTTERWAVE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    const now = Date.now();
    if (this.cachedAccessToken && this.cachedAccessTokenExpiresAt - now > 60_000) {
      return this.cachedAccessToken;
    }

    const response = await fetch(`${this.oauthBaseUrl}/realms/flutterwave/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw this.buildProviderError('OAuth token request', payload, 'Flutterwave OAuth token request failed.');
    }

    const accessToken = payload?.access_token;
    const expiresInSeconds = Number(payload?.expires_in || 600);
    if (!accessToken) {
      throw new Error('Flutterwave OAuth token response did not include an access_token.');
    }

    this.cachedAccessToken = accessToken;
    this.cachedAccessTokenExpiresAt = now + expiresInSeconds * 1000;
    return accessToken;
  }
}

module.exports = new FlutterwaveService();
