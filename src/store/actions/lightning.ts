import actions from './actions';
import { getDispatch, getLightningStore } from '../helpers';
import { err, ok, Result } from '@synonymdev/result';
import { LNURLChannelParams } from 'js-lnurl';
import { getLNURLParams, lnurlChannel } from '@synonymdev/react-native-lnurl';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import { TAvailableNetworks } from '../../utils/networks';
import {
	addPeers,
	createPaymentRequest,
	getClaimableBalance,
	getCustomLightningPeers,
	getLightningChannels,
	getNodeIdFromStorage,
	getNodeVersion,
	hasOpenLightningChannels,
	parseUri,
} from '../../utils/lightning';
import { TChannel, TInvoice } from '@synonymdev/react-native-ldk';
import {
	TCreateLightningInvoice,
	TLightningNodeVersion,
} from '../types/lightning';
import { TWalletName } from '../types/wallet';

const dispatch = getDispatch();

/**
 * Attempts to update the node id for the given wallet and network.
 * @param {string} nodeId
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLightningNodeId = ({
	nodeId,
	selectedWallet,
	selectedNetwork,
}: {
	nodeId: string;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Result<string> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const nodeIdFromStorage = getNodeIdFromStorage({
		selectedWallet,
		selectedNetwork,
	});
	if (nodeId && nodeIdFromStorage !== nodeId) {
		const payload = {
			nodeId,
			selectedWallet,
			selectedNetwork,
		};
		dispatch({
			type: actions.UPDATE_LIGHTNING_NODE_ID,
			payload,
		});
	}
	return ok('No need to update nodeId.');
};

/**
 * Attempts to grab, update and save the lightning node version to storage.
 * @returns {Promise<Result<TLightningNodeVersion>>}
 */
export const updateLightningNodeVersion = async (): Promise<
	Result<TLightningNodeVersion>
> => {
	try {
		const version = await getNodeVersion();
		if (version.isErr()) {
			return err(version.error.message);
		}
		const currentVersion = getLightningStore()?.version;
		if (version.value.ldk !== currentVersion.ldk) {
			dispatch({
				type: actions.UPDATE_LIGHTNING_NODE_VERSION,
				payload: { version: version.value },
			});
		}
		return ok(version.value);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * Attempts to update the lightning channels for the given wallet and network.
 * This method will save all channels (both pending, open & closed) to redux and update openChannelIds to reference channels that are currently open.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLightningChannels = async ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TChannel[]>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const lightningChannels = await getLightningChannels();
	if (lightningChannels.isErr()) {
		return err(lightningChannels.error.message);
	}

	const channels: { [channelId: string]: TChannel } = {};
	const openChannelIds: string[] = [];

	lightningChannels.value.forEach((channel) => {
		channels[channel.channel_id] = channel;
		if (!openChannelIds.includes(channel.channel_id)) {
			openChannelIds.push(channel.channel_id);
		}
	});

	const payload = {
		channels,
		openChannelIds,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.UPDATE_LIGHTNING_CHANNELS,
		payload,
	});
	return ok(lightningChannels.value);
};

/**
 * Claims a lightning channel from a lnurl-channel string
 * @param {string} lnurl
 * @returns {Promise<Result<string>>}
 */
export const claimChannelFromLnurlString = async (
	lnurl: string,
): Promise<Result<string>> => {
	const res = await getLNURLParams(lnurl);
	if (res.isErr()) {
		return err(res.error);
	}

	const params = res.value as LNURLChannelParams;
	if (params.tag !== 'channelRequest') {
		return err('Not a channel request lnurl');
	}

	return claimChannel(params);
};

/**
 * Claims a lightning channel from a decoded lnurl-channel request
 * @param {LNURLChannelParams} params
 * @returns {Promise<Result<string>>}
 */
export const claimChannel = async (
	params: LNURLChannelParams,
): Promise<Result<string>> => {
	// TODO: Connect to peer from URI.
	const lnurlRes = await lnurlChannel({
		params,
		isPrivate: true,
		cancel: false,
		localNodeId: '',
	});

	if (lnurlRes.isErr()) {
		return err(lnurlRes.error);
	}

	return ok(lnurlRes.value);
};

