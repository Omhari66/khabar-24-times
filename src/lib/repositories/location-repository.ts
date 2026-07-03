import { PrismaRepository } from "./base/prisma-repository";

export class LocationRepository extends PrismaRepository {
  // Countries
  async findCountryById(id: string) {
    return this.prisma.country.findUnique({ where: { id } });
  }

  async findCountryByCode(code: string) {
    return this.prisma.country.findUnique({ where: { code } });
  }

  async findAllCountries() {
    return this.prisma.country.findMany();
  }

  async createCountry(data: { name: string; code: string }) {
    return this.prisma.country.create({ data });
  }

  async updateCountry(id: string, data: { name?: string; code?: string }) {
    return this.prisma.country.update({ where: { id }, data });
  }

  async deleteCountry(id: string) {
    return this.prisma.country.delete({ where: { id } });
  }

  // States
  async findStateById(id: string) {
    return this.prisma.state.findUnique({ where: { id } });
  }

  async findStateByName(countryId: string, name: string) {
    return this.prisma.state.findUnique({
      where: {
        countryId_name: { countryId, name },
      },
    });
  }

  async findStatesByCountry(countryId: string) {
    return this.prisma.state.findMany({ where: { countryId } });
  }

  async createState(data: { name: string; code?: string; countryId: string }) {
    return this.prisma.state.create({ data });
  }

  async updateState(id: string, data: { name?: string; code?: string }) {
    return this.prisma.state.update({ where: { id }, data });
  }

  async deleteState(id: string) {
    return this.prisma.state.delete({ where: { id } });
  }

  // Districts
  async findDistrictById(id: string) {
    return this.prisma.district.findUnique({ where: { id } });
  }

  async findDistrictByName(stateId: string, name: string) {
    return this.prisma.district.findUnique({
      where: {
        stateId_name: { stateId, name },
      },
    });
  }

  async findDistrictsByState(stateId: string) {
    return this.prisma.district.findMany({ where: { stateId } });
  }

  async createDistrict(data: { name: string; stateId: string }) {
    return this.prisma.district.create({ data });
  }

  async updateDistrict(id: string, data: { name?: string }) {
    return this.prisma.district.update({ where: { id }, data });
  }

  async deleteDistrict(id: string) {
    return this.prisma.district.delete({ where: { id } });
  }

  // Cities
  async findCityById(id: string) {
    return this.prisma.city.findUnique({ where: { id } });
  }

  async findCityByName(districtId: string, name: string) {
    return this.prisma.city.findUnique({
      where: {
        districtId_name: { districtId, name },
      },
    });
  }

  async findCitiesByDistrict(districtId: string) {
    return this.prisma.city.findMany({ where: { districtId } });
  }

  async createCity(data: { name: string; districtId: string }) {
    return this.prisma.city.create({ data });
  }

  async updateCity(id: string, data: { name?: string }) {
    return this.prisma.city.update({ where: { id }, data });
  }

  async deleteCity(id: string) {
    return this.prisma.city.delete({ where: { id } });
  }

  // Areas
  async findAreaById(id: string) {
    return this.prisma.area.findUnique({ where: { id } });
  }

  async findAreaByName(cityId: string, name: string) {
    return this.prisma.area.findUnique({
      where: {
        cityId_name: { cityId, name },
      },
    });
  }

  async findAreasByCity(cityId: string) {
    return this.prisma.area.findMany({ where: { cityId } });
  }

  async createArea(data: { name: string; postalCode?: string; cityId: string }) {
    return this.prisma.area.create({ data });
  }

  async updateArea(id: string, data: { name?: string; postalCode?: string }) {
    return this.prisma.area.update({ where: { id }, data });
  }

  async deleteArea(id: string) {
    return this.prisma.area.delete({ where: { id } });
  }
}
