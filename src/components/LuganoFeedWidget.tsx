import React, { memo, ReactElement, useEffect, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Image } from 'react-native';

import { Caption13M, Text01M, Text02M } from '../styles/text';
import BaseFeedWidget from './BaseFeedWidget';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { openURL } from '../utils/helpers';

import { useSlashfeed } from '../hooks/widgets';
import Button from './Button';
import { CalendarIcon, MapPinLineIcon, MapTrifoldIcon } from '../styles/icons';

const cache = {
	banner: '',
	schedule: [],
	links: [],
};

const iconBase64 =
	'data:image/png;base64,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';

const LuganoWidget = ({
	url,
	isEditing = false,
	style,
	testID,
	onLongPress,
	onPressIn,
}: {
	url: string;
	isEditing?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	onLongPress?: () => void;
	onPressIn?: () => void;
}): ReactElement => {
	const { config, reader } = useSlashfeed({ url });

	// TODO: update this with data from Bitkit.
	const [treasureChestsFound] = useState(0);

	const [banner, setBanner] = useState<string>(cache.banner);

	const [links, setLinks] = useState<{ name: string; url: string }[]>(
		cache.links,
	);
	const [schedule, setSchedule] = useState<
		{ timeLocation: string; name: string }[]
	>([]);

	useEffect(() => {
		const bannerBase64Path = config?.fields?.find((f) => f.name === 'banner')
			?.files?.base64;
		if (bannerBase64Path) {
			reader
				.getField(bannerBase64Path.replace('/feed/', ''))
				.then((base64) => {
					if (!base64) {
						return;
					}
					const dataURL = `data:image/png;base64,${base64 as string}`;
					setBanner(dataURL);
					cache.banner = dataURL;
				})
				.catch((error) => {
					console.log('Error while reading banner png', error);
				});
		}

		reader
			.getField('links.json')
			// @ts-ignore
			.then((_links: { name: string; url: string }[]) => {
				if (!_links || !Array.isArray(_links)) {
					return;
				}
				// @ts-ignore
				cache.links = _links;
				setLinks(_links);
			})
			.catch((error) => {
				console.log('Error while reading links json', error);
			});

		reader
			.getField('schedule.json')
			// @ts-ignore
			.then((_schedule: { time: number; location: string; name: string }[]) => {
				const mapped = _schedule.map((event) => {
					const time = new Date(event.time);
					const hours = time.getHours().toString().padStart(2, '0');
					const minutes = time.getMinutes().toString().padStart(2, '0');

					return {
						timeLocation: hours + ':' + minutes + ' @ ' + event.location,
						name: event.name,
					};
				});

				// @ts-ignore
				cache.schedule = mapped;
				setSchedule(mapped);
			})
			.catch((error) => {
				console.log('Error while reading schedule json', error);
			});
	}, [config, reader]);

	return (
		<BaseFeedWidget
			url={url}
			style={style}
			name={'Plan ₿ Forum'}
			isLoading={false}
			isEditing={isEditing}
			testID={testID}
			onPressIn={onPressIn}
			onLongPress={onLongPress}
			iconComponent={
				<Image source={{ uri: iconBase64 }} style={styles.icon} />
			}>
			<>
				{schedule.map((event) => (
					<View key={event.name} style={styles.row}>
						<View style={styles.columnLeft}>
							<Text02M color="gray1" numberOfLines={1}>
								{event.timeLocation}
							</Text02M>
						</View>
						<View style={styles.columnRight}>
							<Text01M numberOfLines={1} ellipsizeMode="middle">
								{event.name}
							</Text01M>
						</View>
					</View>
				))}
				{banner && (
					<View style={styles.bannerContainer}>
						<Image source={{ uri: banner }} style={styles.banner} />
					</View>
				)}
				{links && (
					<View style={styles.linksContainer}>
						{links.map(
							(link, index): ReactElement => (
								<Button
									style={styles.link}
									text={link.name}
									key={link.name}
									icon={
										index === 0 ? (
											<CalendarIcon width={12} height={12} />
										) : index === 1 ? (
											<MapTrifoldIcon width={16} height={16} />
										) : (
											<MapPinLineIcon width={16} height={16} />
										)
									}
									onPress={(): void => {
										link.url &&
											openURL(
												link.url.startsWith('http')
													? link.url
													: 'https://' + link.url,
											);
									}}
								/>
							),
						)}
					</View>
				)}
				<View style={styles.source}>
					<View style={styles.sourceColumnLeft}>
						<Caption13M color="gray1" numberOfLines={1}>
							{`Treasure Chests Found: ${treasureChestsFound} of 7`}
						</Caption13M>
					</View>
					<View style={styles.columnRight}>
						<TouchableOpacity
							activeOpacity={0.9}
							onPress={(): Promise<boolean> => openURL('https://bitkit.to')}>
							<Caption13M color="gray1" numberOfLines={1}>
								bitkit.to
							</Caption13M>
						</TouchableOpacity>
					</View>
				</View>
			</>
		</BaseFeedWidget>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minHeight: 28,
	},
	columnLeft: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	columnRight: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	source: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	sourceColumnLeft: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
	},
	bannerContainer: {
		width: '100%',
		maxHeight: 180,
		borderRadius: 16,
		overflow: 'hidden',
		marginTop: 16,
	},
	linksContainer: {
		display: 'flex',
		flexDirection: 'row',
		paddingVertical: 16,
		columnGap: 4,
	},
	link: {
		flex: 1,
		minWidth: 0,
	},
	banner: {
		width: '100%',
		height: '100%',
	},
	icon: {
		width: 32,
		height: 32,
	},
});

export default memo(LuganoWidget);
