export class InsomniaRequest {
  method;
  url;
  pathParameters;
  queryParameters;
  headers;
  body;

  constructor(method, url, pathParameters, queryParameters, headers, body) {
    this.method = method;
    this.url = url;
    this.pathParameters = pathParameters;
    this.queryParameters = queryParameters;
    this.headers = headers;
    this.body = body;
  }

  send() {
    let url = this._populatePathParameters(this.url);

    if (Object.keys(this.queryParameters).length > 0)
      url += `?${Object.entries(this.queryParameters).map(([key, value]) => `${key}=${value}`).join('&')}`;

    const options = {
      method: this.method,
      headers: this.headers
    };

    if (typeof this.body === 'object' && this.body !== null && Object.keys(this.body).length > 0)
      options.body = JSON.stringify(this.body);

    return fetch(url, options);
  }

  _populatePathParameters(url) {
    const placeholderRegex = /:\w+(?=[\/?]|$)/g;

    return url.replace(placeholderRegex, (match) => {
      const key = match.slice(1);
      const replacement = this.pathParameters[key];
      return replacement !== undefined ? replacement : match;
    });
  }
}
