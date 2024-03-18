import { InsomniaRequest } from "./InsomniaRequest.js";

export class InsomniaApi {
  api;
  authToken;
  environment;
  envVars = {};

  constructor(api, environment = null) {
    this.api = api;
    this.setEnvironment(environment);
  }

  setEnvironment(environment) {
    this.environment = environment;
    this.envVars = this._getEnvironmentVariables(environment);
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getRequestByName(name) {
    const request = this.api.resources.find(_ => _._type === 'request' && _.name === name);

    if (!request)
      throw new Error(`Request with name ${name} not found`);

    const method = request.method;

    const url = this._populatePlaceholders(request.url);

    const pathParameters = request.pathParameters.reduce((acc, _) => {
      acc[_.name] = this._populatePlaceholders(_.value);
      return acc;
    }, {});

    const queryParameters = request.parameters.reduce((acc, _) => {
      acc[_.name] = this._populatePlaceholders(_.value);
      return acc;
    }, {});

    const headers = request.headers.reduce((acc, _) => {
      acc[_.name] = this._populatePlaceholders(_.value);
      return acc;
    }, {});

    if (this.authToken)
      headers['Authorization'] = `Bearer ${this.authToken}`;

    const requestBody = request.body.text ? JSON.parse(request.body.text) : {};
    const body = Object.entries(requestBody).reduce((acc, [key, value]) => {
      acc[key] = this._populatePlaceholders(value);
      return acc;
    }, {});

    return new InsomniaRequest(method, url, pathParameters, queryParameters, headers, body);
  }

  _getEnvironmentVariables(environment) {
    const environments = this.api.resources.filter(_ => _._type === 'environment');

    const baseEnvironment = environments.find(_ => _.parentId.startsWith('wrk_'));

    let environmentVariables = {
      ...baseEnvironment.data
    };

    if (environment) {
      const selectedEnvironment = environments.find(_ =>
        _.name.toLowerCase().trim() === environment.toLowerCase().trim());

      if (!selectedEnvironment)
        throw new Error(`Environment with name ${environment} not found`);

      environmentVariables = {
        ...environmentVariables,
        ...selectedEnvironment.data
      };
    }

    return environmentVariables;
  }

  _populatePlaceholders(template) {
    if (typeof template !== 'string')
      return template;

    const placeholderRegex = /{{\s*_\.\s*([^{}\s]+)\s*}}/g;

    return template.replace(placeholderRegex, (match, key) => {
      const replacement = this.envVars[key];
      return replacement !== undefined ? replacement : match;
    });
  }
}
