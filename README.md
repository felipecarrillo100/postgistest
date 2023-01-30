# postgistest

## Description
This sample shows how to create a REST API to store features in a POSTGRES/POSTGIS Database.


### Approach
The features are stored in a database table called poi. Each feature is a row in the table.
The row contains multiple columns whe one column in particular named geom contains the geometry.

This example was designed to store 2D Point geometries in EPSG:4326 and for this it defines  geom as
"geom geometry(Point,4326)". To increase the speed on geospatial queries a geospatial index is created for geom.

This is the definition used for the table.

```sql
    CREATE TABLE IF NOT EXISTS poi 
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(128) NOT NULL ,
       description VARCHAR(1024) ,
       population integer ,
       geom geometry(Point,4326)
    );
    CREATE INDEX IF NOT EXISTS sidx_poi_geom
        ON poi USING gist (geom)
        TABLESPACE pg_default;
```

The table is created automatically by the application if it not exists.
Points are added, updated, patched or deleted using the API.  You can also search points by text ot by bounding box.

### Scripts
    npm install: Install all the dependencies
    npm run dev: Run in developer mod
    npm run build: Compile the code for production
    npm start: Runs production code. It requires that "npm run build" was ran first to producte the production code
    npm run test: Test that the code works as expected. It requires that the servers is already running with "npm run dev" or "npm start" 
### Available calls with examples
```
    √ DELETE All elements: DELETE http://localhost:3000/api/citiesClear (82 ms)
    √ Add Element:  POST http://localhost:3000/api/cities (8 ms)
    √ GET Element by ID: GET http://localhost:3000/api/cities/<id> (8 ms)
    √ GET Element by ID  output in GeoJSON format: GET http://localhost:3000/api/cities/:id?f=geojson (8 ms)
    √ Get all elements: GET http://localhost:3000/api/cities (8 ms)
    √ Get a maximum number of elements: GET http://localhost:3000/api/cities?limit=10 (8 ms)
    √ Replace Element: PUT http://localhost:3000/api/cities (9 ms)
    √ Modify Element: PATCH http://localhost:3000/api/cities (9 ms)
    √ Delete element: DELETE http://localhost:3000/api/cities/<id> (8 ms)
    √ Query element using bbox: GET http://localhost:3000/api/citiesSpatial?bbox=11.403882613956075,48.05050852663266,11.689117085660317,48.21482137789209 (8 ms)
    √ Query element using bbox, outout in GeoJSON format: GET http://localhost:3000/api/citiesSpatial?bbox=11.403882613956075,48.05050852663266,11.689117085660317,48.21482137789209&f=geojson (
```

## Prerequisites
The sample creates the table automatically but it expects that the database already exists.
For this you need to create the table in advance as follows.

* Install POSTGRES with POSTGIS
* Create a user named wkuser with password wkpassword
* Create a database called 'wkdatabase' and make user 'wkuser' the owner of the database
* Run the postgis extension on your database 'wkdatabase' 


# Testing

This sample uses JEST to test.
```
npm run test
```

