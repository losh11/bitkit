import React, {
	memo,
	ReactElement,
	useMemo,
	useState,
	useCallback,
} from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import { useTranslation } from 'react-i18next';

import { View } from '../styles/components';
import { Caption13Up } from '../styles/text';
import SuggestionCard from './SuggestionCard';
import { allTodos } from '../store/shapes/todos';
import { TTodoType } from '../store/types/todos';
import { removeTodo } from '../store/actions/todos';
import { showBottomSheet } from '../store/actions/ui';
import { useBalance } from '../hooks/wallet';
import Dialog from './Dialog';
import type { RootNavigationProp } from '../navigation/types';
import { todosSelector } from '../store/reselect/todos';
import { lightningSettingUpStepSelector } from '../store/reselect/user';
import {
	pinSelector,
	showSuggestionsSelector,
} from '../store/reselect/settings';

const Suggestions = (): ReactElement => {
	const { t } = useTranslation('cards');
	const navigation = useNavigation<RootNavigationProp>();
	const { width } = useWindowDimensions();
	const { onchainBalance } = useBalance();
	const [index, setIndex] = useState(0);
	const [showDialog, setShowDialog] = useState(false);
	const todos = useSelector(todosSelector);
	const pinTodoDone = useSelector(pinSelector);
	const showSuggestions = useSelector(showSuggestionsSelector);
	const lightningSettingUpStep = useSelector(lightningSettingUpStepSelector);

	const carouselStyle = useMemo(() => ({ width }), [width]);
	const panGestureHandlerProps = useMemo(
		() => ({ activeOffsetX: [-10, 10] }),
		[],
	);

	// reset index on mount
	useFocusEffect(useCallback(() => setIndex(0), []));

	const handleOnPress = useCallback(
		(id: TTodoType): void => {
			if (id === 'backupSeedPhrase') {
				showBottomSheet('backupPrompt');
			}

			if (id === 'lightning') {
				if (onchainBalance > 0) {
					navigation.navigate('LightningRoot', { screen: 'Introduction' });
				} else {
					setShowDialog(true);
				}
			}

			if (id === 'lightningSettingUp') {
				navigation.navigate('LightningRoot', { screen: 'SettingUp' });
			}

			if (id === 'pin') {
				if (!pinTodoDone) {
					showBottomSheet('PINNavigation', { showLaterButton: true });
				} else {
					navigation.navigate('Settings', { screen: 'DisablePin' });
				}
			}

			if (id === 'slashtagsProfile') {
				navigation.navigate('Profile');
			}

			if (id === 'buyBitcoin') {
				navigation.navigate('BuyBitcoin');
			}
		},
		[onchainBalance, navigation, pinTodoDone],
	);

	if (!todos.length || !showSuggestions) {
		return <></>;
	}

	const todoItems = todos.map((id) => allTodos.find((todo) => todo.id === id)!);
	// avoid crash when deleting last item
	const defaultIndex = Math.min(index, todos.length - 1);

	return (
		<>
			<Caption13Up style={styles.title} color="gray1">
				{t('suggestions')}
			</Caption13Up>
			<View style={styles.container} testID="Suggestions">
				<Carousel
					style={carouselStyle}
					data={todoItems}
					defaultIndex={defaultIndex}
					loop={false}
					height={170}
					width={170}
					panGestureHandlerProps={panGestureHandlerProps}
					onSnapToItem={setIndex}
					renderItem={({ item }): ReactElement => {
						const title = t(`${item.id}.title`);
						let description = t(`${item.id}.description`);

						if (item.id === 'lightningSettingUp') {
							description = t(
								`${item.id}.description${lightningSettingUpStep}`,
							);
						}

						return (
							<SuggestionCard
								id={item.id}
								key={item.id}
								color={item.color}
								image={item.image}
								title={title}
								description={description}
								dismissable={item.dismissable}
								temporary={item.temporary}
								onPress={handleOnPress}
								onClose={removeTodo}
							/>
						);
					}}
				/>
			</View>
			<Dialog
				visible={showDialog}
				title={t('lightning_no_funds_title')}
				description={t('lightning_no_funds_desc')}
				confirmText={t('ok')}
				onConfirm={(): void => {
					setShowDialog(false);
				}}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	title: {
		marginTop: 25,
		marginBottom: 6,
		marginLeft: 16,
	},
	container: {
		marginLeft: 16,
		flexDirection: 'row',
		justifyContent: 'center',
	},
});

export default memo(Suggestions);
