import {DatabaseObject} from "../DatabaseObject";
import {Cities} from "./Cities";
import {Client} from "pg";

const TableName = "poi";

const sqlCreateTable =
    `CREATE TABLE IF NOT EXISTS ${TableName} (` +
    "   id BIGSERIAL PRIMARY KEY," +
    "   name VARCHAR(128) NOT NULL ," +
    "   description VARCHAR(1024) ," +
    "   population integer ," +
    "   geom geometry(Point,4326) " +
    ");"  +
    `CREATE INDEX IF NOT EXISTS sidx_${TableName}_geom` +
    `    ON ${TableName} USING gist (geom)` +
    "    TABLESPACE pg_default;"

const SelectedColumns = "id, name, description, population, ST_AsGeoJSON(geom) as geometry";
const sqlInsert = `INSERT INTO ${TableName} ("name", "description", "population", "geom") VALUES($1, $2, $3, ST_GeomFromGeoJSON($4)) returning *;`
const sqlSelectByID = `SELECT ${SelectedColumns} FROM ${TableName} WHERE id=$1;`
const sqlDeleteByID = `DELETE FROM ${TableName} WHERE id=$1;`
const sqlDeleteAll = `DELETE FROM ${TableName};`
const sqlSelectByText = `SELECT ${SelectedColumns} FROM ${TableName} WHERE "name" LIKE $1 OR "description" LIKE $1 LIMIT $2`
const sqlSelectByGeometry = `SELECT ${SelectedColumns} FROM ${TableName} WHERE geom && ST_MakeEnvelope($2, $3, $4, $5, 4326) AND ("name" LIKE $1 OR "description" LIKE $1) limit $6`


const sqlPatchByID = `UPDATE ${TableName} SET name=$2, description=$3, population=$4, geom=ST_GeomFromGeoJSON($5) WHERE id=$1`;
const sqlUpdateOrInsert = `INSERT INTO ${TableName} (id, name, description, population, geom) values ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))` +
    ` ON CONFLICT ("id") DO ` + `UPDATE SET name=$2, description=$3, population=$4, geom=ST_GeomFromGeoJSON($5)`;

class CitiesRepository {
    private db: Client;

    constructor(databaseObject:DatabaseObject) {
        this.db = databaseObject.db;
        this.init();
    }

    private init() {
        this.createTable();
    }

    private createTable() {
        const stmt = this.db.query(sqlCreateTable);
        stmt.then(()=>{
            console.log(`Table ${TableName} created`)
            },
            (err)=>{
            if (err) console.error(err);
        })
    }

    public add(pointsOfInterest: Cities) {
        return new Promise<number>((resolve, reject)=>{
            const entry = this.db.query(sqlInsert, [
                pointsOfInterest.getName(), pointsOfInterest.getDescription(),
                pointsOfInterest.getPopulation(), pointsOfInterest.getGeometry()
            ])
            entry.then((result)=>{
                resolve(Number(result.rows[0].id));
            },(err)=>{
                console.error(err);
                reject(500)
            });
        })
    }

    public get(pointOfInterestID: number) {
        return new Promise<Cities>((resolve, reject)=> {
            this.db.query(sqlSelectByID, [pointOfInterestID]).then((result)=>{
                if (result.rows.length>0) {
                    const row = result.rows[0];
                    const pointsOfInterest = new Cities();
                    pointsOfInterest.setId(row.id);
                    pointsOfInterest.setName(row.name);
                    pointsOfInterest.setDescription(row.description);
                    pointsOfInterest.setPopulation(row.population);
                    pointsOfInterest.setGeometry(row.geometry);
                    resolve(pointsOfInterest);
                } else {
                    reject(404);
                }
                },(err)=>{
                    reject(500);
                });
        })
    }

    public delete(PointOfInterestID: number) {
        return new Promise<boolean>((resolve, reject)=> {
            this.db.query(sqlDeleteByID, [PointOfInterestID]).then(()=>{
                resolve(true);
            },(err)=>{
                reject(500);
            });
        })
    }

