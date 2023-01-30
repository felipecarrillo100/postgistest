import { Client }  from "pg"

class PostgresDatabase {
    private _dbClient: Client;

    constructor() {
        this._dbClient = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT)
        })

    }

    async connect() {
        return this._dbClient.connect();
    }

    destroy() {
        this._dbClient.end();
    }


    get dbClient(): Client {
        return this._dbClient;
    }

    set dbClient(value: Client) {
        this._dbClient = value;
    }
}

export {
    PostgresDatabase
}