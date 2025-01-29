import * as vscode from 'vscode';
import { ChatModel } from './types';
import { createChatWindow } from './components';
import {
	VSCODE_AGENT_BEHAVIOR_KEYNAME,
	VSCODE_STORAGE_QBRAID_CHAT_MODEL_KEYNAME,
} from './constants';
import { getChatModels } from './services';
import { checkAgentBehaviorEnabled } from './utils';

/**
 * Enum for command identifiers.
 */
export const enum Commands {
	SetAPIKey = 'qbraid-chat.setAPIKey',
	SetQBraidRCPath = 'qbraid-chat.setQBraidRCPath',
	SelectChatModel = 'qbraid-chat.selectChatModel',
	StartChat = 'qbraid-chat.startChat',
	SwitchAgentBehavior = 'qbraid-chat.switchAgentBehavior',
}

/**
 * Toggles the agent behavior state in the global context.
 * @param context - The VS Code extension context.
 * @returns A promise that resolves when the state is updated.
 */
export async function switchAgentBehavior(context: vscode.ExtensionContext): Promise<boolean> {
	const isEnabled = checkAgentBehaviorEnabled(context);
	await context.globalState.update(VSCODE_AGENT_BEHAVIOR_KEYNAME, !isEnabled);
	return !isEnabled;
}

/**
 * Starts a chat window with the specified chat model.
 * @param context - The VS Code extension context.
 * @param model - The chat model to use.
 * @returns The created chat window.
 */
export function startChat(context: vscode.ExtensionContext, model: ChatModel) {
	const chat = createChatWindow(context, model);
	return chat;
}

/**
 * Sets the chat model in the workspace state.
 * @param context - The VS Code extension context.
 * @param model - The chat model to set.
 * @returns A promise that resolves when the state is updated.
 */
export async function setChatModel(context: vscode.ExtensionContext, model: ChatModel) {
	await context.workspaceState.update(VSCODE_STORAGE_QBRAID_CHAT_MODEL_KEYNAME, model);
}

/**
 * Prompts the user to select a chat model from a list of available models.
 * @param context - The VS Code extension context.
 * @returns A promise that resolves to the selected chat model, or undefined if no model was selected.
 */
export async function selectChatModel(
	context: vscode.ExtensionContext
): Promise<ChatModel | undefined> {
	const models = await getChatModels(context);
	const selectedModel = await vscode.window.showQuickPick(
		models.map(model => model.model),
		{
			title: 'QBraid Chat Model',
			placeHolder: 'Select Chat Model',
			ignoreFocusOut: true,
		}
	);
	// If user fails to select a model, exit with no side effects
	if (!selectedModel) {
		return;
	}

	return models.find(({ model }) => model === selectedModel) || models[0];
}
