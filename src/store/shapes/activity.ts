import { EActivityTypes, IActivity, IActivityItem } from '../types/activity';

export const defaultActivityItemShape: IActivityItem = {
	id: '',
	activityType: EActivityTypes.onChain,
	txType: 'received',
	confirmed: false,
	value: 0,
	fee: 0,
	message: '',
	address: '',
	timestamp: 0,
};

export const defaultActivityShape: IActivity = {
	items: [],
};
