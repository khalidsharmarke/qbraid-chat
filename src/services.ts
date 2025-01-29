import * as vscode from 'vscode';
import { QBraidChatError, QBraidChatErrorTypes } from './errors';
import {
	ChatModel,
	ChatAPIJsonResponseBody,
	ChatAPIRequestBody,
	isChatAPIJsonResponseBody,
	areChatModels,
	isGetQuantumJobsResponse,
	GetQuantumJobsResponse,
	AreQuantumDevices,
	QuantumDevice,
} from './types';
import { getUserConfig } from './utils';

/**
 * Enum representing the various services used in the QBraidAPI
 */
export enum Services {
	Devices = 'Devices',
	Jobs = 'Jobs',
	Models = 'Models',
}
/**
 * Enum representing the various service endpoints used in the QBraid API.
 */
enum ServiceEndpoints {
	Devices = '/quantum-devices',
	Jobs = '/quantum-jobs',
	Chat = '/chat',
}

/**
 * Enum representing the sub-endpoints for the Jobs service.
 */
enum JobsServiceEndpoint {
	Cancel = '/cancel',
}

/**
 * Enum representing the sub-endpoints for the Chat service.
 */
enum ChatServiceEndpoint {
	GetModels = '/models',
}

/**
 * Type representing a general endpoint, which can be either a main service endpoint or a sub-endpoint.
 */
type Endpoint = ServiceEndpoints | ServiceSubEndpoint;

/**
 * Type representing a sub-endpoint, which can be either a Jobs service sub-endpoint or a Chat service sub-endpoint.
 */
type ServiceSubEndpoint = JobsServiceEndpoint | ChatServiceEndpoint;

/**
 * Joins a main service endpoint with one or more sub-endpoints to form a complete endpoint.
 *
 * @param service - The main service endpoint.
 * @param partials - One or more sub-endpoints to be appended to the main service endpoint.
 * @returns The combined endpoint as a string.
 */
function joinEndpoints(service: ServiceEndpoints, ...partials: ServiceSubEndpoint[]): Endpoint {
	return (service + partials.join('')) as Endpoint;
}

/**
 * Enum representing the various HTTP methods used in service requests.
 */
enum ServiceRequestMethods {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
}

/**
 * Type representing a service request.
 */
type ServiceRequest = {
	apiUrl: string;
	apiKey?: string;
	details: ServiceRequestDetails;
};

/**
 * Interface representing the details of a service request.
 */
export interface ServiceRequestDetails {
	endpoint: Endpoint;
	queryparam?: string;
	method: ServiceRequestMethods;
	// any additional headers to pass on to the fetch request
	headers?: RequestInit;
	// checks whether the response type is the expected format
	checkResponseType(response: any): boolean;
}

/**
 * Class representing a request to get quantum devices.
 */
export class GetQuantumDevicesRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Devices;
	queryparam?: string;
	method: ServiceRequestMethods = ServiceRequestMethods.GET;
	checkResponseType(response: any): boolean {
		return AreQuantumDevices(response);
	}
	constructor(queryparam?: string) {
		this.queryparam = queryparam;
	}
}

/**
 * Class representing a request to get quantum jobs.
 */
export class GetQuantumJobsRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Jobs;
	method: ServiceRequestMethods = ServiceRequestMethods.GET;
	checkResponseType(response: any): boolean {
		return isGetQuantumJobsResponse(response);
	}
}

/**
 * Class representing a request to create a quantum job.
 */
export class CreateQuantumJobRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Jobs;
	method: ServiceRequestMethods = ServiceRequestMethods.POST;
	// TODO: implement once agent can process how the make such a request
	checkResponseType(): boolean {
		return true;
	}
}

/**
 * Class representing a request to cancel a quantum job.
 */
export class CancelQuantumJobRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Jobs;
	queryparam: string;
	method: ServiceRequestMethods = ServiceRequestMethods.PUT;
	// TODO: implement once agent can process how the make such a request
	checkResponseType(): boolean {
		return true;
	}

	constructor(queryparam: string) {
		this.queryparam = queryparam;
	}
}

/**
 * Class representing a request to delete a quantum job.
 */
export class DeleteQuantumJobRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Jobs;
	method: ServiceRequestMethods = ServiceRequestMethods.DELETE;
	// TODO: implement once agent can process how the make such a request
	checkResponseType(): boolean {
		return true;
	}
}

