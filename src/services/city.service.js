const { CityRepository } = require("../repositories/city.repository");

const CityService = {
  async getAllCities() {
    return CityRepository.getAll();
  },
};

module.exports = {
  CityService,
};