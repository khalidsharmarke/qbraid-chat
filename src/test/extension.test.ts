import * as assert from 'assert';
import * as vscode from 'vscode';
import { handleMessageReceived } from '../components/webview';
import { ChatToExtensionMessageType, ExtensionToChatMessageType } from '../types';
import { getChatAPIResponse } from '../services';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('handleMessageReceived should handle UserMessage', async () => {
		const context = {} as vscode.ExtensionContext;
		const panel = {
			webview: {
				postMessage: async (message: any) => {
					assert.strictEqual(message.type, ExtensionToChatMessageType.BotThinking);
				},
			},
		} as unknown as vscode.WebviewPanel;
		const message = {
			type: ChatToExtensionMessageType.UserMessage,
			content: 'Hello',
		};
		const model = {} as any;

		await handleMessageReceived(context, panel, message, model);
	});

	test('handleMessageReceived should handle ChangeChatModel', async () => {
		const context = {} as vscode.ExtensionContext;
		const panel = {
			webview: {
				postMessage: async (message: any) => {
					assert.strictEqual(message.type, ExtensionToChatMessageType.ChatModel);
				},
			},
		} as unknown as vscode.WebviewPanel;
		const message = {
			type: ChatToExtensionMessageType.ChangeChatModel,
			content: 'new-model',
		};
		const model = {} as any;

		await handleMessageReceived(context, panel, message, model);
	});

	test('handleMessageReceived should handle GetChatModel', async () => {
		const context = {} as vscode.ExtensionContext;
		const panel = {
			webview: {
				postMessage: async (message: any) => {
					assert.strictEqual(message.type, ExtensionToChatMessageType.ChatModel);
				},
			},
		} as unknown as vscode.WebviewPanel;
		const message = {
			type: ChatToExtensionMessageType.GetChatModel,
		};
		const model = {} as any;

		await handleMessageReceived(context, panel, message, model);
	});

	test('getChatAPIResponse should return a response', async () => {
		const context = {} as vscode.ExtensionContext;
		const message = 'Hello';
		const model = {} as any;
		const response = await getChatAPIResponse(context, model, message);
		assert.ok(response);
		assert.strictEqual(typeof response, 'object');
	});
});
