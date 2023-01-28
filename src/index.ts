import express  from 'express'
import dotenv  from "dotenv"
import {DatabaseObject} from "./database/DatabaseObject";
import {CitiesController} from "./database/Cities/CitiesController";
dotenv.config();

const router = express.Router();
const databaseObject = new DatabaseObject();

databaseObject.connect().then(()=>{
    console.log(`Connected to database '${process.env.PGDATABASE}' as user '${process.env.PGUSER}'` );
    const port = 3000

    const citiesController = new CitiesController(databaseObject);

    const app = express()
    app.use(express.json());

    citiesController.addRoutes(router);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.use('/api', router);
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
})



