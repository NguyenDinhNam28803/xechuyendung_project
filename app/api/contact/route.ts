import { contactVehicleCategories, getVehicleBySlug } from "../../data/vehicles";

const allowedCategories = new Set<string>(contactVehicleCategories);

type ContactSubmission = {
  name: string;
  phone: string;
  category: string;
  location: string;
  message: string;
  vehicleSlug: string;
  companyWebsite: string;
  consent: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maximumLength ? text : null;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return jsonError("Nội dung gửi lên quá lớn.", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Dữ liệu gửi lên không hợp lệ.", 400);
  }

  if (!isRecord(body)) {
    return jsonError("Dữ liệu gửi lên không hợp lệ.", 400);
  }

  const name = readText(body.name, 100);
  const phone = readText(body.phone, 20);
  const category = readText(body.category, 80);
  const location = readText(body.location, 80);
  const message = readText(body.message, 1_000);
  const vehicleSlug = readText(body.vehicleSlug, 120);
  const companyWebsite = readText(body.companyWebsite, 200);
  const consent = body.consent === true;

  if (
    name === null ||
    phone === null ||
    category === null ||
    location === null ||
    message === null ||
    vehicleSlug === null ||
    companyWebsite === null ||
    !consent
  ) {
    return jsonError("Vui lòng kiểm tra lại các trường thông tin.", 400);
  }

  if (companyWebsite) {
    return jsonError("Không thể tiếp nhận yêu cầu này.", 400);
  }

  if (!name || !/^[+()\d\s.-]{8,20}$/.test(phone) || phone.replace(/\D/g, "").length < 8) {
    return jsonError("Vui lòng nhập họ tên và số điện thoại hợp lệ.", 400);
  }

  if (!allowedCategories.has(category)) {
    return jsonError("Dòng xe quan tâm không hợp lệ.", 400);
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const sharedSecret = process.env.GOOGLE_SHEETS_SHARED_SECRET;
  if (!scriptUrl || !sharedSecret) {
    console.error("Contact form is not configured: missing Google Sheets environment variables.");
    return jsonError("Biểu mẫu chưa được cấu hình. Vui lòng liên hệ với chúng tôi bằng kênh khác.", 503);
  }

  let endpoint: URL;
  try {
    endpoint = new URL(scriptUrl);
  } catch {
    console.error("Contact form is not configured: GOOGLE_APPS_SCRIPT_URL is not a valid URL.");
    return jsonError("Biểu mẫu hiện chưa khả dụng. Vui lòng thử lại sau.", 503);
  }

  if (endpoint.protocol !== "https:") {
    console.error("Contact form is not configured: GOOGLE_APPS_SCRIPT_URL must use HTTPS.");
    return jsonError("Biểu mẫu hiện chưa khả dụng. Vui lòng thử lại sau.", 503);
  }

  const submission: ContactSubmission = {
    name,
    phone,
    category,
    location,
    message,
    vehicleSlug,
    companyWebsite,
    consent,
  };
  const vehicle = getVehicleBySlug(submission.vehicleSlug);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submission,
        vehicleName: vehicle?.name ?? "",
        secret: sharedSecret,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const result: unknown = await response.json();
    if (!response.ok || !isRecord(result) || result.ok !== true) {
      console.error("Google Sheets did not confirm saving a contact submission.", {
        status: response.status,
      });
      return jsonError("Chưa thể lưu yêu cầu của bạn. Vui lòng thử lại sau.", 502);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to forward a contact submission to Google Sheets.", error);
    return jsonError("Không thể kết nối để lưu yêu cầu. Vui lòng thử lại sau.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
