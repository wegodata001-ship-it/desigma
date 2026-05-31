export function paymentStatusLabelHe(status: string): string {
  switch (status) {
    case "PAID":
      return "שולם";
    case "REFUNDED":
      return "הוחזר";
    case "FAILED":
      return "תשלום נכשל";
    case "UNPAID":
    default:
      return "ממתין לתשלום";
  }
}

export function orderStatusLabelHe(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "ממתין לתשלום";
    case "PAID":
      return "שולם";
    case "PAYMENT_FAILED":
      return "תשלום נכשל";
    case "ABANDONED":
      return "נטוש";
    case "CANCELLED":
      return "בוטל";
    case "PENDING":
      return "ממתין";
    case "FAILED":
      return "נכשל";
    default:
      return status;
  }
}

export function fulfillmentStatusLabelHe(status: string): string {
  switch (status) {
    case "PROCESSING":
      return "בטיפול";
    case "PACKED":
      return "ארוזה";
    case "SHIPPED":
      return "נשלחה";
    case "COMPLETED":
      return "הושלמה";
    case "RECEIVED":
    default:
      return "התקבלה";
  }
}

export function formatOrderMoney(amount: number, currency = "ILS"): string {
  if (currency === "ILS") {
    return `₪${amount.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
