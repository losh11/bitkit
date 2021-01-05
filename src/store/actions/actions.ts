const actions = {
	UPDATE_USER: 'UPDATE_USER',
	UPDATE_WALLET: 'UPDATE_WALLET',
	CREATE_WALLET: 'CREATE_WALLET',
	UPDATE_ADDRESS_INDEX: 'UPDATE_ADDRESS_INDEX',
	ADD_ADDRESSES: 'ADD_ADDRESSES',
	UPDATE_UTXOS: 'UPDATE_UTXOS',
	UPDATE_TRANSACTIONS: 'UPDATE_TRANSACTIONS',
	UPDATE_SETTINGS: 'UPDATE_SETTINGS',
	UPDATE_OMNIBOLT: 'UPDATE_OMNIBOLT',
	START_LIGHTNING: 'START_LIGHTNING',
	CREATE_LIGHTNING_WALLET: 'CREATE_LIGHTNING_WALLET',
	UNLOCK_LIGHTNING_WALLET: 'UNLOCK_LIGHTNING_WALLET',
	UPDATE_LIGHTNING_STATE: 'UPDATE_LIGHTNING_STATE',
	UPDATE_LIGHTNING_INFO: 'UPDATE_LIGHTNING_INFO',
	UPDATE_LIGHTNING_ON_CHAIN_BALANCE: 'UPDATE_LIGHTNING_ON_CHAIN_BALANCE', //TODO remove action when on-chain wallet replaces LND's on-chain wallet
	UPDATE_LIGHTNING_CHANNEL_BALANCE: 'UPDATE_LIGHTNING_CHANNEL_BALANCE',
	UPDATE_ACTIVITY_ENTRIES: 'UPDATE_ACTIVITY_ENTRIES',
	UPDATE_ACTIVITY_SEARCH_FILTER: 'UPDATE_ACTIVITY_SEARCH_FILTER',
	UPDATE_ACTIVITY_TYPES_FILTER: 'UPDATE_ACTIVITY_TYPES_FILTER',
};
export default actions;
