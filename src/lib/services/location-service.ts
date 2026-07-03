import { ApplicationService } from "./base/application-service";
import { LocationRepository } from "@/lib/repositories/location-repository";
import { ConflictError, NotFoundError } from "@/lib/errors";

export class LocationService extends ApplicationService {
  constructor(private readonly locationRepository: LocationRepository) {
    super("service/location");
  }

  // Country
  async listCountries() {
    return this.locationRepository.findAllCountries();
  }

  async getCountry(id: string) {
    const res = await this.locationRepository.findCountryById(id);
    if (!res) {
      throw new NotFoundError("Country not found");
    }
    return res;
  }

  async createCountry(input: { name: string; code: string }) {
    const existing = await this.locationRepository.findCountryByCode(input.code);
    if (existing) {
      throw new ConflictError("A country with this code already exists");
    }
    return this.locationRepository.createCountry(input);
  }

  async updateCountry(id: string, input: { name?: string; code?: string }) {
    const res = await this.locationRepository.findCountryById(id);
    if (!res) {
      throw new NotFoundError("Country not found");
    }
    return this.locationRepository.updateCountry(id, input);
  }

  async deleteCountry(id: string) {
    const res = await this.locationRepository.findCountryById(id);
    if (!res) {
      throw new NotFoundError("Country not found");
    }
    return this.locationRepository.deleteCountry(id);
  }

  // State
  async listStates(countryId: string) {
    return this.locationRepository.findStatesByCountry(countryId);
  }

  async getState(id: string) {
    const res = await this.locationRepository.findStateById(id);
    if (!res) {
      throw new NotFoundError("State not found");
    }
    return res;
  }

  async createState(input: { name: string; code?: string; countryId: string }) {
    const country = await this.locationRepository.findCountryById(input.countryId);
    if (!country) {
      throw new NotFoundError("Country not found");
    }
    const existing = await this.locationRepository.findStateByName(input.countryId, input.name);
    if (existing) {
      throw new ConflictError("State name must be unique in country");
    }
    return this.locationRepository.createState(input);
  }

  async updateState(id: string, input: { name?: string; code?: string }) {
    const res = await this.locationRepository.findStateById(id);
    if (!res) {
      throw new NotFoundError("State not found");
    }
    return this.locationRepository.updateState(id, input);
  }

  async deleteState(id: string) {
    const res = await this.locationRepository.findStateById(id);
    if (!res) {
      throw new NotFoundError("State not found");
    }
    return this.locationRepository.deleteState(id);
  }

  // District
  async listDistricts(stateId: string) {
    return this.locationRepository.findDistrictsByState(stateId);
  }

  async getDistrict(id: string) {
    const res = await this.locationRepository.findDistrictById(id);
    if (!res) {
      throw new NotFoundError("District not found");
    }
    return res;
  }

  async createDistrict(input: { name: string; stateId: string }) {
    const state = await this.locationRepository.findStateById(input.stateId);
    if (!state) {
      throw new NotFoundError("State not found");
    }
    const existing = await this.locationRepository.findDistrictByName(input.stateId, input.name);
    if (existing) {
      throw new ConflictError("District name must be unique in state");
    }
    return this.locationRepository.createDistrict(input);
  }

  async updateDistrict(id: string, input: { name?: string }) {
    const res = await this.locationRepository.findDistrictById(id);
    if (!res) {
      throw new NotFoundError("District not found");
    }
    return this.locationRepository.updateDistrict(id, input);
  }

  async deleteDistrict(id: string) {
    const res = await this.locationRepository.findDistrictById(id);
    if (!res) {
      throw new NotFoundError("District not found");
    }
    return this.locationRepository.deleteDistrict(id);
  }

  // City
  async listCities(districtId: string) {
    return this.locationRepository.findCitiesByDistrict(districtId);
  }

  async getCity(id: string) {
    const res = await this.locationRepository.findCityById(id);
    if (!res) {
      throw new NotFoundError("City not found");
    }
    return res;
  }

  async createCity(input: { name: string; districtId: string }) {
    const dist = await this.locationRepository.findDistrictById(input.districtId);
    if (!dist) {
      throw new NotFoundError("District not found");
    }
    const existing = await this.locationRepository.findCityByName(input.districtId, input.name);
    if (existing) {
      throw new ConflictError("City name must be unique in district");
    }
    return this.locationRepository.createCity(input);
  }

  async updateCity(id: string, input: { name?: string }) {
    const res = await this.locationRepository.findCityById(id);
    if (!res) {
      throw new NotFoundError("City not found");
    }
    return this.locationRepository.updateCity(id, input);
  }

  async deleteCity(id: string) {
    const res = await this.locationRepository.findCityById(id);
    if (!res) {
      throw new NotFoundError("City not found");
    }
    return this.locationRepository.deleteCity(id);
  }

  // Area
  async listAreas(cityId: string) {
    return this.locationRepository.findAreasByCity(cityId);
  }

  async getArea(id: string) {
    const res = await this.locationRepository.findAreaById(id);
    if (!res) {
      throw new NotFoundError("Area not found");
    }
    return res;
  }

  async createArea(input: { name: string; postalCode?: string; cityId: string }) {
    const city = await this.locationRepository.findCityById(input.cityId);
    if (!city) {
      throw new NotFoundError("City not found");
    }
    const existing = await this.locationRepository.findAreaByName(input.cityId, input.name);
    if (existing) {
      throw new ConflictError("Area name must be unique in city");
    }
    return this.locationRepository.createArea(input);
  }

  async updateArea(id: string, input: { name?: string; postalCode?: string }) {
    const res = await this.locationRepository.findAreaById(id);
    if (!res) {
      throw new NotFoundError("Area not found");
    }
    return this.locationRepository.updateArea(id, input);
  }

  async deleteArea(id: string) {
    const res = await this.locationRepository.findAreaById(id);
    if (!res) {
      throw new NotFoundError("Area not found");
    }
    return this.locationRepository.deleteArea(id);
  }
}
