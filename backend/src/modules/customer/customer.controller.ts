import { Request, Response , NextFunction} from "express";
import {
  RegisterCustomer,
  verifyCustomerEmail,
  resendCustomerVerification,
} from "./customer.service";
import { NotFoundError, UnauthorizedError } from "../../utils/error";
import { prisma } from "../../config/database";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName,
    lastName,
    middleName,
    email,
    password,
    gender,
    phoneNumber,
    position,
    organizationId,
  } = req.body;

  if (
    !firstName ||
    !middleName ||
    !email ||
    !password ||
    !gender ||
    !phoneNumber ||
    !position ||
    !organizationId
  ) {
    res.status(400).json({
      error: "All fields are required.",
    });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: "Invalid email format string provided." });
    return;
  }

  if (password.trim().length < 8) {
    res.status(400).json({
      error:
        "Password fails complexity rule. Must contain at least 8 characters.",
    });
    return;
  }

  const cleanPhoneNumber = phoneNumber?.trim();
  if (!/^\+251\d{9}$/.test(cleanPhoneNumber)) {
    res.status(400).json({
      error: "Phone number must start with +251 and contain 12 digits without the + sign.",
    });
    return;
  }

  if (firstName.trim().length < 2) {
    res.status(400).json({ error: "First name parameter is too short." });
    return;
  }


  if (gender !== "MALE" && gender !== "FEMALE") {
    res.status(400).json({ error: "Gender must be either MALE or FEMALE." });
    return;
  }

  try {
    const result = await RegisterCustomer({
      firstName: firstName.trim(),
      lastName: lastName?.trim(),
      middleName: middleName.trim(),
      email: email.trim().toLowerCase(),
      passwordPlain: password,
      gender,
      phoneNumber: cleanPhoneNumber,
      position: position.trim(),
      organizationId,
    });

    res.status(201).json({
      message:
        "Registration successful! Please look inside your inbox to confirm your email.",
      customerId: result.customerId,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Registration processing failed." });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.query.token || req.body.token;

  if (!token || typeof token !== "string" || token.length !== 64) {
    res.status(400).json({
      error: "A valid 64-character hexadecimal verification token is required.",
    });
    return;
  }

  try {
    const confirmation = await verifyCustomerEmail(token);
    res.status(200).json({
      message:
        "Email successfully verified. Your account is Waiting for Admin Approval",
      details: confirmation,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Verification route encountered an error.",
    });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    res
      .status(400)
      .json({ error: "A valid email format structure is required." });
    return;
  }

  try {
    await resendCustomerVerification(email.trim().toLowerCase());

    res.status(200).json({
      message:
        "If a matching account was found, a fresh verification link has been delivered.",
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Resend processing failed." });
  }
};

/* export const handleGetCustomerHistory = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const paramCustomerId = req.params.customerId as string;

    let targetCustomerId: string;

    if (actor.isCustomer) {
      targetCustomerId = actor.userId;
    } else if (
      actor.isSAdmin ||
      actor.role?.includes("MANAGER") ||
      actor.role === "PS_SUPPORT"
    ) {
      if (!paramCustomerId) {
        throw new BadRequestError(
          "A specific customerId parameter must be provided.",
        );
      }
      targetCustomerId = paramCustomerId;
    } else {
      throw new ForbiddenError(
        "Access Denied: You are not authorized to view this customer history dashboard.",
      );
    }

    const result =
      await CustomerService.getCustomerCaseHistory(targetCustomerId);

    res.status(200).json({
      customerProfile: {
        id: result.id,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        memberSince: result.createdAt,
      },
      caseCount: result.cases.length,
      history: result.cases,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}; */


export const getCustomerHistoryProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user?.id || (req as any).user?.userId;

    if (!customerId) {
      throw new UnauthorizedError("Access denied. No authenticated customer ID was found.");
    }

    let customer;
    try {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          organization: { select: { name: true } },
          cases: {
            orderBy: { createdAt: "desc" },
            include: {
              statusHistory: { orderBy: { id: "desc" } },
              assignedSupport: {
                select: { id: true, firstName: true, lastName: true },
              },
              productCategory: { select: { id: true, name: true } },
              productSubcategory: { select: { id: true, name: true } },
              feedback: { select: { rating: true, comment: true, submittedAt: true } },
            },
          },
        },
      });
    } catch (err: any) {
      // If Prisma schema is out-of-sync with the database (missing columns), fall back to a safer query without statusHistory
      if (err?.code === 'P2022') {
        // load customer (without cases)
        customer = await prisma.customer.findUnique({
          where: { id: customerId },
          include: { organization: { select: { name: true } } },
        });

        if (customer) {
          const cases = await prisma.caseReport.findMany({
            where: { customerId: customerId },
            orderBy: { createdAt: 'desc' },
            include: {
              assignedSupport: { select: { id: true, firstName: true, lastName: true } },
              productCategory: { select: { id: true, name: true } },
              productSubcategory: { select: { id: true, name: true } },
              feedback: { select: { rating: true, comment: true, submittedAt: true } },
            },
          });

          (customer as any).cases = cases;
        }
      } else {
        throw err;
      }
    }

    if (!customer) {
      throw new NotFoundError("Target customer profile could not be located.");
    }

    const customerWithCases = customer as any;

    return res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          memberNumber: customer.memberNumber,
          firstName: customer.firstName,
          middleName: customer.middleName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          position: customer.position,
          gender: customer.gender,
          organizationName: customer.organization?.name || null,
          createdAt: customer.createdAt,
        },
        history: customerWithCases.cases || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