/**
 * Creates and stores a lightning invoice, for the specified amount, and refreshes/re-adds peers.
 * @param {number} amountSats
 * @param {string} [description]
 * @param {number} [expiryDeltaSeconds]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TWalletName} [selectedWallet]
 */
export const createLightningInvoice = async ({
	amountSats,
	description,
	expiryDeltaSeconds,
	selectedNetwork,
	selectedWallet,
}: TCreateLightningInvoice): Promise<Result<TInvoice>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!hasOpenLightningChannels({ selectedWallet, selectedNetwork })) {
		return err('No lightning channels available to receive an invoice.');
	}
	const invoice = await createPaymentRequest({
		amountSats,
		description,
		expiryDeltaSeconds,
	});
	if (invoice.isErr()) {
		return err(invoice.error.message);
	}

	addPeers({ selectedNetwork, selectedWallet }).then();

	const payload = {
		invoice: invoice.value,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.ADD_LIGHTNING_INVOICE,
		payload,
	});
	return ok(invoice.value);
};

/**
 * Filters out and removes expired invoices from the invoices array
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TWalletName} [selectedWallet]
 * @returns {Promise<Result<string>>}
 */
export const removeExpiredLightningInvoices = async ({
	selectedNetwork,
	selectedWallet,
}: {
	selectedNetwork?: TAvailableNetworks;
	selectedWallet?: TWalletName;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const payload = {
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.REMOVE_EXPIRED_LIGHTNING_INVOICES,
		payload,
	});
	return ok('');
};

/**
 * Removes a lightning invoice from the invoices array via its payment hash.
 * //TODO remove when this is complete: https://github.com/synonymdev/react-native-ldk/issues/152
 * @param {string} paymentHash
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TWalletName} [selectedWallet]
 * @returns {Promise<Result<string>>}
 */
export const removeLightningInvoice = async ({
	paymentHash,
	selectedNetwork,
	selectedWallet,
}: {
	paymentHash: string;
	selectedNetwork?: TAvailableNetworks;
	selectedWallet?: TWalletName;
}): Promise<Result<string>> => {
	if (!paymentHash) {
		return err('No payment hash provided.');
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const payload = {
		paymentHash,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.REMOVE_LIGHTNING_INVOICE,
		payload,
	});
	return ok('Successfully removed lightning invoice.');
};

/*
 * This resets the lightning store to defaultLightningShape
 */
export const resetLightningStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_LIGHTNING_STORE,
	});
	return ok('');
};

/**
 * Attempts to save a custom lightning peer to storage.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} peer
 */
export const savePeer = ({
	selectedWallet,
	selectedNetwork,
	peer,
}: {
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
	peer: string;
}): Result<string> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	if (!peer) {
		return err('Invalid Peer Data');
	}
	// Check that the URI is valid.
	const parsedPeerData = parseUri(peer);
	if (parsedPeerData.isErr()) {
		return err(parsedPeerData.error.message);
	}
	// Ensure we haven't already added this peer.
	const existingPeers = getCustomLightningPeers({
		selectedWallet,
		selectedNetwork,
	});
	if (existingPeers.includes(peer)) {
		return ok('Peer Already Added');
	}
	const payload = {
		peer,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.SAVE_LIGHTNING_PEER,
		payload,
	});
	return ok('Successfully Saved Lightning Peer.');
};

/**
 * Attempts to remove a custom lightning peer from storage.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} peer
 * @returns {Result<string>}
 */
export const removePeer = ({
	selectedWallet,
	selectedNetwork,
	peer,
}: {
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
	peer: string;
}): Result<string> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!peer) {
		return err('Invalid Peer Data');
	}
	const payload = {
		peer,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.REMOVE_LIGHTNING_PEER,
		payload,
	});
	return ok('Successfully Removed Lightning Peer');
};

export const updateClaimableBalance = async ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const claimableBalance = await getClaimableBalance({
		selectedNetwork,
		selectedWallet,
	});

	const payload = {
		selectedNetwork,
		selectedWallet,
		claimableBalance,
	};

	dispatch({
		type: actions.UPDATE_CLAIMABLE_BALANCE,
		payload,
	});
	return ok('Successfully Updated Claimable Balance.');
};
