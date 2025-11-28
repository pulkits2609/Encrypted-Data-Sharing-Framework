// utils/checkManager.js

export async function checkManager() {
  const token = localStorage.getItem("managerToken");

  if (!token) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("managerToken");
    window.location.href = "/";
    return null;
  }

  try {
    const response = await fetch("https://jwtverify.pulkitworks.info/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (
      !data.success ||
      !data.decoded ||
      (data.decoded.role.toLowerCase() !== "manager" &&
        data.decoded.role.toLowerCase() !== "admin")
    ) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("managerToken");
      window.location.href = "/";
      return null;
    }

    return data.decoded;

  } catch (err) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("managerToken");
    window.location.href = "/";
    return null;
  }
}
