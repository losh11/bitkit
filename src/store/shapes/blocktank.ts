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
		minHighRiskPaymentConfirmations: 1,
		max0ConfClientBalanceSat: 856487,
	},
};

export const defaultBlocktankShape: IBlocktank = {
	orders: [],
	paidOrders: {},
	info: defaultBlocktankInfoShape,
	cJitEntries: [],
};

export const defaultOrderResponse: IBtOrder = {
	id: '',
	state: BtOrderState.CREATED,
	feeSat: 0,
	lspBalanceSat: 0,
	clientBalanceSat: 0,
	zeroConf: false,
	channelExpiryWeeks: 0,
	// @ts-ignore
	channelExpiresAt: new Date().getTime(),
	// @ts-ignore
	orderExpiresAt: new Date().getTime(),
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
			// @ts-ignore
			expiresAt: new Date().getTime(),
			// @ts-ignore
			updatedAt: new Date().getTime(),
		},
		onchain: {
			address: '',
			confirmedSat: 0,
			transactions: [],
			requiredConfirmations: 0,
		},
	},
	couponCode: '',
	discountPercent: 0,
	// @ts-ignore
	updatedAt: new Date().getTime(),
	// @ts-ignore
	createdAt: new Date().getTime(),
};
