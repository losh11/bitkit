import { createSelector } from '@reduxjs/toolkit';
import Store from '../types';
import { IBlocktank, TPaidBlocktankOrders } from '../types/blocktank';
import { IBtInfo, IBtOrder } from '@synonymdev/blocktank-lsp-http-client';

const blocktankState = (state: Store): IBlocktank => state.blocktank;

export const blocktankSelector = (state: Store): IBlocktank => state.blocktank;

export const blocktankInfoSelector = createSelector(
	blocktankState,
	(blocktank): IBtInfo => blocktank.info,
);
export const blocktankOrdersSelector = createSelector(
	blocktankState,
	(blocktank): IBtOrder[] => blocktank.orders,
);
/**
 * Returns a blocktank order for a given order ID.
 */
export const blocktankOrderSelector = createSelector(
	[blocktankState, (_blocktank, orderId: string): string => orderId],
	(blocktank, orderId): IBtOrder => {
		return blocktank.orders.find((o) => o.id === orderId)!;
	},
);
export const blocktankPaidOrdersSelector = createSelector(
	blocktankState,
	(blocktank): TPaidBlocktankOrders => blocktank.paidOrders,
);
/**
 * Returns a paid blocktank order txid given its order ID.
 */
export const blocktankPaidOrderSelector = createSelector(
	[blocktankState, (_blocktank, orderId: string): string => orderId],
	(blocktank, orderId): string => {
		const paidBlocktankOrders = blocktank.paidOrders;
		if (orderId in paidBlocktankOrders) {
			return paidBlocktankOrders[orderId];
		}
		return '';
	},
);
