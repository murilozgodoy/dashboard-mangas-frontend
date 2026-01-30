export const config = {
  apiBaseUrl:
    typeof window !== "undefined" && (window.location.port === "5173" || window.location.port === "3000")
      ? "http://localhost:8002"
      : "",
}
