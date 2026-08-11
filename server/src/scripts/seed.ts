import dotenv from "dotenv";
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User, UserRole } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Wallet } from '../models/Wallet.js';
import { Equipment } from '../models/Equipment.js';
import { Category } from '../models/Category.js';
import { Scheme, SchemeType } from '../models/Scheme.js';
import { KYC, KYCStatus } from '../models/KYC.js';

const seedDatabase = async () => {
  try {
    console.log('Seeding Kisan Setu database...');
    
    // Connect to database
    await connectDB();

    // Clear existing data
    await Category.deleteMany({});
    await Scheme.deleteMany({});
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Wallet.deleteMany({});
    await Equipment.deleteMany({});
    await KYC.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Seed Categories
    const categories = [
      { name: 'Tractors', slug: 'tractors', description: 'Utility and compact tractors for plowing, tilling and hauling.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/tractors.jpg' },
      { name: 'Harvesters', slug: 'harvesters', description: 'Combine harvesters for cutting and threshing grains.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/harvesters.jpg' },
      { name: 'Cultivators', slug: 'cultivators', description: 'Tillage machinery to stir and pulverize soil.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/cultivators.jpg' },
      { name: 'Seeders', slug: 'seeders', description: 'Precision seed drills and planters for row sowing.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/seeders.jpg' },
      { name: 'Spraying Drones', slug: 'drones', description: 'Unmanned aerial vehicles for fertilizer and pesticide spraying.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/drones.jpg' },
      { name: 'Irrigation Pumps', slug: 'pumps', description: 'High-volume water pumps for crop irrigation systems.', image: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/categories/pumps.jpg' },
    ];
    await Category.insertMany(categories);
    console.log('Seeded equipment categories.');

    // 2. Seed Schemes
    const schemes = [
      {
        title: 'PM Kisan Samman Nidhi',
        description: 'An initiative by the government of India providing financial aid to small and marginal farmers.',
        benefitDetails: 'Direct benefit transfer of INR 6,000 per year in three equal installments directly into bank accounts.',
        eligibilityCriteria: 'All small and marginal landholding farmer families who hold cultivable land.',
        type: SchemeType.SCHEME,
        governmentUrl: 'https://pmkisan.gov.in',
        crops: ['Wheat', 'Rice', 'Maize'],
        states: ['All'],
      },
      {
        title: 'Subsidies for Agricultural Drones',
        description: 'Financial assistance for purchasing advanced drones to boost precision spraying and crop mapping.',
        benefitDetails: 'Subsidies up to 50% or maximum INR 5 Lakhs for small, marginal, and women farmers.',
        eligibilityCriteria: 'Individual farmers holding valid agricultural land and drone pilot licenses.',
        type: SchemeType.SUBSIDY,
        governmentUrl: 'https://agricoop.nic.in',
        crops: ['Cotton', 'Sugarcane', 'Soybean'],
        states: ['Punjab', 'Haryana', 'Uttar Pradesh'],
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Comprehensive yield-based crop insurance scheme to protect farmers from natural disasters.',
        benefitDetails: 'Low premium rates (1.5% to 2%) with full sum insured coverage for crop losses due to drought, pests, or flood.',
        eligibilityCriteria: 'All farmers growing notified crops in notified areas including sharecroppers.',
        type: SchemeType.INSURANCE,
        governmentUrl: 'https://pmfby.gov.in',
        crops: ['Rice', 'Wheat', 'Pulses', 'Oilseeds'],
        states: ['All'],
      },
      {
        title: 'Kisan Credit Card (KCC) Loan',
        description: 'Provides timely short-term credit to meet production needs, purchases, and post-harvest expenses.',
        benefitDetails: 'Short term loans up to INR 3 Lakhs at low interest rates (4% after prompt repayment subvention).',
        eligibilityCriteria: 'All owner-cultivators, tenant farmers, and self-help groups of farmers.',
        type: SchemeType.LOAN,
        governmentUrl: 'https://www.rbi.org.in',
        crops: ['All'],
        states: ['All'],
      },
    ];
    await Scheme.insertMany(schemes);
    console.log('Seeded government agricultural schemes.');

    // 3. Seed Users (Admin, Farmer Owner, Farmer Customer, Call Center, Moderator)
    // Passwords are pre-hashed automatically by User model middleware
    const usersData = [
      { name: 'System Admin', phone: '9999999999', email: 'admin@kisansetu.com', password: 'password123', role: UserRole.ADMIN },
      { name: 'Ramesh Singh (Owner)', phone: '9876543210', email: 'ramesh@owner.com', password: 'password123', role: UserRole.FARMER_OWNER },
      { name: 'Suresh Kumar (Renter)', phone: '8765432109', email: 'suresh@customer.com', password: 'password123', role: UserRole.FARMER_CUSTOMER },
      { name: 'Call Center Exec', phone: '7654321098', email: 'support@kisansetu.com', password: 'password123', role: UserRole.CALL_CENTER },
      { name: 'Moderator Reviewer', phone: '6543210987', email: 'moderator@kisansetu.com', password: 'password123', role: UserRole.MODERATOR },
    ];

    for (const u of usersData) {
      const user = new User(u);
      await user.save();

      // Create profile
      await Profile.create({
        userId: user._id,
        farmSize: u.role === UserRole.FARMER_CUSTOMER ? 5.5 : 12,
        cropTypes: u.role === UserRole.FARMER_CUSTOMER ? ['Wheat', 'Rice'] : ['Sugarcane', 'Cotton'],
        languages: ['Hindi', 'Punjabi'],
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Kanganwal',
          pincode: '141014',
        },
      });

      // Create wallet
      await Wallet.create({
        userId: user._id,
        balance: u.role === UserRole.FARMER_OWNER ? 5000 : 1500,
        reservedBalance: 0,
      });

      // Create KYC
      await KYC.create({
        userId: user._id,
        aadhaarNo: `12345678901${u.phone.substring(9)}`,
        panNo: `ABCDE1234${u.phone.substring(9)}`,
        aadhaarUrl: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/kyc/aadhaar_mock.jpg',
        panUrl: 'https://res.cloudinary.com/mock_cloud/image/upload/v123456/kyc/pan_mock.jpg',
        bankDetails: {
          accountNo: '1000987654321',
          ifsc: 'SBIN0001234',
          bankName: 'State Bank of India',
          holderName: user.name,
        },
        status: KYCStatus.APPROVED,
      });
    }
    console.log('Seeded users, profiles, wallets, and KYC approvals.');

    // 4. Seed Verified Equipment listings (for Ramesh Owner)
    const owner = await User.findOne({ role: UserRole.FARMER_OWNER });
    if (owner) {
      const equipmentData = [
        {
          ownerId: owner._id,
          name: 'John Deere 5050D Tractor',
          category: 'Tractors',
          brand: 'John Deere',
          condition: 'Excellent',
          description: '50 HP utility tractor, highly reliable for heavy plowing and transport. Serviced recently.',
          hourlyPrice: 200,
          dailyPrice: 1500,
          weeklyPrice: 9000,
          images: ['https://res.cloudinary.com/mock_cloud/image/upload/v123456/equipments/tractor1.jpg'],
          location: {
            type: 'Point',
            coordinates: [75.8573, 30.9010], // Ludhiana
          },
          address: {
            state: 'Punjab',
            district: 'Ludhiana',
            village: 'Kanganwal',
            pincode: '141014',
          },
          insuranceStatus: KYCStatus.APPROVED,
          verificationStatus: KYCStatus.APPROVED,
          rating: 4.8,
          reviewsCount: 12,
        },
        {
          ownerId: owner._id,
          name: 'Mahindra Arjun Novo Harvester',
          category: 'Harvesters',
          brand: 'Mahindra',
          condition: 'Good',
          description: 'High-speed combined grain harvester. Perfect for paddy and wheat fields.',
          hourlyPrice: 600,
          dailyPrice: 4500,
          weeklyPrice: 28000,
          images: ['https://res.cloudinary.com/mock_cloud/image/upload/v123456/equipments/harvester1.jpg'],
          location: {
            type: 'Point',
            coordinates: [75.8573, 30.9010],
          },
          address: {
            state: 'Punjab',
            district: 'Ludhiana',
            village: 'Kanganwal',
            pincode: '141014',
          },
          insuranceStatus: KYCStatus.APPROVED,
          verificationStatus: KYCStatus.APPROVED,
          rating: 4.5,
          reviewsCount: 8,
        },
      ];

      await Equipment.insertMany(equipmentData);
      console.log('Seeded verified equipment listings.');
    }

    console.log('Database seeding completed successfully.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
