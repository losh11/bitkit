import { IBlocktank } from '../types/blocktank';
import {
	BtOrderState,
	BtPaymentState,
	IBtOrder,
	IBtInfo,
} from '@synonymdev/blocktank-lsp-http-client';

export const defaultBlocktankInfoShape: IBtInfo = {
	version: 2,
	nodes: [
		{
			alias: '',
			pubkey: '',
			connectionStrings: [],
		},
	],
	options: {
		minChannelSizeSat: 0,
		maxChannelSizeSat: 50000000,
		minExpiryWeeks: 1,
		maxExpiryWeeks: 12,
		minPaymentConfirmations: 0,
		minPaymentConfirmationsClientBalance: 1,
		max0ConfClientBalanceSat: 856487,
		maxClientBalanceLspBalanceRatio: 1,
	},
};

export const defaultBlocktankShape: IBlocktank = {
	orders: [],
	paidOrders: {},
	info: defaultBlocktankInfoShape,
};

export const defaultOrderResponse: IBtOrder = {
	id: '',
	state: BtOrderState.CREATED,
	feeSat: 0,
	lspBalanceSat: 0,
	clientBalanceSat: 0,
	zeroConf: false,
	channelExpiryWeeks: 0,
	channelExpiresAt: new Date(),
	orderExpiresAt: new Date(),
	channel: undefined,
	lspNode: {
		alias: '',
		pubkey: '',
		connectionStrings: [],
	},
	payment: {
		state: BtPaymentState.CREATED,
		paidSat: 0,
		bolt11Invoice: {
			request: '',
			// @ts-ignore
			state: null,
			expiresAt: new Date(),
			updatedAt: new Date(),
		},
		onchain: {
			address: '',
			confirmedSat: 0,
			transactions: [],
		},
	},
	couponCode: '',
	discountPercent: 0,
	updatedAt: new Date(),
	createdAt: new Date(),
};