    public deleteAll() {
        return new Promise<boolean>((resolve, reject)=> {
            this.db.query(sqlDeleteAll, []).then(()=>{
                resolve(true);
            },(err)=>{
                reject(500);
            });
        })
    }

    public queryLike(options: {search?: string; limit?: number}) {
        return new Promise<Cities[]>((resolve, reject)=> {
            const searchText = options.search ? `%${options.search}%` : "%%";
            const limit = typeof options.limit !== "undefined" ? options.limit : 100000;
            this.db.query(sqlSelectByText, [searchText, limit]).then((result)=>{
                const pointsOfInterests = result.rows.map(row => {
                    const pointsOfInterest = new Cities();
                    pointsOfInterest.setId(row.id);
                    pointsOfInterest.setName(row.name);
                    pointsOfInterest.setDescription(row.description);
                    pointsOfInterest.setPopulation(row.population);
                    pointsOfInterest.setGeometry(row.geometry);
                    return pointsOfInterest
                })
                resolve(pointsOfInterests);
            },(err)=>{
                console.log(err);
                reject(500);
                return;
            })
        })
    }

    public querySpatial(options: {search: string; bbox: number[], limit?: number}) {
        return new Promise<Cities[]>((resolve, reject)=> {
            const searchText = options.search ? `%${options.search}%` : "%%";
            const bbox  =  options.bbox;
            const limit = typeof options.limit !== "undefined" ? options.limit : 100000;
            this.db.query(sqlSelectByGeometry, [searchText, bbox[0], bbox[1], bbox[2], bbox[3], limit]).then((result)=>{
                const pointsOfInterests = result.rows.map(row => {
                    const pointsOfInterest = new Cities();
                    pointsOfInterest.setId(row.id);
                    pointsOfInterest.setName(row.name);
                    pointsOfInterest.setDescription(row.description);
                    pointsOfInterest.setPopulation(row.population);
                    pointsOfInterest.setGeometry(row.geometry);
                    return pointsOfInterest
                })
                resolve(pointsOfInterests);
            },(err)=>{
                console.log(err);
                reject(500);
                return;
            })
        })
    }

    public replace(pointsOfInterest: Cities) {
        return new Promise<number|string>((resolve, reject)=>{
            if (pointsOfInterest.getId()) {
                this.db.query(sqlPatchByID, [pointsOfInterest.getId(), pointsOfInterest.getName(),
                    pointsOfInterest.getDescription(), pointsOfInterest.getPopulation(), pointsOfInterest.getGeometry()]).then(
                    (result) => {
                        console.log(result);
                        if (result.rowCount>0) {
                            resolve(pointsOfInterest.getId() as any);
                        } else {
                            reject(400)
                        }
                    },
                    (err) => {
                        reject(500);
                    }
                )
            }
        })

    }

    public update(pointsOfInterest: Cities) {
        return new Promise<number|string>((resolve, reject)=> {
            if (pointsOfInterest.getId()) {
                this.get(pointsOfInterest.getId() as number).then((oldPointsOfInterest) => {
                    if (pointsOfInterest.getName()) oldPointsOfInterest.setName(pointsOfInterest.getName() as string);
                    if (pointsOfInterest.getDescription()) oldPointsOfInterest.setDescription(pointsOfInterest.getDescription() as string);
                    if (typeof pointsOfInterest.getPopulation() !== "undefined") oldPointsOfInterest.setPopulation(pointsOfInterest.getPopulation() as number);
                    if (pointsOfInterest.getGeometry()) oldPointsOfInterest.setGeometry(pointsOfInterest.getGeometry() as string);
                    this.db.query(sqlPatchByID, [oldPointsOfInterest.getId(), oldPointsOfInterest.getName(),
                        oldPointsOfInterest.getDescription(), oldPointsOfInterest.getPopulation(), oldPointsOfInterest.getGeometry()]).then(
                        (result) => {
                            if (result.rowCount > 0) {
                                resolve(pointsOfInterest.getId() as any);
                            } else {
                                reject(400)
                            }
                        },
                        (err) => {
                            console.log(err);
                            reject(500);
                        }
                    )
                })
            }})
    }


}

export { CitiesRepository }