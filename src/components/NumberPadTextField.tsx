import React, { memo, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import {
	Pressable,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native';

import { Display } from '../styles/text';
import Money from './Money';
import MoneySymbol from './MoneySymbol';
import { EBalanceUnit, EBitcoinUnit } from '../store/types/wallet';
import { balanceUnitSelector } from '../store/reselect/settings';
import { convertToSats } from '../utils/conversion';
import {
	getDisplayValues,
	getFiatDisplayValuesForFiat,
} from '../utils/displayValues';

const NumberPadTextField = ({
	value,
	showPlaceholder = true,
	reverse = false,
	style,
	testID,
	onPress,
}: {
	value: string;
	space?: number;
	showPlaceholder?: boolean;
	reverse?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	onPress?: () => void;
}): ReactElement => {
	const unit = useSelector(balanceUnitSelector);
	const satoshis = convertToSats(value, unit);

	let placeholder = '0';
	let placeholderFractional = '';

	if (unit === EBalanceUnit.BTC) {
		placeholderFractional = '00000000';
	}
	if (unit === EBalanceUnit.fiat) {
		placeholderFractional = '00';
	}
	if (placeholderFractional !== '') {
		placeholder = `0.${placeholderFractional}`;
	}

	if (value) {
		const [integer, fractional] = value.split('.');

		if (unit === EBalanceUnit.fiat) {
			const { fiatWhole } = getFiatDisplayValuesForFiat({
				value: Number(integer),
			});
			value = value.replace(integer, fiatWhole);
		}

		if (value.includes('.')) {
			placeholder = placeholder.substring(2 + fractional?.length);

			// truncate to 2 decimals for fiat
			if (unit === EBalanceUnit.fiat) {
				const { fiatWhole } = getFiatDisplayValuesForFiat({
					value: Number(integer),
				});

				value = `${fiatWhole}.${fractional.substring(0, 2)}`;
			}
		} else {
			if (unit === EBalanceUnit.satoshi) {
				const displayValue = getDisplayValues({
					satoshis: Number(value),
					bitcoinUnit: EBitcoinUnit.satoshi,
				});
				value = displayValue.bitcoinFormatted;

				placeholder = '';
			} else {
				placeholder = `.${placeholderFractional}`;
			}
		}
	}

	const btcProps = { symbol: true };
	const fiatProps = { showFiat: true };

	return (
		<Pressable style={style} testID={testID} onPress={onPress}>
			{!reverse && (
				<Money
					style={styles.secondary}
					sats={satoshis}
					size="caption13Up"
					color="gray1"
					{...{ ...(unit === EBalanceUnit.fiat ? btcProps : fiatProps) }}
				/>
			)}

			<View style={styles.primary}>
				<MoneySymbol style={styles.symbol} unit={unit} />
				<Display color="white" lineHeight="57px">
					{value !== placeholder && value}
					<Display
						color={showPlaceholder ? 'white5' : 'white'}
						lineHeight="57px">
						{placeholder}
					</Display>
				</Display>
			</View>

			{reverse && (
				<Money
					sats={satoshis}
					size="text01m"
					color="gray1"
					{...{ ...(unit === EBalanceUnit.fiat ? btcProps : fiatProps) }}
				/>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	primary: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	secondary: {
		marginBottom: 9,
	},
	symbol: {
		marginRight: 4,
	},
});

export default memo(NumberPadTextField);