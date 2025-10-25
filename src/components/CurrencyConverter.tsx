import React, { useEffect, useMemo, useState } from "react";
import { fetchLatestRates } from "../services/exchangeApi";
import type { RatesResponse } from "../types";
import img from "../assets/exchage.svg";


const DEFAULT_BASE = "USD";

const CurrencyConverter: React.FC = () => {
  const [ratesData, setRatesData] = useState<RatesResponse | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<string>(DEFAULT_BASE);
  const [fromCurrency, setFromCurrency] = useState<string>(DEFAULT_BASE);
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exchange rates when base currency changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchLatestRates(baseCurrency)
      .then((data) => {
        if (!cancelled) {
          setRatesData(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("Failed to fetch exchange rates. Please check your API key.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseCurrency]);

  // Get list of available currencies
  const currencyList = useMemo(() => {
    const rates = (ratesData?.conversion_rates ?? ratesData?.rates) ?? {};
    return Object.keys(rates).sort();
  }, [ratesData]);

  // Get exchange rate for a specific currency
  const getRate = (currency: string): number => {
    const rates = (ratesData?.conversion_rates ?? ratesData?.rates) ?? {};
    return rates[currency] ?? 0;
  };

  // Calculate converted amount
  const converted = useMemo(() => {
    if (!ratesData) return 0;
    const rates = (ratesData.conversion_rates ?? ratesData.rates) ?? {};
    const rateFrom = rates[fromCurrency] ?? 0;
    const rateTo = rates[toCurrency] ?? 0;

    if (rateFrom === 0) return 0;
    return (amount * rateTo) / rateFrom;
  }, [ratesData, amount, fromCurrency, toCurrency]);

  // Swap from and to currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Refresh exchange rates
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchLatestRates(baseCurrency)
      .then(setRatesData)
      .catch(() => setError("Failed to refresh rates"))
      .finally(() => setIsLoading(false));
  };

  // Copy converted amount to clipboard
  const handleCopy = () => {
    if (converted) {
      navigator.clipboard?.writeText(converted.toFixed(4));
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="card">
      {/* Header Section */}
      <div className="header">
        <div>
          <div className="title">Currency Converter</div>
          <div className="subtitle">Real-time rates (base: {baseCurrency})</div>
        </div>
        <div className="loading">{isLoading ? "Loading..." : ""}</div>
      </div>

      {/* Controls Section */}
      <div className="controls">
        <select
          className="select"
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          disabled={isLoading}
        >
          {currencyList.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>

        <input
          className="input"
          type="number"
          value={amount}
          min="0"
          step="0.01"
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={isLoading}
        />

        <button
          className="swap-button"
          onClick={handleSwap}
          title="Swap currencies"
          // disabled={isLoading}
        >
          <img src={img}width={"40px"}  alt="" />
          
        </button>

        <select
          className="select"
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          disabled={isLoading}
        >
          {currencyList.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      {/* Result Section */}
      <div className="result">
        <div className="result-section">
          <div className="amount-label">Converted Amount</div>
          <div className="big">
            {converted ? converted.toFixed(4) : "—"}
          </div>
        </div>
        <div className="result-section right">
          <div className="amount-label">Exchange Rate</div>
          <div className="rate-value">
            {ratesData
              ? `1 ${fromCurrency} = ${(
                  getRate(toCurrency) / (getRate(fromCurrency) || 1)
                ).toFixed(6)} ${toCurrency}`
              : "—"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button className="btn" onClick={handleRefresh} disabled={isLoading}>
          Refresh Rates
        </button>

        <button
          className="btn primary"
          onClick={handleCopy}
          disabled={!converted}
        >
          Copy Result
        </button>
      </div>

      {/* Footer */}
      <div className="footer">
        {error ? (
          <span className="error">{error}</span>
        ) : (
          "Rates provided by ExchangeRate-API"
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;