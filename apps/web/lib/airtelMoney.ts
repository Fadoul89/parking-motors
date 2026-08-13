const CLIENT_ID = process.env.AIRTEL_MONEY_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTEL_MONEY_CLIENT_SECRET;
const COUNTRY = process.env.AIRTEL_MONEY_COUNTRY || "GA";
const CURRENCY = process.env.AIRTEL_MONEY_CURRENCY || "XAF";
const BASE_URL = process.env.AIRTEL_MONEY_BASE_URL || "https://openapi.airtel.africa";

const SIMULATION_MODE = !CLIENT_ID || !CLIENT_SECRET;
const SIMULATED_CONFIRM_DELAY_MS = 5000;

export type AirtelPaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error("Impossible d'obtenir un jeton Airtel Money");
  const data = await res.json();
  return data.access_token as string;
}

export async function initiatePayment(params: {
  phone: string;
  amount: number;
  reference: string;
}): Promise<void> {
  if (SIMULATION_MODE) {
    // Mode simulation : aucune requête réelle envoyée, la confirmation est
    // simulée par le temps écoulé (voir getPaymentStatus).
    return;
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/merchant/v1/payments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Country": COUNTRY,
      "X-Currency": CURRENCY,
    },
    body: JSON.stringify({
      reference: params.reference,
      subscriber: { country: COUNTRY, currency: CURRENCY, msisdn: params.phone },
      transaction: {
        amount: params.amount,
        country: COUNTRY,
        currency: CURRENCY,
        id: params.reference,
      },
    }),
  });
  if (!res.ok) throw new Error("Échec de l'initiation du paiement Airtel Money");
}

export async function getPaymentStatus(params: {
  reference: string;
  createdAt: Date;
}): Promise<AirtelPaymentStatus> {
  if (SIMULATION_MODE) {
    const elapsed = Date.now() - params.createdAt.getTime();
    return elapsed >= SIMULATED_CONFIRM_DELAY_MS ? "SUCCESS" : "PENDING";
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/standard/v1/payments/${params.reference}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Country": COUNTRY,
      "X-Currency": CURRENCY,
    },
  });
  if (!res.ok) return "PENDING";
  const data = await res.json();
  const status = data?.data?.transaction?.status;
  if (status === "TS") return "SUCCESS";
  if (status === "TF") return "FAILED";
  return "PENDING";
}

export const airtelMoneySimulationMode = SIMULATION_MODE;
