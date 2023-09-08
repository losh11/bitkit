import React, { memo, ReactElement, useEffect, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Image } from 'react-native';
import * as SlashURL from '@synonymdev/slashtags-url';

import { Caption13M, Text01M, Text02M } from '../styles/text';
import BaseFeedWidget from './BaseFeedWidget';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { openURL } from '../utils/helpers';

import { webRelayUrl } from './SlashtagsProvider2';
import { LuganoFeedURL } from '../screens/Widgets/WidgetsSuggestions';
import { useSlashfeed } from '../hooks/widgets';
import Button from './Button';
import { CalendarIcon, MapPinLineIcon, MapTrifoldIcon } from '../styles/icons';

const cache = {
	banner: '',
	schedule: [],
	links: [],
};

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
		const bannerPath = config?.fields?.find((f) => f.name === 'banner')?.main;

		if (bannerPath) {
			const parsed = SlashURL.parse(LuganoFeedURL);

			const bannerURL =
				bannerPath &&
				webRelayUrl.replace(/\/*$/, '/') + // remove possible duplicate trailing forward slash
					parsed.id + // <id> part of the url https://<relay path>/<id>/<path>
					'/' +
					encodeURIComponent(parsed.path.slice(1)) + // Encode feed name to avoid special character issues
					bannerPath;

			cache.banner = bannerURL;
			setBanner(bannerURL);
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
			});

		reader
			.getField('schedule.json')
			// @ts-ignore
			.then((_schedule: { time: number; location: string; name: string }[]) => {
				const mapped = _schedule.map((event) => {
					const time = new Date(event.time);
					const hours = time.getHours().toString();
					const minutes = time.getMinutes();

					return {
						timeLocation: hours + ':' + minutes + ' @ ' + event.location,
						name: event.name,
					};
				});

				// @ts-ignore
				cache.schedule = mapped;
				setSchedule(mapped);
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
			onLongPress={onLongPress}>
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
});

export default memo(LuganoWidget);
