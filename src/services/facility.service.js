const facilityRepo = require("../repositories/facility.repository");

module.exports = {
  getFacilityList: async (filters) => {
    return await facilityRepo.getFacilityList(filters);
  },
  
  getFacilityDetailsById: async (facilityId) => {
    return await facilityRepo.getFacilityDetailsById(facilityId);
  },

  editFacility: async (facilityId, updateData) => {
    return await facilityRepo.editFacility(facilityId, updateData);
  },
};
