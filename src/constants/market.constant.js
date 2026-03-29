const { z } = require("zod");

const MarketType = {
  PERMANENT: "PERMANENT",
  TEMPORARY: "TEMPORARY",
  POP_UP: "POP_UP",
  WEEKLY_BAZAAR: "WEEKLY_BAZAAR",
  SEASONAL: "SEASONAL",
};

const MarketStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
};

const MarketTypeEnum = z.enum(Object.values(MarketType));

const MarketStatusEnum = z.enum(Object.values(MarketStatus));

module.exports = {
  MarketType,
  MarketStatus,
  MarketTypeEnum,
  MarketStatusEnum,
};