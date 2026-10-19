import { createAccountApi } from './api/accountApi';

const apiUrl = process.env.NEXT_PUBLIC_BIRTHDAY_API_URL?.trim();

/**
 * The accounts client, or null when accounts can't be used: with no server (local mode) or a server on
 * another origin, where the login cookie wouldn't be sent. Whether the server itself has accounts
 * switched on is asked at run time, through `accountApi.session()`.
 */
export const accountApi = apiUrl?.startsWith('/') ? createAccountApi(apiUrl) : null;
