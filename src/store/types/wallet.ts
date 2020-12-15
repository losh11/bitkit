import { TAvailableNetworks } from '../../utils/networks';

export type TAddressType = 'bech32' | 'segwit' | 'legacy'; //"84" | "49" | "44";

export type TKeyDerivationPath = '84' | '49' | '44'; //"bech32" | "segwit" | "legacy";

export type NetworkTypePath = '0' | '1'; //"mainnet" | "testnet"

export type TBitcoinUnit = 'satoshi' | 'BTC' | 'mBTC' | 'μBTC';

export interface IWallet {
	loading: boolean;
	error: boolean;
	selectedNetwork: TAvailableNetworks;
	selectedWallet: string;
	wallets: { [key: string]: IDefaultWalletShape } | {};
	[key: string]: any;
}

export interface IWalletItem<T> {
	bitcoin: T;
	bitcoinTestnet: T;
	timestamp?: number | null;
}

export interface IAddress {
	[key: string]: {
		path: string;
		address: string;
		scriptHash: string;
	};
}

export interface IAddresses {
	bitcoin: IAddress | {};
	bitcoinTestnet: IAddress | {};
	timestamp: null;
}

export interface ICreateWallet {
	wallet?: string;
	mnemonic?: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	keyDerivationPath?: TKeyDerivationPath;
}

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IAddresses | IWalletItem<object>;
	addressIndex: IWalletItem<number>;
	changeAddresses: IAddresses | IWalletItem<object>;
	changeAddressIndex: IWalletItem<number>;
	utxos: IWalletItem<[]>;
	transactions: IWalletItem<[]>;
	blacklistedUtxos: IWalletItem<[]>;
	confirmedBalance: IWalletItem<number>;
	unconfirmedBalance: IWalletItem<number>;
	lastUpdated: IWalletItem<number>;
	hasBackedUpWallet: boolean;
	walletBackupTimestamp: string;
	keyDerivationPath: IWalletItem<TKeyDerivationPath>;
	networkTypePath: IWalletItem<string>;
	addressType: {
		bitcoin: TAddressType;
		bitcoinTestnet: TAddressType;
	};
	rbfData: IWalletItem<object>;
}
