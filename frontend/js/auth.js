function getUser() {
  return {
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    username: localStorage.getItem("username"),
    name: localStorage.getItem("name")
  };
}

function requireAuth() {
  const user = getUser();

  if (!user.token) {
    window.location.href = "login.html";
  }

  return user;
}

function redirectByRole(role) {
  if (role === "admin") return "admin.html";
  if (role === "expert") return "dashboard-expert.html";
  return "dashboard-client.html";
}