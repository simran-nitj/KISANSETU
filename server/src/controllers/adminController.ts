import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { KYC, KYCStatus } from '../models/KYC.js';
import { Equipment, EquipmentStatus } from '../models/Equipment.js';
import { Report, ReportStatus } from '../models/Report.js';
import { User } from '../models/User.js';
import { Notification, NotificationType } from '../models/Notification.js';
import { AdminLog } from '../models/AdminLog.js';

/**
 * List pending KYC documents
 * GET /api/admin/kyc/pending
 */
export const getPendingKYCs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const list = await KYC.find({ status: KYCStatus.PENDING }).populate('userId', 'name phone email');
    return res.status(200).json({ pendingKYCs: list });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject KYC
 * PUT /api/admin/kyc/:id/verify
 */
export const verifyKYC = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, rejectedReason } = req.body; // 'APPROVED' or 'REJECTED'

    if (!Object.values(KYCStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status.' });
    }

    const kyc = await KYC.findByIdAndUpdate(
      id,
      { status, rejectedReason },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ message: 'KYC record not found.' });
    }

    // Notify user
    const title = status === KYCStatus.APPROVED ? 'KYC Verification Approved' : 'KYC Verification Rejected';
    const body = status === KYCStatus.APPROVED
      ? 'Your identity documents are verified. You can now list and rent out equipment.'
      : `Your identity verification failed. Reason: ${rejectedReason || 'Incorrect document uploads'}`;

    await Notification.create({
      userId: kyc.userId,
      title,
      body,
      type: NotificationType.SYSTEM,
    });

    // Log admin action
    await AdminLog.create({
      adminId: req.user?._id,
      action: status === KYCStatus.APPROVED ? 'APPROVE_KYC' : 'REJECT_KYC',
      targetType: 'KYC',
      targetId: kyc._id,
      details: `Set KYC status to ${status} for user ${kyc.userId}`,
    });

    return res.status(200).json({ message: `KYC ${status.toLowerCase()} successfully.`, kyc });
  } catch (error) {
    next(error);
  }
};

/**
 * List pending equipment listings
 * GET /api/admin/equipment/pending
 */
export const getPendingEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const list = await Equipment.find({ verificationStatus: EquipmentStatus.PENDING }).populate(
      'ownerId',
      'name phone'
    );
    return res.status(200).json({ pendingEquipment: list });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject Equipment listings
 * PUT /api/admin/equipment/:id/verify
 */
export const verifyEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!Object.values(EquipmentStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status.' });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }

    // Notify owner
    const title = status === EquipmentStatus.APPROVED ? 'Listing Approved' : 'Listing Rejected';
    const body = status === EquipmentStatus.APPROVED
      ? `Your listing for ${equipment.name} is now live on the marketplace.`
      : `Your listing for ${equipment.name} was rejected during validation review.`;

    await Notification.create({
      userId: equipment.ownerId,
      title,
      body,
      type: NotificationType.SYSTEM,
    });

    // Log admin action
    await AdminLog.create({
      adminId: req.user?._id,
      action: status === EquipmentStatus.APPROVED ? 'APPROVE_EQUIPMENT' : 'REJECT_EQUIPMENT',
      targetType: 'Equipment',
      targetId: equipment._id,
      details: `Set verification status to ${status} for equipment ${equipment.name}`,
    });

    return res.status(200).json({
      message: `Equipment listing ${status.toLowerCase()} successfully.`,
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List abuse / spam reports
 * GET /api/admin/reports
 */
export const getAbuseReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const reports = await Report.find({ status: ReportStatus.PENDING })
      .populate('reporterId', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve report dispute
 * PUT /api/admin/reports/:id/resolve
 */
export const resolveReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { status: ReportStatus.RESOLVED, actionTaken },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Dispute report not found.' });
    }

    // Log action
    await AdminLog.create({
      adminId: req.user?._id,
      action: 'RESOLVE_DISPUTE',
      targetType: 'Report',
      targetId: report._id,
      details: `Resolved dispute report on ${report.targetType}: ${actionTaken}`,
    });

    return res.status(200).json({ message: 'Dispute report marked as resolved.', report });
  } catch (error) {
    next(error);
  }
};

/**
 * Export listings / users to CSV
 * GET /api/admin/export/:type
 */
export const exportData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { type } = req.params; // 'users' or 'equipment'
    
    let csvContent = '';
    
    if (type === 'users') {
      const users = await User.find();
      csvContent = 'ID,Name,Phone,Email,Role,IsBanned,JoinedAt\n';
      users.forEach((u) => {
        csvContent += `"${u._id}","${u.name}","${u.phone}","${u.email || ''}","${u.role}",${u.isBanned},"${u.createdAt.toISOString()}"\n`;
      });
    } else if (type === 'equipment') {
      const equipments = await Equipment.find();
      csvContent = 'ID,Name,Category,Brand,Price,State,District,VerificationStatus\n';
      equipments.forEach((e) => {
        csvContent += `"${e._id}","${e.name}","${e.category}","${e.brand}",${e.dailyPrice},"${e.address.state}","${e.address.district}","${e.verificationStatus}"\n`;
      });
    } else {
      return res.status(400).json({ message: 'Invalid export type. Use users or equipment.' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
