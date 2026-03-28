import { z } from "zod";
import { MarketStatusEnum, MarketTypeEnum } from "../constants/market.constant";

export const createMarketSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    cityId: z.string(),
    address: z.string().min(5),
    marketType: MarketTypeEnum,
  }),
});

export const updateGeneralSchema = z.object({
  params: z.object({ marketId: z.uuid() }),         
  body: z.object({
    displayName: z.string().optional(),
    description: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.email().optional(),              
    website: z.url().optional(),                     
    managerName: z.string().optional(),
    status: MarketStatusEnum,
  }),
});

export const updateOperatingSchema = z.object({
  params: z.object({ marketId: z.uuid() }),         
  body: z.object({
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    operatingDays: z.array(z.string()).optional(),
    is24Hours: z.boolean().optional(),
    holidaySchedule: z.any().optional(),
  }),
});

export const updateCapacitySchema = z.object({
  params: z.object({ marketId: z.uuid() }),          
  body: z.object({
    totalLevels: z.number().int().optional(),
    totalSections: z.number().int().optional(),
    totalShops: z.number().int().optional(),
    totalStalls: z.number().int().optional(),
    occupiedShops: z.number().int().optional(),
    occupiedStalls: z.number().int().optional(),
    maxCapacity: z.number().optional(),
    averageRent: z.number().optional(),
    securityDeposit: z.number().optional(),
    monthlyMaintenanceFee: z.number().optional(),
  }),
});