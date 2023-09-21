import React, { ReactElement, memo, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { TouchableOpacity } from '../../../styles/components';
import { Text02B, Text02M } from '../../../styles/text';
import { SwitchIcon } from '../../../styles/icons';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import NumberPadTextField from '../../../components/NumberPadTextField';
import SafeAreaInset from '../../../components/SafeAreaInset';
import Button from '../../../components/Button';
import GradientView from '../../../components/GradientView';
import ReceiveNumberPad from './ReceiveNumberPad';
import { useSwitchUnit } from '../../../hooks/wallet';
import { useCurrency } from '../../../hooks/displayValues';
import { updateInvoice } from '../../../store/actions/receive';
import { receiveSelector } from '../../../store/reselect/receive';
import { getNumberPadText } from '../../../utils/numberpad';
import { createCJitEntry } from '../../../utils/blocktank';
import { showToast } from '../../../utils/notifications';
import type { ReceiveScreenProps } from '../../../navigation/types';
import { DEFAULT_CHANNEL_DURATION } from '../../Lightning/CustomConfirm';
import { primaryUnitSelector } from '../../../store/reselect/settings';
import { blocktankInfoSelector } from '../../../store/reselect/blocktank';
import Money from '../../../components/Money';

const ReceiveAmount = ({
	navigation,
}: ReceiveScreenProps<'ReceiveAmount'>): ReactElement => {
	const { t } = useTranslation('wallet');
	const { fiatTicker } = useCurrency();
	const [nextUnit, switchUnit] = useSwitchUnit();
	const [isLoading, setIsLoading] = useState(false);
	const invoice = useSelector(receiveSelector);
	const unit = useSelector(primaryUnitSelector);
	const blocktank = useSelector(blocktankInfoSelector);

	const onChangeUnit = (): void => {
		const result = getNumberPadText(invoice.amount, nextUnit);
		updateInvoice({ numberPadText: result });
		switchUnit();
	};

	const maxChannelSats = useMemo(() => {
		return blocktank.options.maxChannelSizeSat;
	}, [blocktank.options.maxChannelSizeSat]);
	const maxInvoiceSats = useMemo(() => {
		// Subtract from max to keep a buffer for dust
		return maxChannelSats - blocktank.options.minChannelSizeSat;
	}, [blocktank.options.minChannelSizeSat, maxChannelSats]);

	const onContinue = async (): Promise<void> => {
		setIsLoading(true);
		// Ensure the invoice is greater than blocktank.options.minChannelSizeSat
		if (invoice.amount < blocktank.options.minChannelSizeSat) {
			const txt = getNumberPadText(blocktank.options.minChannelSizeSat, unit);
			setIsLoading(false);
			showToast({
				type: 'error',
				title: `Below Minimum Amount of ${txt}`,
				description: `Invoice must be at least ${txt}`,
				autoHide: true,
			});
			return;
		}
		// Ensure the invoice is less than maxInvoiceSats
		if (invoice.amount > maxInvoiceSats) {
			const txt = getNumberPadText(maxInvoiceSats, unit);
			setIsLoading(false);
			showToast({
				type: 'error',
				title: `Above Maximum Amount of ${txt}`,
				description: `Invoice must be less than ${txt}`,
				autoHide: true,
			});
			return;
		}
		const cJitEntryResponse = await createCJitEntry({
			channelSizeSat: maxChannelSats,
			invoiceSat: invoice.amount,
			invoiceDescription: invoice.message,
			channelExpiryWeeks: DEFAULT_CHANNEL_DURATION,
			couponCode: 'bitkit',
		});
		if (cJitEntryResponse.isErr()) {
			setIsLoading(false);
			console.log({ error: cJitEntryResponse.error.message });
			showToast({
				type: 'error',
				title: 'CJIT Error',
				description: cJitEntryResponse.error.message,
			});
			return;
		}
		const order = cJitEntryResponse.value;
		updateInvoice({ jitOrder: order });
		navigation.navigate('ReceiveConnect');
		setIsLoading(false);
	};

	const continueDisabled =
		invoice.amount < blocktank.options.minChannelSizeSat ||
		invoice.amount > maxInvoiceSats;

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader
				title={t('receive_instantly')}
				displayBackButton={true}
			/>
			<View style={styles.content}>
				<NumberPadTextField
					value={invoice.numberPadText}
					testID="ReceiveNumberPadTextField"
				/>

				<View style={styles.numberPad} testID="ReceiveNumberPad">
					<View style={styles.actions}>
						<View>
							<Text02M color={'white5'}>{t('minimum')}</Text02M>
							<Money sats={25000} size="text01m" symbol={true} />
						</View>
						<View style={styles.actionButtons}>
							<View style={styles.actionButtonContainer}>
								<TouchableOpacity
									style={styles.actionButton}
									color="white08"
									testID="ReceiveNumberPadUnit"
									onPress={onChangeUnit}>
									<SwitchIcon color="brand" width={16.44} height={13.22} />
									<Text02B
										style={styles.actionButtonText}
										size="12px"
										color="brand">
										{nextUnit === 'BTC' && 'BTC'}
										{nextUnit === 'satoshi' && 'sats'}
										{nextUnit === 'fiat' && fiatTicker}
									</Text02B>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					<ReceiveNumberPad />

					<View style={styles.buttonContainer}>
						<Button
							size="large"
							text={t('continue')}
							loading={isLoading}
							testID="ReceiveAmountContinue"
							onPress={onContinue}
							disabled={continueDisabled}
						/>
					</View>
				</View>
			</View>
			<SafeAreaInset type="bottom" minPadding={16} />
		</GradientView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	actions: {
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
		marginBottom: 5,
		paddingBottom: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
	},
	numberPad: {
		flex: 1,
		marginTop: 'auto',
		maxHeight: 450,
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
	},
	actionButtonContainer: {
		alignItems: 'center',
	},
	actionButton: {
		marginLeft: 16,
		paddingVertical: 7,
		paddingHorizontal: 8,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionButtonText: {
		marginLeft: 11,
	},
	buttonContainer: {
		marginTop: 'auto',
	},
});

export default memo(ReceiveAmount);
