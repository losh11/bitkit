import { useSelector } from 'react-redux';
import { IGetOrderResponse } from '@synonymdev/blocktank-client';
import {
	blocktankOrdersSelector,
	blocktankPaidOrdersSelector,
} from '../store/reselect/blocktank';

/**
 * Returns the list of blocktank orders that have been paid.
 * @returns {IGetOrderResponse[]} paid Blocktank orders
 */
export const usePaidBlocktankOrders = (): IGetOrderResponse[] => {
	const orders = useSelector(blocktankOrdersSelector);
	const paidOrders = useSelector(blocktankPaidOrdersSelector);

	const paidBlocktankOrders = orders.filter((order) => {
		return Object.keys(paidOrders).find((orderId) => orderId === order._id);
	});

	return paidBlocktankOrders;
};
