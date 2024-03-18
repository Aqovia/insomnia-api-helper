# Insomnia API Helper

A library for using an Insomnia API design document's requests within JavaScript, e.g. for testing

## Using The Library

### Create An API Instance
1. Export your Insomnia API design document as an Insomnia v4 JSON file
2. Import/parse the JSON file into your project as an object
3. Construct an instance of the API using:
```javascript
const myApi = new InsomniaApi(jsonApiObject, optionalNameOfEnvironmentToUse);
```
An instance will be created with all environment variables instantiated as per your selected environment.

### Environment Variables
When making requests, environment variable placeholders in the request will automatically be populated, as per your selected environment.
Environment variables can be accessed (and changed) via the `myApi.envVars` object.

You can also call `myApi.setEnvironment(environmentName)` to refresh all environment variables as per the specified environment.

### Auth
If required, set an OAuth2 token on the API, which will be used in all requests:
```javascript
myApi.setAuthToken(myAuthToken);
```

### Requests

####
Create an instance of a request that is defined in your design document by its name, and modify it as required:
```javascript
const updateRequest = myApi.getRequestByName("Update User By ID");
```

#### Set Path Parameters
```javascript
updateRequest.pathParameters["id"] = "101";
```

#### Set Query Parameters
```javascript
updateRequest.queryParameters["someQueryParameter"] = "value";
```

#### Set Body
```javascript
updateRequest.body = {
  firstName: "John",
  lastName: "Smith",
  email: "johnsmith@mydomain.com"
};
```

#### Send Request
```javascript
const response = await updateRequest.send();
```
Note. This makes and returns a `fetch` request/response.



## Example Usage

```javascript
import { InsomniaApi } from "@aqovia/insomnia-api-helper";
import usersApiDesignDocument from "./users-api.json" assert { type: "json" }; // an exported Insomnia v4 JSON design document
import { expect } from "chai";

describe("Users API", function () {
  const environment = process.env.SELECTED_ENVIRONMENT || "Test";
  const usersApi = new InsomniaApi(usersApiDesignDocument, environment);

  before(async function () {
    const authToken = await getAuthToken( // your own custom logic to retrieve an auth token
      usersApi.envVars["tokenUrl"],
      usersApi.envVars["clientId"],
      usersApi.envVars["clientSecret"]
    );

    usersApi.setAuthToken(authToken);
  });

  let newUser;

  it("should create a user", async function () {
    newUser = {
      email: "newuser@mydomain.com",
      firstName: "John",
      lastName: "Smith",
      phone: "12345",
    };

    const createUserRequest = usersApi.getRequestByName("Create A User");
    createUserRequest.body = { ...createUserRequest.body, ...newUser };
    
    const createUserResponse = await createUserRequest.send();
    expect(createUserResponse.status).to.equal(201);

    const createUserResponseBody = await createUserResponse.json();
    expect(createUserResponseBody).to.have.property("id");
    
    newUser.id = createUserResponseBody.id;
  });

  it("should retrieve a user by ID", async function () {
    const getUserRequest = usersApi.getRequestByName("Get User By ID");
    getUserRequest.pathParameters.id = newUser.id;
    
    const getUserResponse = await getUserRequest.send();
    expect(getUserResponse.status).to.equal(200);

    const getUserResponseBody = await getUserResponse.json();
    expect(getUserResponseBody.email).to.equal(newUser.email);
  });
});
```
