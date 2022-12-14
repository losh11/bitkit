import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TBalanceUnit, TBitcoinUnit } from '../types/wallet';
import {
	ICustomElectrumPeer,
	ISettings,
	TCoinSelectPreference,
	TCustomElectrumPeers,
	TReceiveOption,
	TTheme,
	TTransactionSpeed,
	TUnitPreference,
} from '../types/settings';
import { TAvailableNetworks } from '../../utils/networks';
import themes from '../../styles/themes';

export const settingsState = (state: Store): ISettings => state.settings;
const customElectrumPeersState = (state: Store): TCustomElectrumPeers =>
	state.settings.customElectrumPeers;

export const settingsSelector = (state: Store): ISettings => state.settings;
export const selectedCurrencySelector = createSelector(
	[settingsState],
	(settings): string => settings.selectedCurrency,
);
export const bitcoinUnitSelector = createSelector(
	[settingsState],
	(settings): TBitcoinUnit => settings.bitcoinUnit,
);
export const unitPreferenceSelector = createSelector(
	[settingsState],
	(settings): TUnitPreference => settings.unitPreference,
);
export const coinSelectAutoSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.coinSelectAuto,
);
export const hideOnboardingMessageSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.hideOnboardingMessage,
);
export const balanceUnitSelector = createSelector(
	[settingsState],
	(settings): TBalanceUnit => settings.balanceUnit,
);
export const hideBalanceSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.hideBalance,
);
export const enableOfflinePaymentsSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.enableOfflinePayments,
);
export const enableDevOptionsSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.enableDevOptions,
);
export const pinSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.pin,
);

export const coinSelectPreferenceSelector = createSelector(
	[settingsState],
	(settings): TCoinSelectPreference => settings.coinSelectPreference,
);

/**
 * Returns custom Electrum peers for a given network.
 * @param {Store} state
 * @param {TAvailableNetworks} selectedNetwork
 * @param {boolean} subtractReserveBalance
 * @returns {ICustomElectrumPeer[]}
 */
export const customElectrumPeersSelector = createSelector(
	[
		customElectrumPeersState,
		(
			customElectrumPeers,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(customElectrumPeers, selectedNetwork): ICustomElectrumPeer[] =>
		customElectrumPeers[selectedNetwork],
);
export const transactionSpeedSelector = createSelector(
	[settingsState],
	(settings): TTransactionSpeed => settings.transactionSpeed,
);
export const showSuggestionsSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.showSuggestions,
);
export const receivePreferenceSelector = createSelector(
	[settingsState],
	(settings): TReceiveOption[] => settings.receivePreference,
);
export const pinForPaymentsSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.pinForPayments,
);
export const themeSelector = createSelector(
	[settingsState],
	(settings): TTheme => settings.theme,
);
export const themeColorsSelector = createSelector(
	[settingsState],
	(settings): any => themes[settings.theme].colors,
);
export const selectedLanguageSelector = createSelector(
	[settingsState],
	(settings): string => settings.selectedLanguage,
);

export const enableAutoReadClipboardSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.enableAutoReadClipboard,
);

export const enableSendAmountWarningSelector = createSelector(
	[settingsState],
	(settings): boolean => settings.enableSendAmountWarning,
);
