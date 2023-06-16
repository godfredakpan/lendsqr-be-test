# lendsqr-app
## Test for backend engineering candidate: Godfred Akpan

*Getting Started*

To get started with the Wallet App API, follow the instructions below.

### Prerequisites
<li>Node.js v16.17.0 above
<li>MySQL database

### Installation

<li>Clone repository: 

<code> git clone https://github.com/godfredakpan/lendsqr-be-test </code>

<li>Install the dependencies:

<code> cd lendsqr-be-test</code><br>
<code> npm install || yarn install</code>


<li>Setup database:

Create a MySQL database.<br>
Update the database connection details in the `config/db.js` file.

<li>Set up environment variables:

Create a `.env` file in the project root directory.

Define the required environment variables in the `.env` file. 

For example:
<code>
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-db-password
DB_DATABASE=wallet_db
</code>

<li>Start the API server:

`npm start || yarn start`

The API server will be running at http://localhost:3000

##
## API Documentation

User Accounts

#### Create an Account

URL: `/api/accounts/create`

Method: `POST`

Request Body: `{ "id": "user123" }`

Response: `{ "message": "Account created successfully"
}`

------

#### Create an Account

URL: `/api/accounts/create`

Method: `POST`

Request Body: `{ "id": "user123" }`

Response: `{ "message": "Account created successfully"
}`

------
#### Create an Account

URL: `/api/accounts/create`

Method: `POST`

Request Body: `{ "id": "user123" }`

Response: `{ "message": "Account created successfully"
}`

------

#### Create an Account

URL: `/api/accounts/create`

Method: `POST`

Request Body: `{ "id": "user123" }`

Response: `{ "message": "Account created successfully"
}`

------
