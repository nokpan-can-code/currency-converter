import axios from 'axios';
import type { RatesResponse } from '../types';

// Read API key from environment variable
const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY;

if (!API_KEY) {
    console.error('REACT_APP_EXCHANGE_API_KEY is not defined in .env file');
}

const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

export async function fetchLatestRates(baseCurrency: string = "USD"): Promise<RatesResponse> {
    try {
        const url = `${BASE_URL}/latest/${baseCurrency}`;
        const response = await axios.get<RatesResponse>(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        throw error;
    }
}
