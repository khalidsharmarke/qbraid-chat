import * as vscode from 'vscode';
import {
	getChatAPIResponse,
	getChatModels,
	getQuantumDevices,
	getQuantumJobs,
	Services,
} from './services';
import { ChatModel } from './types';
import { checkAgentBehaviorEnabled } from './utils';

const PromptPrefix = 'Does the following question have to do with Qbraid ';
const PromptSuffix = 'Answer with a simple yes or no.';

/**
 * Processes the user's request and determines which services are relevant to the request.
 * Is behind a flag set in the global state by the `switchAgentBehavior` command
 *
 * It achieves this by querying the chat model with the user's request and matching on relevant services
 * If there are any services relevant to the user's request, it'll respond with the service type's get method
 *
 * TODO: implement a way of querying for canceling/deleting jobs
 * not all service uses are covered
 *
 * @param context - The VS Code extension context.
 * @param model - The chat model to use for generating responses.
 * @param userRequest - The user's request as a string.
 * @returns A promise that resolves to a `ChatAPIJsonResponseBody` object containing the response from the relevant services or the original user request.
 */
export async function processUserRequest(
	context: vscode.ExtensionContext,
	model: ChatModel,
	userRequest: string
): Promise<string> {
	if (!checkAgentBehaviorEnabled(context)) {
		return (await getChatAPIResponse(context, model, userRequest)).content;
	}
	const requests = await Promise.all(
		Object.keys(Services).map(service => {
			return getChatAPIResponse(
				context,
				model,
				createPromptQuestion(service as Services, userRequest)
			).then(res => {
				if (res.content.toLowerCase().includes('yes')) {
					return service;
				} else {
					return undefined;
				}
			});
		})
	);
	const servicesToFetch = requests.filter(req => req !== undefined);

	if (servicesToFetch.length > 0) {
		const results = await Promise.all(
			servicesToFetch.map(async service => {
				let details;
				switch (service as Services) {
					case Services.Devices:
						details = await getQuantumDevices(context);
						break;
					case Services.Jobs:
						details = await getQuantumJobs(context);
						break;
					case Services.Models:
						details = await getChatModels(context);
						break;
				}
				return `Here are the details on your ${service} request: ${JSON.stringify(
					details
				).substring(0, 100)}...`;
			})
		);

		if (results.length > 1) {
			return `Here are the results of your query:\n${results.join('\n')}`;
		} else {
			return results[0];
		}
	} else {
		return (await getChatAPIResponse(context, model, userRequest)).content;
	}
}

/**
 * Creates a prompt for the QBRaid chat to parse
 *
 * @param service names the service to be checked
 * @param userinput the user's input message
 * @returns a prompt as a string
 */
function createPromptQuestion(service: Services, userinput: string): string {
	return PromptPrefix + service + ' API: ' + `"${userinput}". ` + PromptSuffix;
}
