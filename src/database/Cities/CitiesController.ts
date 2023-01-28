
import {Express, Router} from "express";
import {CitiesRepository} from "./CitiesRepository";
import {DatabaseObject} from "../DatabaseObject";
import {Cities} from "./Cities";


class CitiesController {
    private pointOfInterestRepository: CitiesRepository;

    constructor(databaseObject: DatabaseObject) {
        this.pointOfInterestRepository = new CitiesRepository(databaseObject);
    }

    static POISAsCollection = (pois: Cities[])=>(
        {
        type: "FeatureCollection",
        features :pois.map(poi=>CitiesController.PoiAsFeature(poi))
    })

    static PoiAsFeature = (poi: Cities) => (
        {
            id: poi.getId(),
            type: "Feature",
            properties: {
                name: poi.getName(),
                description: poi.getDescription(),
                population: poi.getPopulation()
            },
            geometry: JSON.parse(poi.getGeometry() as string)
        })

    addRoutes(app: Router) {

        app.post("/cities", ((req, res) => {
            const pointOfInterest = new Cities();
            pointOfInterest.setName(req.body.name);
            pointOfInterest.setDescription(req.body.description);
            pointOfInterest.setPopulation(req.body.population);
            pointOfInterest.setGeometry(req.body.geometry);
            this.pointOfInterestRepository.add(pointOfInterest).then((id: number)=>{
                res.status(200);
                res.json(id);
            }).catch((err)=>{
                res.status(409);
                res.json([]);
            });
        }))

        app.get("/cities", ((req, res) => {
            let search = req.query.search ? req.query.search as string : "";
            let limit = typeof req.query.limit !== "undefined" ? Number(req.query.limit) : undefined;
            this.pointOfInterestRepository.queryLike({search, limit}).then((pois) => {
                let format = req.query.f;
                if (format==="geojson") {
                    res.json(CitiesController.POISAsCollection(pois));
                } else {
                    res.json(pois);
                }


            }).catch(()=>{
                res.status(500);
                res.json([])
            })
        }))

        app.get("/citiesSpatial", ((req, res) => {
            let search = req.query.search ? req.query.search as string : "";
            let limit = typeof req.query.limit !== "undefined" ? Number(req.query.limit) : undefined;
            let bbox = req.query.bbox ? (req.query.bbox as string).split(",").map(s=>Number(s)) : [-180, -90, 180, 90];
            this.pointOfInterestRepository.querySpatial({search, bbox, limit}).then((pois) => {
                let format = req.query.f;
                if (format==="geojson") {
                    res.json(CitiesController.POISAsCollection(pois));
                } else {
                    res.json(pois);
                }
            }).catch(()=>{
                res.status(500);
                res.json([])
            })
        }))

        app.get("/cities/:id", ((req, res) => {
            const id = Number(req.params.id);
            this.pointOfInterestRepository.get(id).then((poi) => {
                let format = req.query.f;
                if (format==="geojson") {
                    const feature = CitiesController.PoiAsFeature(poi)
                    res.json(feature)
                } else {
                    res.json(poi)
                }
            }, (code: number)=>{
                res.status(code);
                res.json({error: code})
            })
        }))

        app.delete("/cities/:id", ((req, res) => {
            const id = Number(req.params.id);
            this.pointOfInterestRepository.delete(id).then((success) => {
                res.status(200);
                res.json(success)
            }, (code: number)=>{
                res.status(code);
                res.json({error: code})
            })
        }))

        app.delete("/citiesClear", ((req, res) => {
            this.pointOfInterestRepository.deleteAll().then((success) => {
                res.status(200);
                res.json(success)
            }, (code: number)=>{
                res.status(code);
                res.json({error: code})
            })
        }))

        app.put("/cities", ((req, res) => {
            const poi = new Cities();
            poi.setId(req.body.id);
            poi.setName(req.body.name);
            poi.setDescription(req.body.description);
            poi.setPopulation(req.body.population);
            poi.setGeometry(req.body.geometry);
            this.pointOfInterestRepository.replace(poi).then((id: number|string)=>{
                res.status(200);
                res.json(id);
            }, (code)=>{
                res.status(409);
                res.json({error: code});
            } );
        }))

        app.patch("/cities", ((req, res) => {
            const poi = new Cities();
            poi.setId(req.body.id);
            poi.setName(req.body.name);
            poi.setDescription(req.body.description);
            poi.setPopulation(req.body.population);
            poi.setGeometry(req.body.geometry);
            this.pointOfInterestRepository.update(poi).then((id: number|string)=>{
                res.status(200);
                res.json(id);
            }, (code)=>{
                res.status(409);
                res.json({error: code});
            } );
        }))

    }
}

export {
    CitiesController
}