/**
 * Class representing a request to send a chat message.
 */
export class SendChatRequest implements ServiceRequestDetails {
	endpoint: Endpoint = ServiceEndpoints.Chat;
	method: ServiceRequestMethods = ServiceRequestMethods.POST;
	checkResponseType(response: any): boolean {
		return isChatAPIJsonResponseBody(response);
	}
}

/**
 * Class representing a request to get chat models.
 */
export class GetChatModelsRequest implements ServiceRequestDetails {
	endpoint: Endpoint = joinEndpoints(ServiceEndpoints.Chat, ChatServiceEndpoint.GetModels);
	method: ServiceRequestMethods = ServiceRequestMethods.GET;
	checkResponseType(response: any): boolean {
		return areChatModels(response);
	}
}

/**
 * Makes a service request using the provided request details and options.
 *
 * @param request - The service request to be made.
 * @param options - Optional additional options for the fetch request.
 * @returns A promise that resolves to the response of the fetch request.
 */
export async function makeServiceRequest<ApiResponse>(
	request: ServiceRequest,
	options?: RequestInit
): Promise<ApiResponse> {
	const res = await fetch(request.apiUrl + request.details.endpoint, {
		method: request.details.method,
		headers: {
			'api-key': request.apiKey || '',
			'content-type': 'application/json',
		},
		...options,
	});
	const body = await res.json();

	if (!request.details.checkResponseType(body)) {
		throw new QBraidChatError(QBraidChatErrorTypes.BadAPIResponseFormat, request.details.endpoint);
	} else {
		return body;
	}
}

/**
 * Sends a message to the chat API and retrieves the response.
 *
 * @param context - The extension context provided by VSCode.
 * @param message - The user's message to be sent to the chat API.
 * @param model - The current chat model to be used in the chat API request.
 * @returns A promise that resolves to the chat API's JSON response body.
 *
 * The function performs the following steps:
 * 1. Retrieves the current chat model using the `getChatModel` function.
 * 2. Retrieves the user's API key and API URL from the user configuration using the `getUserConfig` function.
 * 3. Constructs the chat API endpoint URL.
 * 4. Creates a request body with the user's message, the current chat model, and sets the stream option to false.
 * 5. Sends a POST request to the chat API endpoint with the constructed request body.
 * 6. Returns the JSON response body from the chat API.
 */
export async function getChatAPIResponse(
	context: vscode.ExtensionContext,
	{ model }: ChatModel,
	message: string
): Promise<ChatAPIJsonResponseBody> {
	const { apiKey, apiUrl } = await getUserConfig(context);
	const requestBody: ChatAPIRequestBody = {
		prompt: message,
		model,
		stream: false,
	};
	return await makeServiceRequest(
		{
			apiUrl,
			apiKey,
			details: new SendChatRequest(),
		},
		{
			body: JSON.stringify(requestBody),
		}
	);
}

/**
 * Fetches the available chat models from QBraid API
 *
 * @param context - The extension context provided by VSCode.
 * @returns A promise that resolves to the chatmodels
 *
 */
export async function getChatModels(context: vscode.ExtensionContext): Promise<ChatModel[]> {
	const { apiKey, apiUrl } = await getUserConfig(context);
	return await makeServiceRequest({
		apiUrl,
		apiKey,
		details: new GetChatModelsRequest(),
	});
}

/**
 * Fetches the user's quantum jobs from QBraid API
 *
 * @param context - The extension context provided by VSCode.
 * @returns A promise that resolves to the quantum jobs
 *
 */
export async function getQuantumJobs(
	context: vscode.ExtensionContext
): Promise<GetQuantumJobsResponse> {
	const { apiKey, apiUrl } = await getUserConfig(context);
	return await makeServiceRequest({
		apiUrl,
		apiKey,
		details: new GetQuantumJobsRequest(),
	});
}

/**
 * Fetches the available quantum devices from QBraid API
 *
 * @param context - The extension context provided by VSCode.
 * @returns A promise that resolves to the quantum devices
 *
 */
export async function getQuantumDevices(
	context: vscode.ExtensionContext
): Promise<QuantumDevice[]> {
	const { apiKey, apiUrl } = await getUserConfig(context);
	return await makeServiceRequest({
		apiUrl,
		apiKey,
		details: new GetQuantumDevicesRequest(),
	});
}
