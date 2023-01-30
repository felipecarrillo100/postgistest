import {describe, expect, it} from '@jest/globals';
import  "isomorphic-fetch";
import * as fs from "fs";


const baseURL = "http://localhost:3000/api";

async function AddOne(city:{id: number, name:string; description: string; population: number; geometry: string;}) {
    const myHeaders = new Headers();
    const req = baseURL + "/cities"
    myHeaders.append("Content-Type", "application/json");
    const data = city;
    const response = await fetch(req, {  method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    });
    if (response.status===200) {
        const json = await response.json();
        if(json) {
            return json
        } else {
            return null
        }
    } else {
        return null;
    }
}

describe('Testing a simple postgis api ',   () => {

    let clearAll = baseURL+ "/citiesClear";
    it("Test DELETE All elements " + clearAll, async () => {
        req5 = baseURL+ "/cities/"+ ToDelete;
        const response = await fetch(clearAll, {
            method: 'DELETE',
            redirect: 'follow'
        });
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json).toBe(true);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    it("Add 100 elements", async () => {
        let rawdata = fs.readFileSync('testdata.json');
        let cities = JSON.parse(rawdata as any);
        const all = [];
        for(const city of cities) {
            all.push(await AddOne(city))
        }
        expect(all.length).toBe(100)
    })

    let ToDelete = null as (null|number);
    const reqCities = baseURL+ "/cities";
    it("Test POST " + reqCities, async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const data = {
            "name":"Paris",
            "description":"village",
            "population":500000,
            "geometry":"{\"type\":\"Point\",\"coordinates\":[2.349014,48.864716]}"
        }
        const response = await fetch(reqCities, {  method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(data),
            redirect: 'follow'
        });
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                ToDelete = json
                expect(typeof json).toBe('number');
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })


    const reqX = baseURL+ "/cities/<id>";
    it('Test GET by ID GET ' + reqX, async () => {
        const req1 = baseURL+ "/cities/" + ToDelete;
        const response = await fetch(req1);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.id).toBe(ToDelete);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    const req8 = baseURL+ "/cities/:id?f=geojson";
    it("Test GeoJSON format GET " + req8, async () => {
        const req = baseURL+ `/cities/${ToDelete}?f=geojson`;

        const response = await fetch(req);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.type).toBe("Feature");
                expect(json.properties).toBeInstanceOf(Object);
                expect(json.geometry).toBeInstanceOf(Object);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })


    const req2 = baseURL+ "/cities/309276";
    it("Test Not found GET " + req2, async () => {
        const response = await fetch(req2);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.id).toBe(309276);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(response.status).toBe(404);
        }
    })

    const req3 = baseURL+ "/cities?limit=10";
    it("Test limit GET " + req3, async () => {
        const response = await fetch(req3);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.length).toBe(10);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    it("Test PUT " + reqCities, async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const data = {
            "id":ToDelete,
            "name":"BrusselsX",
            "description":"village",
            "population":100000,
            "geometry":"{\"type\":\"Point\",\"coordinates\":[4.34878,50.85045]}"
        }
        const response = await fetch(reqCities, {  method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify(data),
            redirect: 'follow'
        });
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json).toBe(ToDelete);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    it("Test PATCH " + reqCities, async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const data = {
            "id":ToDelete,
            "name":"BrusselsY",
        }
        const response = await fetch(reqCities, {  method: 'PATCH',
            headers: myHeaders,
            body: JSON.stringify(data),
            redirect: 'follow'
        });
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json).toBe(ToDelete);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    let req5 = baseURL+ "/cities/<id>";
    it("Test DELETE " + req5, async () => {
        req5 = baseURL+ "/cities/"+ ToDelete;
        const response = await fetch(req5, {
            method: 'DELETE',
            redirect: 'follow'
        });
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json).toBe(true);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })



    const req6 = baseURL+ "/citiesSpatial?bbox=11.403882613956075,48.05050852663266,11.689117085660317,48.21482137789209";
    it("Test Bounding box GET " + req6, async () => {
        const response = await fetch(req6);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.length).toBe(2);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })

    const req7 = baseURL+ "/citiesSpatial?bbox=11.403882613956075,48.05050852663266,11.689117085660317,48.21482137789209&f=geojson";
    it("Test GeoJSON format GET " + req7, async () => {
        const response = await fetch(req7);
        if (response.status===200) {
            const json = await response.json();
            if(json) {
                expect(json.type).toBe("FeatureCollection");
                expect(json.features.length).toBe(2);
            } else {
                expect(false).toBe(true);
            }
        } else {
            expect(false).toBe(true);
        }
    })





});