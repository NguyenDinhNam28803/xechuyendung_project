function doPost(event) {
  const properties = PropertiesService.getScriptProperties();
  const expectedSecret = properties.getProperty("SHARED_SECRET");
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");

  if (!expectedSecret || !spreadsheetId) {
    console.error("Missing SHARED_SECRET or SPREADSHEET_ID script property.");
    return jsonResponse({ ok: false });
  }

  let submission;
  try {
    submission = JSON.parse(event.postData.contents);
  } catch (error) {
    console.error("Invalid JSON received by contact endpoint.", error);
    return jsonResponse({ ok: false });
  }

  if (!submission || submission.secret !== expectedSecret || submission.consent !== true) {
    return jsonResponse({ ok: false });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheets()[0];
    const headers = [
      "Thời gian nhận",
      "Họ và tên",
      "Số điện thoại",
      "Dòng xe quan tâm",
      "Tỉnh / thành phố",
      "Nhu cầu",
      "Xe đang quan tâm",
      "Đồng ý lưu và phản hồi",
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    sheet.appendRow([
      new Date(),
      safeCell(submission.name),
      safeCell(submission.phone),
      safeCell(submission.category),
      safeCell(submission.location),
      safeCell(submission.message),
      safeCell(submission.vehicleName),
      "Có",
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Unable to append contact submission to the spreadsheet.", error);
    return jsonResponse({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function safeCell(value) {
  const text = String(value || "");
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
