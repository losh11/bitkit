import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getExchangeRate } from '../utils/exchange-rate';
import { getDisplayValues } from '../utils/displayValues';
import { IDisplayValues } from '../utils/displayValues/types';
import { EBitcoinUnit } from '../store/types/wallet';
import { exchangeRatesSelector } from '../store/reselect/wallet';
import {
	bitcoinUnitSelector,
	selectedCurrencySelector,
} from '../store/reselect/settings';

export default function useDisplayValues(
	satoshis: number,
	bitcoinUnit?: EBitcoinUnit,
): IDisplayValues {
	const stateUnit = useSelector(bitcoinUnitSelector);
	const selectedCurrency = useSelector(selectedCurrencySelector);
	const exchangeRates = useSelector(exchangeRatesSelector);
	const exchangeRate = useMemo(
		() => getExchangeRate(selectedCurrency),
		[selectedCurrency],
	);
	bitcoinUnit = useMemo(
		() => bitcoinUnit ?? stateUnit,
		[bitcoinUnit, stateUnit],
	);
	const currencySymbol = useMemo(
		() => exchangeRates[selectedCurrency]?.currencySymbol,
		[exchangeRates, selectedCurrency],
	);
	return useMemo(() => {
		return getDisplayValues({
			satoshis,
			exchangeRate,
			currency: selectedCurrency,
			currencySymbol,
			bitcoinUnit,
			locale: 'en-US', //TODO get from native module
		});
	}, [satoshis, exchangeRate, selectedCurrency, currencySymbol, bitcoinUnit]);
}

/**
 * Returns the symbol for the currently selected fiat currency
 */
export const useCurrency = (): {
	fiatTicker: string;
	fiatSymbol: string;
} => {
	const selectedCurrency = useSelector(selectedCurrencySelector);
	const exchangeRates = useSelector(exchangeRatesSelector);
	const symbol = exchangeRates[selectedCurrency]?.currencySymbol;

	return {
		fiatTicker: selectedCurrency,
		fiatSymbol: symbol,
	};
};

/**
 * Returns 0 if no exchange rate for currency found or something goes wrong
 */
export const useExchangeRate = (currency = 'EUR'): number => {
	const exchangeRates = useSelector(exchangeRatesSelector);
	return useMemo(
		() => exchangeRates[currency]?.rate ?? 0,
		[currency, exchangeRates],
	);
};
