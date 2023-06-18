# lendsqr-app
## Test for backend engineering candidate: Godfred Akpan

*Getting Started*

To get started with the Wallet App API, follow the instructions below.

### Prerequisites
<li>Node.js v16.17.0 above
<li>MySQL database
<li>KnexJs

### Installation

<li>Clone repository: 

<code> git clone https://github.com/godfredakpan/lendsqr-be-test </code>

<li>Install the dependencies:

<code> cd lendsqr-be-test</code><br>
<code> npm install || yarn install ...AND npm install knex -g</code>


<li>Setup database:

Create a MySQL database.<br>
Update the database connection details in the `config/db.js` file.<br>
Migrate DB by running <code>knex migrate:latest</code>

<img width="369" alt="image" src="https://github.com/godfredakpan/lendsqr-be-test/assets/31159357/d6007272-5e50-47b7-9cb8-a98ca3d85114">


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

https://documenter.getpostman.com/view/23218164/2s93sjT8N3
