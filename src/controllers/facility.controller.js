const { NotFoundError } = require("../errors/app.errors");
const facilityService = require("../services/facility.service");
const { asyncHandler, ApiResponse } = require("../utils");


module.exports = {
  getFacilities: asyncHandler(async (req, res) => {
    const result = await facilityService.getFacilityList(req.query);
    res.status(200).json(
        new ApiResponse(
            {
                statusCode: 200,
                success: true,
                data: result.facilities,
                pagination: result.pagination,
                message: "Facility list fetched successfully"
            }
        )
    )
  }),
  
  getFacilityDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await facilityService.getFacilityDetailsById(id);
    
    if (!result) {
        throw new NotFoundError("Facility not found")
    }    
    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: result,
        message: "Facility details fetched successfully"
      })
    );
  }),

  editFacility: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingFacility = await facilityService.getFacilityDetailsById(id);
    if (!existingFacility) {
      throw new NotFoundError("Facility not found");
    }

    const updatedFacility = await facilityService.editFacility(id, updateData);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: updatedFacility,
        message: "Facility updated successfully"
      })
    );
  }),

  checkAvailability: asyncHandler(async (req, res) => {
    const { marketId, unitNumber } = req.query;

    if (!marketId || !unitNumber) {
      return res.status(400).json({ success: false, message: "Market ID and Unit Number are required" });
    }

    const facility = await prisma.facility.findFirst({
      where: { 
        marketId, 
        unitNumber,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        occupationStatus: true,
        facilityName: true
      }
    });

    if (!facility) {
      return res.status(200).json({ 
        success: true, 
        data: { exists: false, occupied: false } 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: { 
        exists: true, 
        occupied: facility.occupationStatus !== 'VACANT',
        facilityId: facility.id,
        name: facility.facilityName
      } 
    });
  }),
};
