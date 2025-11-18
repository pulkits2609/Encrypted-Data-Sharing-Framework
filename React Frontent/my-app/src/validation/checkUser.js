// utils/checkUser.js

export async function checkUser() {
  const token = localStorage.getItem("userToken");

  if (!token) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("userToken");
    window.location.href = "/";
    return null;
  }

  try {
    const response = await fetch("https://dsapi.pulkitworks.info/JWTverifier/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!data.success || !data.decoded) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("userToken");
      window.location.href = "/";
      return null;
    }

    return data.decoded;

  } catch (err) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("userToken");
    window.location.href = "/";
    return null;
  }
}
