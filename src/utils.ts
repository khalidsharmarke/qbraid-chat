import os from 'os';
import path from 'path';
import {
	DEFAULT_QBRAID_API_URL,
	DEFAULT_QBRAIDRC_FILEPATH,
	VSCODE_AGENT_BEHAVIOR_KEYNAME,
	VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME,
} from './constants';
import { isUserConfig, UserConfig } from './types';
import * as vscode from 'vscode';
import fs from 'fs/promises';
import { QBraidChatError, QBraidChatErrorTypes } from './errors';

/**
 * Resolves the QBraidRC file path, expanding '~' to the home directory if necessary.
 * @param filePath - The file path to resolve.
 * @returns The resolved file path.
 */
export function resolveQBraidRCFilePath(filePath: string) {
	if (filePath) {
		if (filePath[0] === '~') {
			return path.join(os.homedir(), filePath.slice(1));
		} else {
			return path.resolve(__dirname, filePath);
		}
	} else {
		return path.join(os.homedir(), DEFAULT_QBRAIDRC_FILEPATH.slice(1));
	}
}

/**
 * Reads the user configuration from a file.
 * @param filePath - The path to the configuration file.
 * @returns A promise that resolves to the user configuration, or undefined if the file is not found.
 * @throws QBraidChatError if the configuration format is invalid.
 */
async function getUserConfigFromFile(filePath: string): Promise<UserConfig | undefined> {
	filePath = resolveQBraidRCFilePath(filePath);
	const settings = await fs.readFile(filePath, { encoding: 'utf8' });
	const config: Partial<UserConfig> = {};
	for (const line of settings.split('\n')) {
		const lineToParts = line.split('=').map(str => str.trim());
		if (lineToParts[0] === 'api-key') {
			if (lineToParts.length !== 2) {
				throw new QBraidChatError(QBraidChatErrorTypes.BadUserConfigFormat);
			} else {
				config.apiKey = lineToParts[1];
			}
		}

		if (lineToParts[0] === 'url') {
			if (lineToParts.length !== 2) {
				throw new QBraidChatError(QBraidChatErrorTypes.BadUserConfigFormat);
			} else {
				config.apiUrl = lineToParts[1];
			}
		}
	}
	if (!isUserConfig(config)) {
		throw new QBraidChatError(QBraidChatErrorTypes.BadUserConfigFormat);
	} else {
		return config as UserConfig;
	}
}

/**
 * Saves the API key to the specified configuration file.
 * @param key - The API key to save.
 * @param filePath - The path to the configuration file.
 * @returns A promise that resolves when the key is saved.
 * @throws QBraidChatError if the file path is invalid.
 */
async function saveAPIKeyToFile(key: string, filePath: string) {
	const configFilePath = resolveQBraidRCFilePath(filePath);
	if (!(await fs.stat(configFilePath)).isFile()) {
		throw new QBraidChatError(
			QBraidChatErrorTypes.InvalidConfigFilePath,
			`currpath: ${configFilePath}`
		);
	}

	const config = `[default]
url = ${DEFAULT_QBRAID_API_URL}
api-key = ${key}`;
	await fs.writeFile(configFilePath, config);
}

/**
 * Prompts the user to enter their API key.
 * @returns A promise that resolves to the entered API key, or undefined if no key was entered.
 */
async function getAPIKeyFromPrompt(): Promise<string | undefined> {
	const key = await vscode.window.showInputBox({
		title: 'QBraid Api Key',
		placeHolder: 'Your Api Key',
		prompt: 'Api Key',
		password: true,
	});
	return key;
}

/**
 * Prompts the user to set the path to the QBraidRC file and updates the workspace state.
 * @param context - The VS Code extension context.
 * @returns A promise that resolves when the path is set.
 */
export async function setQBraidRCPath(context: vscode.ExtensionContext) {
	const filePath = await vscode.window.showInputBox({
		title: 'QBraidRc Path',
		prompt: 'Path To QBraidRc File',
		placeHolder: '/Path/To/QBraidRc/File',
	});

	if (!filePath) {
		process.exit(1);
	}
	context.workspaceState.update(VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME, filePath);
}

/**
 * Prompts the user to enter their API key and saves it to the configuration file.
 * @param context - The VS Code extension context.
 * @returns A promise that resolves when the key is saved.
 */
export async function setAPIKey(context: vscode.ExtensionContext) {
	const key = await getAPIKeyFromPrompt();
	if (!key) {
		return;
	}

	const configPath = context.workspaceState.get(
		VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME,
		DEFAULT_QBRAIDRC_FILEPATH
	);
	await saveAPIKeyToFile(key, configPath);
}

/**
 * Retrieves the user configuration from the workspace state or prompts the user to enter their API key.
 * @param context - The VS Code extension context.
 * @returns A promise that resolves to the user configuration.
 */
export async function getUserConfig(context: vscode.ExtensionContext): Promise<UserConfig> {
	const configPath = context.workspaceState.get(
		VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME,
		DEFAULT_QBRAIDRC_FILEPATH
	);
	const config = await getUserConfigFromFile(configPath);

	if (!config) {
		const apiKey = await getAPIKeyFromPrompt();
		if (!apiKey) {
			context.workspaceState.update(VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME, undefined);
			process.exit(1);
		}
		await saveAPIKeyToFile(apiKey, configPath);
		return {
			apiUrl: DEFAULT_QBRAID_API_URL,
			apiKey,
		};
	} else {
		return config;
	}
}

/**
 * Checks if the agent behavior is enabled in the global context.
 * @param context - The VS Code extension context.
 * @returns True if the agent behavior is enabled, false otherwise.
 */
export function checkAgentBehaviorEnabled(context: vscode.ExtensionContext): boolean {
	return context.globalState.get(VSCODE_AGENT_BEHAVIOR_KEYNAME, false);
}
