import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BASE_URL } from '../utils/constants/common';

export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly base: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    // Keep BASE_URL normalized for safe URL concatenation.
    this.base = (BASE_URL).replace(/\/$/, '');
  }

  async createUser(payload: Record<string, unknown>): Promise<APIResponse> {
    const url = `${this.base}/api/users`;
    return this.request.post(url, { data: payload });
  }
}
