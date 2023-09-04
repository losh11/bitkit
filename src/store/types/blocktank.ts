import {
	IBtInfo,
	IBtOrder,
	ICreateOrderOptions,
} from '@synonymdev/blocktank-lsp-http-client';

export interface IBlocktank {
	orders: IBtOrder[];
	paidOrders: TPaidBlocktankOrders;
	info: IBtInfo;
}

export type TPaidBlocktankOrders = {
	[orderId: string]: string;
};

export type TGeoBlockResponse = { error?: 'GEO_BLOCKED'; accept?: boolean };

export interface ICreateOrderRequest {
	lspBalanceSat: number;
	channelExpiryWeeks: number;
	options: Partial<ICreateOrderOptions>;
}
