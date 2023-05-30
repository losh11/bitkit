import Toast, { ToastPosition } from 'react-native-toast-message';
import { __E2E__ } from '../constants/env';

type AppNotification = {
	title?: string;
	message: string;
	autoHide?: boolean;
	visibilityTime?: number;
	topOffset?: number;
	bottomOffset?: number;
};

const defaultOptions = {
	autoHide: true,
	visibilityTime: 4000,
	topOffset: 40,
	bottomOffset: 120,
};

export const showErrorNotification = (
	{
		title = 'Something went wrong',
		message = ' ', // Toast.show fails if we accidentally provide an empty string
		...options
	}: AppNotification,
	position: ToastPosition = 'top',
): void => {
	if (__E2E__) {
		return;
	}

	Toast.show({
		type: 'error',
		text1: title,
		text2: message,
		...defaultOptions,
		...options,
		position,
	});
};

export const showSuccessNotification = (
	{ title = 'Success!', message, ...options }: AppNotification,
	position: ToastPosition = 'top',
): void => {
	if (__E2E__) {
		return;
	}

	Toast.show({
		type: 'success',
		text1: title,
		text2: message,
		...defaultOptions,
		...options,
		position,
	});
};

export const showInfoNotification = (
	{ title = '', message, ...options }: AppNotification,
	position: ToastPosition = 'top',
): void => {
	if (__E2E__) {
		return;
	}

	Toast.show({
		type: 'info',
		text1: title,
		text2: message,
		...defaultOptions,
		...options,
		position,
	});
};
