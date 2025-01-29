import * as vscode from 'vscode';
import {
	ChatModel,
	ChatToExtensionMessageType,
	ExtensionToChatMessageType,
	isChatToExtensionMessage,
} from '../types';
import html from '../chatwindow/index.html';
import { processUserRequest } from '../agenticbehavior';

/**
 * Creates a chatbox webview panel in the VSCode extension.
 *
 * @param context - The extension context provided by VSCode.
 * @param model - The chat model to be used in the chatbox.
 * @returns A promise that resolves to the created webview panel.
 *
 * The function sets up a webview panel with the specified properties and loads the HTML content.
 * It also sets up a message handler to process messages received from the webview.
 *
 * The message handler supports the following message types:
 * - `ChatToExtensionMessageType.UserMessage`: Sends the user's message to the chat API and posts the bot's response back to the webview.
 * - `ChatToExtensionMessageType.ChangeChatModel`: Executes a command to change the chat model.
 * - `ChatToExtensionMessageType.GetChatModel`: Retrieves the current chat model and posts it back to the webview.
 */
export async function createChatWindow(
	context: vscode.ExtensionContext,
	model: ChatModel
): Promise<vscode.WebviewPanel> {
	const panel = vscode.window.createWebviewPanel(
		'chatwindow',
		'QBraid Chat Bot',
		vscode.ViewColumn.Active,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [
				vscode.Uri.joinPath(context.extensionUri, '/dist'),
				vscode.Uri.joinPath(context.extensionUri, '/src'),
			],
		}
	);
	panel.webview.html = html;
	panel.webview.onDidReceiveMessage(
		async message => await handleMessageReceived(context, panel, message, model)
	);
	// await panel.webview.postMessage({ type: ExtensionToChatMessageType.ChatModel, content: model });
	// panel.onDidChangeViewState()
	return panel;
}

/**
 * Handles messages received from the webview.
 *
 * @param context - The extension context provided by VSCode.
 * @param panel - The webview panel that received the message.
 * @param message - The message received from the webview.
 * @param model - The chat model to be used in the chatbox.
 *
 * The function processes messages based on their type:
 * - `ChatToExtensionMessageType.UserMessage`: Sends the user's message to the chat API and posts the bot's response back to the webview.
 * - `ChatToExtensionMessageType.ChangeChatModel`: Executes a command to change the chat model.
 * - `ChatToExtensionMessageType.GetChatModel`: Retrieves the current chat model and posts it back to the webview.
 *
 * If the message type is not recognized, an error is logged.
 */
export async function handleMessageReceived(
	context: vscode.ExtensionContext,
	panel: vscode.WebviewPanel,
	message: any,
	model: ChatModel
) {
	if (!isChatToExtensionMessage(message)) {
		console.error("Received message that isn't a ChatToExtensionMessage", message);
		return;
	}

	switch (message.type) {
		case ChatToExtensionMessageType.UserMessage:
			if (message.content) {
				panel.webview.postMessage({ type: ExtensionToChatMessageType.BotThinking });
				await panel.webview.postMessage({
					type: ExtensionToChatMessageType.BotMessage,
					content: await processUserRequest(context, model, message.content),
				});
			}
			break;
		case ChatToExtensionMessageType.ChangeChatModel:
			vscode.commands.executeCommand('qbraid-chat.selectChatModel');
			break;
		case ChatToExtensionMessageType.GetChatModel:
			await panel.webview.postMessage({
				type: ExtensionToChatMessageType.ChatModel,
				content: model.model,
			});
			break;
	}
}
