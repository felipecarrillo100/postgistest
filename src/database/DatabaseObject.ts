import { Client }  from "pg"

class DatabaseObject {
    private _db: Client;

    constructor() {
        this._db = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT)
        })

    }

    async connect() {
        return this._db.connect();
    }

    destroy() {
        this._db.end();
    }


    get db(): Client {
        return this._db;
    }

    set db(value: Client) {
        this._db = value;
    }
}

export {
    DatabaseObject
}