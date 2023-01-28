
class Cities {
    private name: string | undefined;
    private description: string | undefined;
    private geometry: string | undefined;
    private population: number | undefined;
    private id?: number;

    constructor() {
    }

    setName(name: string) {
        this.name =  name;
    }

    getName() {
        return this.name;
    }

    setDescription(description: string) {
        this.description = description
    }

    getDescription() {
        return this.description
    }


    setId(id: number) {
        this.id = Number(id);
    }

    getId() {
        return this.id;
    }

    setPopulation(population: number) {
        this.population = population;
    }

    getPopulation() {
        return this.population;
    }

    setGeometry(geometry:string){
        this.geometry = geometry;
    }

    getGeometry() {
        return this.geometry
    }
}

export {
    Cities
}