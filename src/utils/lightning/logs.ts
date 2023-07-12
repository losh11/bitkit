import RNFS, { copyFile, exists, mkdir, unlink } from 'react-native-fs';
import lm from '@synonymdev/react-native-ldk';
import { zip } from 'react-native-zip-archive';
import { err, ok, Result } from '@synonymdev/result';

/**
 * Zips up the newest LDK logs and returns base64 of zip file
 * @param {number} limit
 * @param {boolean} allAccounts
 */
export const zipLogs = async ({
	limit = 10,
	includeJson = false,
	allAccounts = false,
}: {
	limit?: number;
	includeJson?: boolean;
	allAccounts?: boolean;
} = {}): Promise<Result<string>> => {
	const time = new Date().getTime();
	const logFilePrefix = 'bitkit_ldk_logs';
	const ldkPath = `${RNFS.DocumentDirectoryPath}/ldk`;
	const tempPath = `${RNFS.DocumentDirectoryPath}/bitkit_temp`;
	const zipFileName = `${logFilePrefix}_${time}`;
	const zipPath = `${tempPath}/${zipFileName}.zip`;

	try {
		// Create temporary folder
		await rm(tempPath);
		await mkdir(`${tempPath}/${zipFileName}`);

		const accounts = await listLogs({
			path: ldkPath,
			limit,
			includeJson,
			accountName: allAccounts ? undefined : lm.account.name,
		});

		// Copy files to temporary folder to be zipped
		for (const account of accounts) {
			// Make a subfolder for each account
			const accountFolder = `${tempPath}/${zipFileName}/${account.id}`;
			await mkdir(accountFolder);

			// Copy each log file to the account folder
			for (const filePath of account.files) {
				const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
				await copyFile(filePath, `${accountFolder}/${fileName}`);
			}
		}

		// Zip up files
		const result = await zip(tempPath, zipPath);

		return ok(result);
	} catch (error) {
		return err(error);
	}
};

/**
 * Lists .log files for all LDK accounts sorted by newest first
 * @param {string} path
 * @param {number} limit
 * @param {string} [accountName]
 * @param {boolean} [includeJson]
 */
const listLogs = async ({
	path,
	limit,
	includeJson = false,
	accountName,
}: {
	path: string;
	limit: number;
	includeJson?: boolean;
	accountName?: string;
}): Promise<{ id: string; files: string[] }[]> => {
	const ldkPathItems = await RNFS.readDir(path);
	const filter = accountName ?? 'account';
	const accounts = ldkPathItems.filter((item) => item.path.endsWith(filter));

	const promises = accounts.map(async (account) => {
		const logFiles = await listLogsForAccount(`${account.path}/logs`, limit);
		const jsonFiles = includeJson
			? await listJsonFilesForAccount(account.path)
			: [];
		const files = [...logFiles, ...jsonFiles];
		return { id: account.name, files };
	});

	return Promise.all(promises);
};

/**
 * Lists .log files for an LDK account sorted by newest first
 * @param path
 * @param limit
 * @returns {Promise<string[]>}
 */
const listLogsForAccount = async (
	path: string,
	limit: number,
): Promise<string[]> => {
	if (!(await exists(path))) {
		return [];
	}

	let list = await RNFS.readDir(path);

	// Filter for log files only
	list = list.filter((f) => {
		return f.isFile() && f.name.indexOf('.log') > -1 && f.size > 0;
	});

	// Newest first
	list.sort((a, b) => {
		return (
			(b.mtime ?? new Date()).getTime() - (a.mtime ?? new Date()).getTime()
		);
	});

	// Limit number of files
	return list.slice(0, limit).map((f) => f.path);
};

/**
 * Lists .json files in a given directory
 * @param path
 * @returns {Promise<string[]>}
 */
const listJsonFilesForAccount = async (path: string): Promise<string[]> => {
	let list = await RNFS.readDir(path);

	// Filter for .json files only
	list = list.filter((f) => {
		return f.isFile() && f.name.endsWith('json') && f.size > 0;
	});

	return list.map((f) => f.path);
};

/**
 * Deletes a file or dir and ignores any errors
 * @param path
 * @returns {Promise<void>}
 */
const rm = async (path: string): Promise<void> => {
	try {
		if (await exists(path)) {
			await unlink(path);
		}
	} catch (e) {}
};
