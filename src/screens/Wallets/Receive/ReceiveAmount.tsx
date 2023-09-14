import React, { ReactElement, memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { TouchableOpacity } from '../../../styles/components';
import { Text02B } from '../../../styles/text';
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
import { createCjitOrder } from '../../../utils/blocktank';
import { showToast } from '../../../utils/notifications';
import type { ReceiveScreenProps } from '../../../navigation/types';

const ReceiveAmount = ({
	navigation,
}: ReceiveScreenProps<'ReceiveAmount'>): ReactElement => {
	const { t } = useTranslation('wallet');
	const { fiatTicker } = useCurrency();
	const [nextUnit, switchUnit] = useSwitchUnit();
	const [isLoading, setIsLoading] = useState(false);
	const invoice = useSelector(receiveSelector);

	const onChangeUnit = (): void => {
		const result = getNumberPadText(invoice.amount, nextUnit);
		updateInvoice({ numberPadText: result });
		switchUnit();
	};

	const onContinue = async (): Promise<void> => {
		setIsLoading(true);

		const orderResponse = await createCjitOrder({
			invoiceSat: invoice.amount,
			invoiceDescription: 'test',
			channelExpiryWeeks: 10,
		});

		if (orderResponse.isErr()) {
			setIsLoading(false);

			// TODO: parse error
			console.log({ error: orderResponse.error.message });

			showToast({
				type: 'error',
				title: 'Error',
				description: 'orderResponse.error',
			});
			return;
		}

		const order = orderResponse.value;
		console.log({ order });

		updateInvoice({ jitOrder: order });
		navigation.navigate('ReceiveConnect');

		setIsLoading(false);
	};

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader
				title={t('receive_instantly')}
				displayBackButton={false}
			/>
			<View style={styles.content}>
				<NumberPadTextField
					value={invoice.numberPadText}
					testID="ReceiveNumberPadTextField"
				/>

				<View style={styles.numberPad} testID="ReceiveNumberPad">
					<View style={styles.actions}>
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
