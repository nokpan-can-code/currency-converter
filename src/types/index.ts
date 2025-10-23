export interface RatesResponse {
    result?: string;
    base_code?: string;
    conversion_rates?: Record<string, number>;
    rates?: Record<string, number>;
}